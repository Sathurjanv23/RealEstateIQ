"""
FastAPI routes for the RealEstateIQ ML service.
"""

from fastapi import APIRouter, HTTPException

from app.prediction.predictor import ModelNotFoundError, Predictor
from app.schemas.prediction import (
    HealthResponse,
    ModelInfoResponse,
    PredictRequest,
    PredictResponse,
)

router = APIRouter()


def get_predictor() -> Predictor:
    """Get predictor singleton, raising 503 if model is not loaded."""
    try:
        return Predictor.get_instance()
    except ModelNotFoundError as e:
        raise HTTPException(
            status_code=503,
            detail=f"ML model not available: {str(e)}. Please train the model first.",
        )


@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint. Returns 503 if model is not loaded."""
    try:
        predictor = Predictor.get_instance()
        return HealthResponse(
            status="ok",
            model_version=predictor.model_version,
            algorithm=predictor.algorithm,
            model_loaded=True,
        )
    except ModelNotFoundError:
        return HealthResponse(
            status="model_not_loaded",
            model_version="none",
            algorithm="none",
            model_loaded=False,
        )


@router.get("/model-info", response_model=ModelInfoResponse, tags=["Model"])
async def model_info():
    """Returns detailed model metadata."""
    predictor = get_predictor()
    return ModelInfoResponse(**predictor.get_model_info())


@router.post("/predict", response_model=PredictResponse, tags=["Prediction"])
async def predict(request: PredictRequest):
    """
    Predict property price using the trained ML model.

    Input features are validated, preprocessed using the saved pipeline,
    and passed to the trained model. Returns the estimated price in LKR.

    Note: Output is an ML estimate, not a guaranteed market valuation.
    """
    predictor = get_predictor()

    try:
        result = predictor.predict(
            area=request.area,
            bedrooms=request.bedrooms,
            bathrooms=request.bathrooms,
            location=request.location,
            house_age=request.house_age,
            parking=request.parking,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}",
        )

    return PredictResponse(**result)
