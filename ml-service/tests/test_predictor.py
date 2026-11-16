"""
Unit tests for RealEstateIQ ML Predictor
"""

import pytest
import os
import sys

# Ensure ml-service root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.prediction.predictor import Predictor, ModelNotFoundError


def test_predictor_singleton():
    """Predictor should initialize as a singleton with model metadata."""
    predictor = Predictor.get_instance()
    assert predictor is not None
    assert any(predictor.model_version.startswith(p) for p in ["XGB", "LGBM", "GB", "RF", "LR"])
    assert predictor.algorithm in [
        "XGBRegressor",
        "LGBMRegressor",
        "GradientBoostingRegressor",
        "RandomForestRegressor",
        "LinearRegression",
    ]
    assert predictor.pipeline is not None


def test_predict_valid_inputs():
    """Predict should calculate positive price and price_per_sqft."""
    predictor = Predictor.get_instance()
    result = predictor.predict(
        area=2200.0,
        bedrooms=3,
        bathrooms=2,
        location="Colombo",
        house_age=5,
        parking=1,
    )
    assert "predicted_price" in result
    assert result["predicted_price"] > 0
    assert result["price_per_sqft"] > 0
    assert result["model_version"] == predictor.model_version
    assert "area" in result["feature_importance"]


def test_predict_all_locations():
    """Predict should work for all supported locations."""
    predictor = Predictor.get_instance()
    for loc in ["Colombo", "Kandy", "Galle", "Negombo"]:
        result = predictor.predict(
            area=1500.0,
            bedrooms=2,
            bathrooms=1,
            location=loc,
            house_age=3,
            parking=1,
        )
        assert result["predicted_price"] > 0


def test_shap_waterfall_breakdown():
    """Verify SHAP Waterfall mathematical conservation and factor structure."""
    predictor = Predictor.get_instance()
    result = predictor.predict(
        area=2400.0,
        bedrooms=4,
        bathrooms=3,
        location="Colombo",
        house_age=4,
        parking=2,
    )
    assert "shap_breakdown" in result
    shap_info = result["shap_breakdown"]
    assert shap_info is not None

    base_val = shap_info["base_value_lkr"]
    final_val = shap_info["final_predicted_price_lkr"]
    net_impact = shap_info["net_impact_lkr"]
    factors = shap_info["factors"]

    assert len(factors) == 6
    assert abs((base_val + net_impact) - final_val) < 0.05
    factor_sum = sum(f["impact_lkr"] for f in factors)
    assert abs(factor_sum - net_impact) < 0.05
    assert len(shap_info["summary"]) > 20

