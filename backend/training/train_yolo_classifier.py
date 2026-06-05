from __future__ import annotations

import argparse
import json
from pathlib import Path

from backend.training.dataset_utils import (
    find_fish_data_root,
    prepare_fish_data_classification_root,
    prepare_yolo_classification_split,
    safe_extract,
    write_class_names,
)


def parse_args() -> argparse.Namespace:
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description="Train a YOLO classification model for AquaScope fish species.")
    parser.add_argument("--dataset-zip", type=Path, required=True)
    parser.add_argument("--extract-dir", type=Path, default=root / "training_runs" / "dataset_all")
    parser.add_argument("--prepared-dir", type=Path, default=root / "training_runs" / "prepared_classification")
    parser.add_argument("--yolo-dir", type=Path, default=root / "training_runs" / "yolo_classification")
    parser.add_argument("--class-names-out", type=Path, default=root / "data" / "class_names.json")
    parser.add_argument("--model", default="yolov8n-cls.pt")
    parser.add_argument("--project", type=Path, default=root / "models" / "yolo")
    parser.add_argument("--name", default="fish_species_cls")
    parser.add_argument("--imgsz", type=int, default=224)
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--validation-split", type=float, default=0.2)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--clean", action="store_true")
    return parser.parse_args()


def main() -> None:
    try:
        from ultralytics import YOLO
    except ImportError as exc:
        raise RuntimeError(
            "ultralytics is not installed. Install it with: python -m pip install ultralytics"
        ) from exc

    args = parse_args()
    safe_extract(args.dataset_zip, args.extract_dir, clean=args.clean)
    fish_data_root = find_fish_data_root(args.extract_dir)
    if fish_data_root is None:
        raise ValueError(f"Fish_Data root not found under {args.extract_dir}")

    class_root = prepare_fish_data_classification_root(
        fish_data_root=fish_data_root,
        output_dir=args.prepared_dir,
        clean=args.clean,
    )
    yolo_root = prepare_yolo_classification_split(
        class_root=class_root,
        output_dir=args.yolo_dir,
        validation_split=args.validation_split,
        seed=args.seed,
        clean=args.clean,
    )
    class_names = write_class_names(class_root, args.class_names_out)

    model = YOLO(args.model)
    results = model.train(
        data=str(yolo_root),
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        project=str(args.project),
        name=args.name,
    )

    summary_path = args.project / args.name / "training_summary.json"
    summary_path.parent.mkdir(parents=True, exist_ok=True)
    summary_path.write_text(
        json.dumps(
            {
                "dataset_zip": str(args.dataset_zip),
                "yolo_root": str(yolo_root),
                "class_count": len(class_names),
                "class_names_out": str(args.class_names_out),
                "results": str(results),
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"Saved YOLO run summary: {summary_path}")


if __name__ == "__main__":
    main()
