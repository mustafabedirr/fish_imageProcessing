from __future__ import annotations

import argparse
import json
from pathlib import Path

from backend.training.dataset_utils import (
    count_class_dirs,
    find_fish_data_root,
    prepare_fish_data_classification_root,
    prepare_yolo_classification_split,
    safe_extract,
    write_class_names,
)


def parse_args() -> argparse.Namespace:
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description="Prepare Fish_Data archive for AquaScope model training.")
    parser.add_argument("--dataset-zip", type=Path, required=True)
    parser.add_argument("--extract-dir", type=Path, default=root / "training_runs" / "dataset_all")
    parser.add_argument("--prepared-dir", type=Path, default=root / "training_runs" / "prepared_classification")
    parser.add_argument("--yolo-dir", type=Path, default=root / "training_runs" / "yolo_classification")
    parser.add_argument("--class-names-out", type=Path, default=root / "data" / "class_names.json")
    parser.add_argument("--image-sources", default="cropped,raw_images")
    parser.add_argument("--validation-split", type=float, default=0.2)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--clean", action="store_true")
    return parser.parse_args()


def parse_image_sources(value: str) -> tuple[str, ...]:
    sources = tuple(source.strip() for source in value.split(",") if source.strip())
    if not sources:
        raise ValueError("--image-sources must include at least one source")
    return sources


def main() -> None:
    args = parse_args()
    safe_extract(args.dataset_zip, args.extract_dir, clean=args.clean)
    fish_data_root = find_fish_data_root(args.extract_dir)
    if fish_data_root is None:
        raise ValueError(f"Fish_Data root not found under {args.extract_dir}")

    class_root = prepare_fish_data_classification_root(
        fish_data_root=fish_data_root,
        output_dir=args.prepared_dir,
        image_sources=parse_image_sources(args.image_sources),
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

    summary = {
        "fish_data_root": str(fish_data_root),
        "classification_root": str(class_root),
        "image_sources": parse_image_sources(args.image_sources),
        "yolo_classification_root": str(yolo_root),
        "class_count": len(class_names),
        "prepared_class_dirs": count_class_dirs(class_root),
        "class_names_out": str(args.class_names_out),
    }
    summary_path = args.prepared_dir / "dataset_summary.json"
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
