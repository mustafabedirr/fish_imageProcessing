from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, Request, UploadFile
from pydantic import BaseModel, Field

from backend.services.inference_service import run_inference

router = APIRouter(prefix="/api/v1", tags=["analyze"])


class TopPrediction(BaseModel):
    species: str
    confidence: float = Field(..., ge=0.0, le=1.0)


class AnalyzeFishResponse(BaseModel):
    species: str = Field(..., description="Predicted fish species")
    confidence: float = Field(..., ge=0.0, le=1.0)
    top_predictions: list[TopPrediction] = Field(default_factory=list)
    confidence_threshold: float = Field(default=0.45, ge=0.0, le=1.0)
    is_uncertain: bool = False
    edible: bool
    ideal_size: str
    recommended_baits: list[str]
    recommended_gear: list[str]
    region_notes: list[str]

SUPPORTED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}


@router.post("/analyze-fish", response_model=AnalyzeFishResponse)
async def analyze_fish(
    request: Request,
    image: UploadFile = File(...),
) -> AnalyzeFishResponse:
    if image.content_type not in SUPPORTED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {image.content_type}",
        )

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    model = getattr(request.app.state, "model", None)
    class_names = getattr(request.app.state, "class_names", None)
    fish_info = getattr(request.app.state, "fish_info", None)

    if model is None:
        raise HTTPException(status_code=500, detail="Model is not loaded")

    if class_names is None:
        raise HTTPException(status_code=500, detail="Class names are not loaded")

    try:
        result = run_inference(
            image_bytes=image_bytes,
            model=model,
            class_names=class_names,
            fish_info=fish_info,
        )
        return AnalyzeFishResponse(**result)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Inference failed") from exc
