from __future__ import annotations

import json
import os
import random
import shutil
import zipfile
from dataclasses import dataclass
from pathlib import Path


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".gif", ".webp"}


@dataclass(frozen=True)
class FishDataItem:
    class_id: int
    class_name: str
    source_type: str
    image_stem: str
    numbered_id: int


def is_image_file(path: Path) -> bool:
    return path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS


def safe_extract(zip_path: Path, extract_dir: Path, clean: bool = False) -> None:
    if clean and extract_dir.exists():
        shutil.rmtree(extract_dir)

    if extract_dir.exists() and any(extract_dir.iterdir()):
        return

    extract_dir.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(zip_path) as zf:
        extract_root = extract_dir.resolve()
        for member in zf.infolist():
            target = (extract_dir / member.filename).resolve()
            if not str(target).startswith(str(extract_root)):
                raise ValueError(f"Unsafe zip member path: {member.filename}")
        zf.extractall(extract_dir)


def parse_fish_data_index(index_path: Path) -> list[FishDataItem]:
    items: list[FishDataItem] = []
    with index_path.open("r", encoding="utf-8") as f:
        for line_number, raw_line in enumerate(f, start=1):
            line = raw_line.strip()
            if not line:
                continue
            parts = line.split("=")
            if len(parts) != 5:
                raise ValueError(f"Unexpected index format at line {line_number}: {line}")
            class_id, class_name, source_type, image_stem, numbered_id = parts
            items.append(
                FishDataItem(
                    class_id=int(class_id),
                    class_name=class_name,
                    source_type=source_type,
                    image_stem=image_stem,
                    numbered_id=int(numbered_id),
                )
            )
    if not items:
        raise ValueError(f"Fish_Data index is empty: {index_path}")
    return items


def find_fish_data_root(extract_dir: Path) -> Path | None:
    candidates = [extract_dir, *[path for path in extract_dir.rglob("Fish_Data") if path.is_dir()]]
    for candidate in candidates:
        if (candidate / "final_all_index.txt").exists() and (candidate / "images").exists():
            return candidate
    return None


def find_class_directory_root(extract_dir: Path) -> Path | None:
    candidates = [extract_dir]
    candidates.extend(path for path in extract_dir.iterdir() if path.is_dir())
    valid = [(path, count_class_dirs(path)) for path in candidates]
    best, class_count = max(valid, key=lambda item: item[1])
    if class_count >= 2:
        return best
    return None


def count_class_dirs(path: Path) -> int:
    return sum(
        1
        for child in path.iterdir()
        if child.is_dir() and any(is_image_file(file) for file in child.rglob("*"))
    )


def resolve_fish_data_image(fish_data_root: Path, item: FishDataItem) -> Path | None:
    image_dirs = [
        fish_data_root / "images" / "cropped",
        fish_data_root / "images" / "raw_images",
        fish_data_root / "images" / "numbered",
    ]
    stems = [item.image_stem, str(item.numbered_id)]
    for image_dir in image_dirs:
        for stem in stems:
            for extension in IMAGE_EXTENSIONS:
                candidate = image_dir / f"{stem}{extension}"
                if candidate.exists():
                    return candidate
    return None


def link_or_copy(source: Path, destination: Path) -> None:
    if destination.exists():
        return
    destination.parent.mkdir(parents=True, exist_ok=True)
    try:
        os.link(source, destination)
    except OSError:
        shutil.copy2(source, destination)


def prepare_fish_data_classification_root(
    fish_data_root: Path,
    output_dir: Path,
    clean: bool = False,
) -> Path:
    if clean and output_dir.exists():
        shutil.rmtree(output_dir)
    if output_dir.exists() and count_class_dirs(output_dir) >= 2:
        return output_dir

    output_dir.mkdir(parents=True, exist_ok=True)
    items = parse_fish_data_index(fish_data_root / "final_all_index.txt")
    missing: list[str] = []

    for item in items:
        source = resolve_fish_data_image(fish_data_root, item)
        if source is None:
            missing.append(item.image_stem)
            continue
        destination = output_dir / item.class_name / f"{item.image_stem}{source.suffix.lower()}"
        link_or_copy(source, destination)

    if count_class_dirs(output_dir) < 2:
        raise ValueError(f"Prepared dataset has fewer than 2 classes: {output_dir}")

    if missing:
        (output_dir / "_missing_images.json").write_text(
            json.dumps(missing, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    return output_dir


def prepare_yolo_classification_split(
    class_root: Path,
    output_dir: Path,
    validation_split: float = 0.2,
    seed: int = 42,
    clean: bool = False,
) -> Path:
    if clean and output_dir.exists():
        shutil.rmtree(output_dir)
    train_dir = output_dir / "train"
    val_dir = output_dir / "val"
    if train_dir.exists() and val_dir.exists() and count_class_dirs(train_dir) >= 2 and count_class_dirs(val_dir) >= 2:
        return output_dir

    rng = random.Random(seed)
    for class_dir in sorted(path for path in class_root.iterdir() if path.is_dir()):
        images = sorted(file for file in class_dir.rglob("*") if is_image_file(file))
        if not images:
            continue
        rng.shuffle(images)
        val_count = max(1, int(len(images) * validation_split)) if len(images) > 1 else 0
        val_images = set(images[:val_count])

        for image in images:
            split = "val" if image in val_images else "train"
            destination = output_dir / split / class_dir.name / image.name
            link_or_copy(image, destination)

    return output_dir


def write_class_names(dataset_root: Path, output_path: Path) -> list[str]:
    class_names = sorted(
        child.name
        for child in dataset_root.iterdir()
        if child.is_dir() and any(is_image_file(file) for file in child.rglob("*"))
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(class_names, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return class_names
