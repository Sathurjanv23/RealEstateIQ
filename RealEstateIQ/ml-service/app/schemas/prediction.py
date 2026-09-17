"""
Pydantic schemas for the RealEstateIQ ML service.
"""

from typing import Dict, Optional
from pydantic import BaseModel, Field, field_validator

VALID_LOCATIONS = {"Colombo", "Kandy", "Galle", "Negombo"}


class PredictRequest(BaseModel):
    """Input schema for property price prediction."""

    area: float = Field(..., gt=0, le=50000, description="Area in square feet")
    bedrooms: int = Field(..., ge=1, le=20, description="Number of bedrooms")
    bathrooms: int = Field(..., ge=1, le=20, description="Number of bathrooms")
    location: str = Field(
        ..., description="Location: Colombo, Kandy, Galle, or Negombo"
    )
    house_age: int = Field(..., ge=0, le=150, description="Age of the house in years")
    parking: int = Field(..., ge=0, le=20, description="Number of parking spaces")

    @field_validator("location")
    @classmethod
    def validate_location(cls, v: str) -> str:
        if v not in VALID_LOCATIONS:
            raise ValueError(
                f"Invalid location '{v}'. Must be one of: {sorted(VALID_LOCATIONS)}"
            )
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "area": 2200,
                "bedrooms": 4,
                "bathrooms": 3,
                "location": "Colombo",
                "house_age": 3,
                "parking": 2,
            }
        }
    }


class PredictResponse(BaseModel):
    """Prediction result schema."""

    predicted_price: float = Field(..., description="ML estimated property price (LKR)")
    price_per_sqft: Optional[float] = Field(
        None, description="Estimated price per square foot (LKR)"
    )
    model_version: str = Field(..., description="Model version identifier")
    algorithm: str = Field(..., description="Algorithm used")
    dataset_version: str = Field(..., description="Dataset version used for training")
    feature_importance: Dict[str, float] = Field(
        default_factory=dict, description="Feature importance scores from the model"
    )
    disclaimer: str = Field(
        default=(
            "This is an ML model estimate based on synthetic training data. "
            "It is not a guaranteed market valuation."
        )
    )


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str
    model_version: str
    algorithm: str
    model_loaded: bool


class ModelInfoResponse(BaseModel):
    """Detailed model information."""

    model_version: str
    algorithm: str
    metrics: Dict[str, float]
    dataset_version: str
    feature_importance: Dict[str, float]
    status: str
