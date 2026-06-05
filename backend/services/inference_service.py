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
        "recommended_baits": ["Silikon", "Canlı yem"],
        "recommended_gear": ["Spin takım", "LRF uyumlu hafif setup"],
        "region_notes": ["Ege kıyıları", "Akdeniz kıyıları", "Liman çevreleri"],
    },
    "Çupra": {
        "edible": True,
        "ideal_size": "20+ cm",
        "recommended_baits": ["Karides", "Mamun"],
        "recommended_gear": ["Surf casting", "Dip oltası"],
        "region_notes": ["Ege", "Akdeniz", "Kıyı taşlık alanlar"],
    },
    "Lüfer": {
        "edible": True,
        "ideal_size": "18+ cm",
        "recommended_baits": ["Zargana", "Sahte yem"],
        "recommended_gear": ["Spin takım", "Tekne sırtısı"],
        "region_notes": ["Marmara", "Boğaz hattı", "Karadeniz geçişleri"],
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

    return {
        "species": species,
        "confidence": round(confidence, 4),
        "top_predictions": top_predictions,
        "confidence_threshold": LOW_CONFIDENCE_THRESHOLD,
        "is_uncertain": is_uncertain,
        "edible": bool(info.get("edible", False)),
        "ideal_size": str(info.get("ideal_size", "Bilinmiyor")),
        "recommended_baits": list(info.get("recommended_baits", ["Bilgi yok"])),
        "recommended_gear": list(info.get("recommended_gear", ["Bilgi yok"])),
        "region_notes": list(info.get("region_notes", ["Bölge bilgisi yok"])),
    }


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
