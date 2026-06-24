from __future__ import annotations

import argparse
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


ACCEPTED_LICENSES = {"cc0", "cc-by", "cc-by-sa"}
API_URL = "https://api.inaturalist.org/v1/observations"
USER_AGENT = "AquaScope training dataset builder (licensed iNaturalist media)"


def parse_args() -> argparse.Namespace:
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(
        description="Download licensed iNaturalist photos for Turkey-focused fish species."
    )
    parser.add_argument("--seed", type=Path, default=root / "data" / "turkey_species_seed.json")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=root / "training_runs" / "turkey_species_dataset",
    )
    parser.add_argument("--max-per-species", type=int, default=120)
    parser.add_argument("--per-page", type=int, default=100)
    parser.add_argument("--sleep", type=float, default=0.35)
    parser.add_argument("--include-status", default="ready,usable")
    parser.add_argument("--only-class", action="append", default=[])
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def request_json(url: str) -> dict[str, Any]:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=45) as response:
        return json.loads(response.read().decode("utf-8"))


def download_file(url: str, target: Path) -> None:
    if target.exists() and target.stat().st_size > 0:
        return
    target.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=60) as response:
        target.write_bytes(response.read())


def observation_url(species_name: str, page: int, per_page: int) -> str:
    params = {
        "taxon_name": species_name,
        "photos": "true",
        "quality_grade": "research",
        "licensed": "true",
        "photo_license": ",".join(sorted(ACCEPTED_LICENSES)),
        "page": str(page),
        "per_page": str(per_page),
        "order_by": "created_at",
        "order": "desc",
    }
    return f"{API_URL}?{urllib.parse.urlencode(params)}"


def photo_download_url(photo: dict[str, Any]) -> str | None:
    url = photo.get("url")
    if not isinstance(url, str) or not url:
        return None
    return url.replace("square.", "large.")


def extension_from_url(url: str) -> str:
    path = urllib.parse.urlparse(url).path
    suffix = Path(path).suffix.lower()
    return suffix if suffix in {".jpg", ".jpeg", ".png", ".webp"} else ".jpg"


def iter_species(seed: dict[str, Any], statuses: set[str], only_classes: set[str]) -> list[dict[str, Any]]:
    species = seed.get("species", [])
    if not isinstance(species, list):
        raise ValueError("Seed file must contain a species array")
    return [
        item
        for item in species
        if isinstance(item, dict) and str(item.get("training_status")) in statuses
        and (not only_classes or str(item.get("class_name")) in only_classes)
    ]


def main() -> None:
    args = parse_args()
    statuses = {value.strip() for value in args.include_status.split(",") if value.strip()}
    seed = json.loads(args.seed.read_text(encoding="utf-8-sig"))
    args.output_dir.mkdir(parents=True, exist_ok=True)

    for item in iter_species(seed, statuses, set(args.only_class)):
        class_name = str(item["class_name"])
        scientific_name = str(item["scientific_name"])
        class_dir = args.output_dir / class_name
        metadata_path = class_dir / "_inat_metadata.jsonl"
        seen_photo_ids: set[int] = set()
        downloaded = len([path for path in class_dir.glob("*") if path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}])
        page = 1

        print(f"{class_name}: starting with {downloaded} images")
        while downloaded < args.max_per_species:
            payload = request_json(observation_url(scientific_name, page, args.per_page))
            results = payload.get("results", [])
            if not results:
                break

            metadata_rows: list[str] = []
            for observation in results:
                for photo in observation.get("photos", []):
                    if downloaded >= args.max_per_species:
                        break
                    photo_id = photo.get("id")
                    license_code = str(photo.get("license_code") or "").lower()
                    if not isinstance(photo_id, int) or photo_id in seen_photo_ids:
                        continue
                    if license_code not in ACCEPTED_LICENSES:
                        continue
                    url = photo_download_url(photo)
                    if url is None:
                        continue

                    seen_photo_ids.add(photo_id)
                    filename = f"{class_name}_{photo_id}{extension_from_url(url)}"
                    target = class_dir / filename
                    metadata = {
                        "file": filename,
                        "photo_id": photo_id,
                        "observation_id": observation.get("id"),
                        "scientific_name": scientific_name,
                        "license_code": license_code,
                        "attribution": photo.get("attribution"),
                        "source_url": observation.get("uri"),
                        "image_url": url,
                    }
                    if args.dry_run:
                        metadata_rows.append(json.dumps(metadata, ensure_ascii=False))
                        downloaded += 1
                        continue

                    try:
                        download_file(url, target)
                    except Exception as exc:
                        print(f"  skipped {photo_id}: {exc}")
                        continue
                    metadata_rows.append(json.dumps(metadata, ensure_ascii=False))
                    downloaded += 1

            if metadata_rows and not args.dry_run:
                with metadata_path.open("a", encoding="utf-8") as f:
                    for row in metadata_rows:
                        f.write(row + "\n")

            page += 1
            time.sleep(args.sleep)

        print(f"{class_name}: collected {downloaded} images")


if __name__ == "__main__":
    main()
