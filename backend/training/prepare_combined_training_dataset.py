from __future__ import annotations

import argparse
import json
import os
import shutil
from pathlib import Path


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".gif", ".webp"}


def parse_args() -> argparse.Namespace:
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(
        description="Combine the existing AquaScope training classes with the Turkey species dataset."
    )
    parser.add_argument(
        "--base-dir",
        type=Path,
        default=root / "training_runs" / "filtered_classification",
    )
    parser.add_argument(
        "--turkey-dir",
        type=Path,
        default=root / "training_runs" / "turkey_species_dataset",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=root / "training_runs" / "combined_classification",
    )
    parser.add_argument("--clean", action="store_true")
    return parser.parse_args()


def is_image(path: Path) -> bool:
    return path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS


def link_or_copy(source: Path, destination: Path) -> None:
    if destination.exists():
        return
    destination.parent.mkdir(parents=True, exist_ok=True)
    try:
        os.link(source, destination)
    except OSError:
        shutil.copy2(source, destination)


def copy_class_tree(source_root: Path, output_root: Path, prefix: str) -> dict[str, int]:
    counts: dict[str, int] = {}
    for class_dir in sorted(path for path in source_root.iterdir() if path.is_dir()):
        class_name = class_dir.name
        images = sorted(path for path in class_dir.rglob("*") if is_image(path))
        if not images:
            continue
        destination_dir = output_root / class_name
        for index, image in enumerate(images, start=1):
            target_name = f"{prefix}_{index:05d}{image.suffix.lower()}"
            link_or_copy(image, destination_dir / target_name)
        counts[class_name] = counts.get(class_name, 0) + len(images)
    return counts


def main() -> None:
    args = parse_args()
    if args.clean and args.output_dir.exists():
        shutil.rmtree(args.output_dir)
    args.output_dir.mkdir(parents=True, exist_ok=True)

    if not args.base_dir.exists():
        raise FileNotFoundError(f"Base dataset missing: {args.base_dir}")
    if not args.turkey_dir.exists():
        raise FileNotFoundError(f"Turkey dataset missing: {args.turkey_dir}")

    base_counts = copy_class_tree(args.base_dir, args.output_dir, "base")
    turkey_counts = copy_class_tree(args.turkey_dir, args.output_dir, "turkey")
    combined_counts = {
        class_name: base_counts.get(class_name, 0) + turkey_counts.get(class_name, 0)
        for class_name in sorted(set(base_counts) | set(turkey_counts))
    }

    summary = {
        "base_dir": str(args.base_dir),
        "turkey_dir": str(args.turkey_dir),
        "output_dir": str(args.output_dir),
        "base_class_count": len(base_counts),
        "turkey_class_count": len(turkey_counts),
        "combined_class_count": len(combined_counts),
        "base_image_count": sum(base_counts.values()),
        "turkey_image_count": sum(turkey_counts.values()),
        "combined_image_count": sum(combined_counts.values()),
        "overlapping_classes": sorted(set(base_counts) & set(turkey_counts)),
        "class_counts": combined_counts,
    }
    (args.output_dir / "_combined_summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
