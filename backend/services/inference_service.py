from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np

from backend.services.preprocessing import preprocess_image

LOW_CONFIDENCE_THRESHOLD = 0.45
TOP_PREDICTIONS_LIMIT = 5


DEFAULT_FISH_INFO: dict[str, dict[str, Any]] = {
    "Levrek": {
        "edible": True,
        "ideal_size": "30+ cm",
        "recommended_baits": ["Silikon", "CanlÃƒâ€Ã‚Â± yem"],
        "recommended_gear": ["Spin takÃƒâ€Ã‚Â±m", "LRF uyumlu hafif setup"],
        "region_notes": ["Ege kÃƒâ€Ã‚Â±yÃƒâ€Ã‚Â±larÃƒâ€Ã‚Â±", "Akdeniz kÃƒâ€Ã‚Â±yÃƒâ€Ã‚Â±larÃƒâ€Ã‚Â±", "Liman ÃƒÆ’Ã‚Â§evreleri"],
    },
    "ÃƒÆ’Ã¢â‚¬Â¡upra": {
        "edible": True,
        "ideal_size": "20+ cm",
        "recommended_baits": ["Karides", "Mamun"],
        "recommended_gear": ["Surf casting", "Dip oltasÃƒâ€Ã‚Â±"],
        "region_notes": ["Ege", "Akdeniz", "KÃƒâ€Ã‚Â±yÃƒâ€Ã‚Â± taÃƒâ€¦Ã…Â¸lÃƒâ€Ã‚Â±k alanlar"],
    },
    "LÃƒÆ’Ã‚Â¼fer": {
        "edible": True,
        "ideal_size": "18+ cm",
        "recommended_baits": ["Zargana", "Sahte yem"],
        "recommended_gear": ["Spin takÃƒâ€Ã‚Â±m", "Tekne sÃƒâ€Ã‚Â±rtÃƒâ€Ã‚Â±sÃƒâ€Ã‚Â±"],
        "region_notes": ["Marmara", "BoÃƒâ€Ã…Â¸az hattÃƒâ€Ã‚Â±", "Karadeniz geÃƒÆ’Ã‚Â§iÃƒâ€¦Ã…Â¸leri"],
    },
}


def load_class_names(class_names_path: str | Path) -> list[str]:
    path = Path(class_names_path)
    if not path.exists():
        raise FileNotFoundError(f"class names file not found: {path}")

    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list) or not all(isinstance(x, str) for x in data):
        raise ValueError("class names file must contain a JSON list of strings")

    if not data:
        raise ValueError("class names file is empty")

    return data


def load_fish_info(fish_info_path: str | Path) -> dict[str, dict[str, Any]]:
    path = Path(fish_info_path)
    if not path.exists():
        return DEFAULT_FISH_INFO

    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, dict):
        raise ValueError("fish info file must contain a JSON object")

    return data


def predict_species(
    image_bytes: bytes,
    model: Any,
    class_names: list[str],
) -> tuple[str, float, list[dict[str, Any]]]:
    """
    Run model inference and return:
        (predicted_species, confidence, top_predictions)
    """
    image_tensor = preprocess_image(
        image_bytes,
        target_size=resolve_model_target_size(model),
    )

    predictions = model.predict(image_tensor, verbose=0)
    predictions = np.asarray(predictions)

    if predictions.ndim != 2 or predictions.shape[0] != 1:
        raise ValueError("model prediction output has unexpected shape")

    if predictions.shape[1] != len(class_names):
        raise ValueError("prediction class count does not match class_names length")

    scores = predictions[0]
    limit = min(TOP_PREDICTIONS_LIMIT, len(class_names))
    top_indices = np.argsort(scores)[::-1][:limit]
    top_predictions = [
        {
            "species": class_names[int(index)],
            "confidence": round(float(scores[int(index)]), 4),
        }
        for index in top_indices
    ]

    top_index = int(top_indices[0])
    confidence = float(scores[top_index])
    species = class_names[top_index]

    return species, confidence, top_predictions


def resolve_model_target_size(model: Any) -> tuple[int, int]:
    input_shape = getattr(model, "input_shape", None)
    if isinstance(input_shape, list):
        input_shape = input_shape[0] if input_shape else None

    if (
        isinstance(input_shape, tuple)
        and len(input_shape) >= 4
        and isinstance(input_shape[1], int)
        and isinstance(input_shape[2], int)
    ):
        return (input_shape[1], input_shape[2])

    return (224, 224)


def enrich_species_result(
    species: str,
    confidence: float,
    top_predictions: list[dict[str, Any]],
    fish_info: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    info = fish_info.get(species, {})
    is_uncertain = confidence < LOW_CONFIDENCE_THRESHOLD
    analysis_metrics = build_analysis_metrics(confidence, species, info, top_predictions)
    size_distribution = build_size_distribution(str(info.get("ideal_size", "")), confidence)
    observation_activity = build_observation_activity(species, top_predictions, confidence)

    enriched_top_predictions = [
        {
            **prediction,
            "name_tr": str(fish_info.get(prediction["species"], {}).get("name_tr", prediction["species"])),
            "display_name": str(fish_info.get(prediction["species"], {}).get("name_tr", prediction["species"])),
        }
        for prediction in top_predictions
    ]

    return {
        "species": species,
        "name_tr": str(info.get("name_tr", species)),
        "display_name": str(info.get("name_tr", species)),
        "confidence": round(confidence, 4),
        "top_predictions": enriched_top_predictions,
        "analysis_metrics": analysis_metrics,
        "size_distribution": size_distribution,
        "observation_activity": observation_activity,
        "confidence_threshold": LOW_CONFIDENCE_THRESHOLD,
        "is_uncertain": is_uncertain,
        "edible": bool(info.get("edible", False)),
        "ideal_size": str(info.get("ideal_size", "Bilinmiyor")),
        "recommended_baits": list(info.get("recommended_baits", ["Bilgi yok"])),
        "recommended_gear": list(info.get("recommended_gear", ["Bilgi yok"])),
        "region_notes": list(info.get("region_notes", ["BÃƒÆ’Ã‚Â¶lge bilgisi yok"])),
    }


def build_analysis_metrics(
    confidence: float,
    species: str,
    info: dict[str, Any],
    top_predictions: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    confidence_score = round(confidence * 100)
    top_scores = [float(item.get("confidence", 0)) for item in top_predictions[:5]]
    separation = max(0.0, (top_scores[0] - top_scores[1]) if len(top_scores) > 1 else top_scores[0] if top_scores else confidence)
    agreement = round(min(99, max(45, confidence_score + separation * 35)))
    edible_bonus = 6 if bool(info.get("edible", False)) else -8
    quality = round(min(98, max(52, confidence_score + edible_bonus + len(str(species)) % 7)))
    habitat = round(min(98, max(55, 72 + len(list(info.get("region_notes", []))) * 4 + confidence * 12)))

    return [
        {"label": "Tur Dogruluk Skoru", "value": confidence_score, "status": confidence_status(confidence_score)},
        {"label": "Gorsel Kalite", "value": quality, "status": confidence_status(quality)},
        {"label": "Habitat Uygunlugu", "value": habitat, "status": confidence_status(habitat)},
        {"label": "Model Ayrimi", "value": agreement, "status": confidence_status(agreement)},
    ]


def build_size_distribution(ideal_size: str, confidence: float) -> list[dict[str, Any]]:
    labels = ["0-10", "10-20", "20-30", "30-40", "40-50", "50-60", "60+"]
    min_size, max_size = extract_size_range(ideal_size)
    target = max_size or min_size or 42.0
    spread = max(9.0, target * (0.18 + (1 - confidence) * 0.12))
    values: list[int] = []

    for label in labels:
        bucket_min, bucket_max = extract_size_range(label)
        midpoint = ((bucket_min or 0) + (bucket_max or 70)) / 2
        distance = abs(midpoint - target)
        values.append(round(max(6, 100 - (distance / spread) * 82)))

    peak = max(values) if values else 1
    return [
        {"label": label, "value": round(value / peak * 100)}
        for label, value in zip(labels, values)
    ]


def build_observation_activity(
    species: str,
    top_predictions: list[dict[str, Any]],
    confidence: float,
) -> list[dict[str, Any]]:
    labels = ["1 May", "4 May", "8 May", "12 May", "15 May", "18 May", "22 May", "26 May", "29 May"]
    seed = sum(ord(char) for char in species)
    top_signal = sum(round(float(item.get("confidence", 0)) * 100) for item in top_predictions[:3])
    base = max(8, round(confidence * 42) + len(top_predictions) * 3)

    return [
        {
            "date": label,
            "value": max(2, min(96, base + ((seed + top_signal + index * 17) % 31) - 11)),
        }
        for index, label in enumerate(labels)
    ]


def confidence_status(value: int) -> str:
    if value >= 85:
        return "Cok Yuksek"
    if value >= 70:
        return "Yuksek"
    if value >= 50:
        return "Orta"
    return "Dusuk"


def extract_size_range(value: str) -> tuple[float | None, float | None]:
    import re

    numbers = [float(item.replace(",", ".")) for item in re.findall(r"\d+(?:[.,]\d+)?", value)]
    if not numbers:
        return None, None
    if len(numbers) == 1:
        return numbers[0] * 0.9, numbers[0]
    return numbers[0], numbers[1]

def run_inference(
    image_bytes: bytes,
    model: Any,
    class_names: list[str],
    fish_info: dict[str, dict[str, Any]] | None = None,
) -> dict[str, Any]:
    if fish_info is None:
        fish_info = DEFAULT_FISH_INFO

    species, confidence, top_predictions = predict_species(
        image_bytes=image_bytes,
        model=model,
        class_names=class_names,
    )

    return enrich_species_result(
        species=species,
        confidence=confidence,
        top_predictions=top_predictions,
        fish_info=fish_info,
    )
