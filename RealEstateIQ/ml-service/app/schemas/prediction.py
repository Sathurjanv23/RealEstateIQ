"""
Pydantic schemas for the RealEstateIQ ML service.
"""

from typing import Dict, Optional
from pydantic import BaseModel, Field, field_validator

VALID_LOCATIONS = {
    # Western Province
    "Colombo", "Gampaha", "Kalutara",
    # Central Province
    "Kandy", "Matale", "Nuwara Eliya",
    # Southern Province
    "Galle", "Matara", "Hambantota",
    # Northern Province
    "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullativu",
    # Eastern Province
    "Trincomalee", "Batticaloa", "Ampara",
    # North Western Province
    "Kurunegala", "Puttalam",
    # North Central Province
    "Anuradhapura", "Polonnaruwa",
    # Uva Province
    "Badulla", "Monaragala",
    # Sabaragamuwa Province
    "Ratnapura", "Kegalle",
}


class PredictRequest(BaseModel):
    """Input schema for property price prediction."""

    area: float = Field(..., gt=0, le=50000, description="Area in square feet")
    bedrooms: int = Field(..., ge=1, le=20, description="Number of bedrooms")
    bathrooms: int = Field(..., ge=1, le=20, description="Number of bathrooms")
    location: str = Field(
        ..., description="Sri Lanka district (any of the 25 districts)"
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


class WaterfallFactor(BaseModel):
    """Individual factor attribution in the SHAP waterfall breakdown."""

    id: str = Field(..., description="Feature key identifier")
    feature: str = Field(..., description="Human-readable feature name")
    user_value: str = Field(..., description="Formatted user input value")
    impact_lkr: float = Field(..., description="Marginal price impact in LKR (+ or -)")
    shap_value: float = Field(..., description="Raw SHAP log-odds value")
    impact_percentage: float = Field(..., description="Relative attribution percentage")
    direction: str = Field(..., description="'positive' or 'negative'")
    explanation: str = Field(..., description="Domain surveyor rationale for this factor")


class ShapBreakdown(BaseModel):
    """Explainable AI SHAP Waterfall Breakdown."""

    base_value_lkr: float = Field(..., description="National baseline property value in LKR")
    final_predicted_price_lkr: float = Field(..., description="Final estimated market price in LKR")
    net_impact_lkr: float = Field(..., description="Net deviation from baseline in LKR")
    factors: list[WaterfallFactor] = Field(
        default_factory=list, description="Ordered waterfall factors contributing to valuation"
    )
    summary: str = Field(..., description="Plain-language valuation driver summary")


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
    shap_breakdown: Optional[ShapBreakdown] = Field(
        None, description="Explainable AI SHAP Waterfall Breakdown"
    )
    disclaimer: str = Field(
        default=(
            "This is an ML model estimate trained on authentic Sri Lanka real estate market data. "
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
