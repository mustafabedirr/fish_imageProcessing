from __future__ import annotations

import argparse
import json
from pathlib import Path

import tensorflow as tf

from backend.training.dataset_utils import (
    find_class_directory_root,
    find_fish_data_root,
    is_image_file,
    prepare_fish_data_classification_root,
    prepare_filtered_classification_root,
    safe_extract,
    write_class_names,
)


def parse_args() -> argparse.Namespace:
    root = Path(__file__).resolve().parents[1]

    parser = argparse.ArgumentParser(
        description="Train AquaScope fish classifier with EfficientNetB0."
    )
    parser.add_argument(
        "--dataset-zip",
        type=Path,
        default=Path(r"C:\fish_project\dataset_all.zip"),
        help="Zip file containing one folder per fish species.",
    )
    parser.add_argument(
        "--extract-dir",
        type=Path,
        default=root / "training_runs" / "dataset_all",
        help="Directory where the dataset zip will be extracted.",
    )
    parser.add_argument(
        "--prepared-dir",
        type=Path,
        default=root / "training_runs" / "prepared_classification",
        help="Class-directory dataset prepared from Fish_Data index files.",
    )
    parser.add_argument(
        "--filtered-dir",
        type=Path,
        default=root / "training_runs" / "filtered_classification",
        help="Quality-filtered class-directory dataset used for training.",
    )
    parser.add_argument(
        "--model-out",
        type=Path,
        default=root / "models" / "fish_model.h5",
        help="Final Keras H5 model path used by the FastAPI backend.",
    )
    parser.add_argument(
        "--class-names-out",
        type=Path,
        default=root / "data" / "class_names.json",
        help="JSON class-name list path used by the FastAPI backend.",
    )
    parser.add_argument("--image-size", type=int, default=224)
    parser.add_argument("--batch-size", type=int, default=24)
    parser.add_argument("--epochs", type=int, default=35)
    parser.add_argument("--fine-tune-epochs", type=int, default=15)
    parser.add_argument("--fine-tune-layers", type=int, default=55)
    parser.add_argument(
        "--min-images-per-class",
        type=int,
        default=10,
        help="Drop classes with fewer images. 483 classes with 3-5 images each will not train reliably.",
    )
    parser.add_argument(
        "--class-name-pattern",
        default=r"^[A-Za-z][A-Za-z_]+$",
        help="Regex for valid species class folders. Use empty string to disable.",
    )
    parser.add_argument("--validation-split", type=float, default=0.2)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument(
        "--weights",
        choices=("auto", "imagenet", "none"),
        default="auto",
        help="Use ImageNet transfer weights when available. 'auto' falls back to random weights.",
    )
    parser.add_argument(
        "--clean-extract",
        action="store_true",
        help="Delete extract-dir before extracting the zip.",
    )
    return parser.parse_args()


def find_dataset_root(args: argparse.Namespace) -> Path:
    class_root = find_class_directory_root(args.extract_dir)
    if class_root is not None:
        return class_root

    fish_data_root = find_fish_data_root(args.extract_dir)
    if fish_data_root is None:
        raise ValueError(f"No supported dataset found under {args.extract_dir}")

    return prepare_fish_data_classification_root(
        fish_data_root=fish_data_root,
        output_dir=args.prepared_dir,
        clean=args.clean_extract,
    )


def prepare_training_root(args: argparse.Namespace, dataset_root: Path) -> tuple[Path, dict[str, object]]:
    pattern = args.class_name_pattern or None
    return prepare_filtered_classification_root(
        class_root=dataset_root,
        output_dir=args.filtered_dir,
        min_images_per_class=args.min_images_per_class,
        class_name_pattern=pattern,
        clean=args.clean_extract,
    )


def compute_class_weights(dataset_root: Path, class_names: list[str]) -> dict[int, float]:
    counts = []
    for class_name in class_names:
        counts.append(sum(1 for file in (dataset_root / class_name).rglob("*") if is_image_file(file)))

    total = sum(counts)
    class_count = len(class_names)

    return {
        index: total / (class_count * max(count, 1))
        for index, count in enumerate(counts)
    }


def build_datasets(args: argparse.Namespace, dataset_root: Path):
    common = {
        "directory": dataset_root,
        "validation_split": args.validation_split,
        "seed": args.seed,
        "image_size": (args.image_size, args.image_size),
        "batch_size": args.batch_size,
        "label_mode": "int",
    }

    train_ds = tf.keras.utils.image_dataset_from_directory(
        subset="training",
        shuffle=True,
        **common,
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        subset="validation",
        shuffle=False,
        **common,
    )

    options = tf.data.Options()
    options.experimental_distribute.auto_shard_policy = tf.data.experimental.AutoShardPolicy.DATA

    train_ds = train_ds.with_options(options).prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.with_options(options).prefetch(tf.data.AUTOTUNE)

    return train_ds, val_ds


def build_model(
    class_count: int,
    image_size: int,
    weights: str | None,
) -> tuple[tf.keras.Model, tf.keras.Model]:
    inputs = tf.keras.Input(shape=(image_size, image_size, 3))
    x = tf.keras.layers.RandomFlip("horizontal")(inputs)
    x = tf.keras.layers.RandomRotation(0.04)(x)
    x = tf.keras.layers.RandomZoom(0.08)(x)
    x = tf.keras.layers.RandomContrast(0.08)(x)

    base_model = tf.keras.applications.EfficientNetB0(
        include_top=False,
        weights=weights,
        input_tensor=x,
    )
    base_model.trainable = False

    x = tf.keras.layers.GlobalAveragePooling2D(name="avg_pool")(base_model.output)
    x = tf.keras.layers.BatchNormalization()(x)
    x = tf.keras.layers.Dropout(0.32)(x)
    outputs = tf.keras.layers.Dense(class_count, activation="softmax", name="predictions")(x)

    model = tf.keras.Model(inputs, outputs, name="aquascope_efficientnetb0")
    return model, base_model


def resolve_weights(choice: str) -> str | None:
    if choice == "none":
        return None
    if choice == "imagenet":
        return "imagenet"
    return "imagenet"


def compile_model(model: tf.keras.Model, learning_rate: float) -> None:
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
        loss=tf.keras.losses.SparseCategoricalCrossentropy(),
        metrics=[
            "accuracy",
            tf.keras.metrics.SparseTopKCategoricalAccuracy(k=5, name="top5_accuracy"),
        ],
    )


def main() -> None:
    args = parse_args()

    if not args.dataset_zip.exists():
        raise FileNotFoundError(f"Dataset zip not found: {args.dataset_zip}")

    safe_extract(args.dataset_zip, args.extract_dir, args.clean_extract)
    raw_dataset_root = find_dataset_root(args)
    dataset_root, filter_summary = prepare_training_root(args, raw_dataset_root)
    class_names = write_class_names(dataset_root, args.class_names_out)
    class_weights = compute_class_weights(dataset_root, class_names)

    print(f"Raw dataset root: {raw_dataset_root}")
    print(f"Dataset root: {dataset_root}")
    print(f"Classes: {len(class_names)}")
    print(
        "Filtered images:",
        filter_summary.get("filtered_image_count"),
        "Dropped classes:",
        filter_summary.get("dropped_class_count", 0),
    )

    train_ds, val_ds = build_datasets(args, dataset_root)

    try:
        model, base_model = build_model(
            class_count=len(class_names),
            image_size=args.image_size,
            weights=resolve_weights(args.weights),
        )
    except Exception:
        if args.weights != "auto":
            raise
        print("ImageNet weights unavailable; retrying with random EfficientNetB0 weights.")
        model, base_model = build_model(
            class_count=len(class_names),
            image_size=args.image_size,
            weights=None,
        )

    args.model_out.parent.mkdir(parents=True, exist_ok=True)
    checkpoint_path = args.model_out.with_suffix(".best.keras")
    log_path = args.model_out.parent / "training_log.csv"

    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(
            checkpoint_path,
            monitor="val_accuracy",
            mode="max",
            save_best_only=True,
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor="val_accuracy",
            patience=5,
            mode="max",
            restore_best_weights=True,
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.35,
            patience=2,
            min_lr=1e-7,
        ),
        tf.keras.callbacks.CSVLogger(log_path),
    ]

    compile_model(model, learning_rate=1e-3)
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.epochs,
        class_weight=class_weights,
        callbacks=callbacks,
    )

    if args.fine_tune_epochs > 0:
        base_model.trainable = True
        for layer in base_model.layers[:-args.fine_tune_layers]:
            layer.trainable = False

        compile_model(model, learning_rate=1e-5)
        fine_history = model.fit(
            train_ds,
            validation_data=val_ds,
            epochs=args.fine_tune_epochs,
            class_weight=class_weights,
            callbacks=callbacks,
        )
        history.history.update(
            {f"fine_tune_{key}": value for key, value in fine_history.history.items()}
        )

    model.save(args.model_out)

    summary_path = args.model_out.parent / "training_summary.json"
    summary_path.write_text(
        json.dumps(
            {
                "dataset_zip": str(args.dataset_zip),
                "raw_dataset_root": str(raw_dataset_root),
                "dataset_root": str(dataset_root),
                "filter_summary": filter_summary,
                "class_count": len(class_names),
                "image_size": args.image_size,
                "batch_size": args.batch_size,
                "epochs": args.epochs,
                "fine_tune_epochs": args.fine_tune_epochs,
                "model_out": str(args.model_out),
                "class_names_out": str(args.class_names_out),
                "history_keys": sorted(history.history.keys()),
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    print(f"Saved model: {args.model_out}")
    print(f"Saved class names: {args.class_names_out}")
    print(f"Saved summary: {summary_path}")


if __name__ == "__main__":
    main()
