"""
RealEstateIQ ML Predictor

Loads the saved sklearn Pipeline (preprocessing + model) and provides
a clean predict() interface used by the FastAPI service.
"""

import json
import os
from typing import Optional

import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "models")
METADATA_PATH = os.path.join(MODELS_DIR, "model_metadata.json")

NUMERIC_FEATURES = ["area", "bedrooms", "bathrooms", "house_age", "parking", "district_rate"]
CATEGORICAL_FEATURES = ["location"]


class ModelNotFoundError(Exception):
    pass


class Predictor:
    """
    Loads the saved pipeline once and keeps it in memory.
    Thread-safe for read operations (joblib pipelines are stateless at inference).
    """

    _instance: Optional["Predictor"] = None

    def __init__(self):
        self.pipeline = None
        self.metadata = None
        self.model_version = "unknown"
        self.feature_importance = {}
        self._load()

    @classmethod
    def get_instance(cls) -> "Predictor":
        """Singleton accessor — loads model once."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @classmethod
    def reload(cls) -> "Predictor":
        """Force reload (used after retraining)."""
        cls._instance = cls()
        return cls._instance

    def _load(self):
        if not os.path.exists(METADATA_PATH):
            raise ModelNotFoundError(
                f"Model metadata not found at {METADATA_PATH}. "
                "Run training/train_pipeline.py first."
            )

        with open(METADATA_PATH, "r") as f:
            self.metadata = json.load(f)

        selected = self.metadata["selected_model"]
        model_file = selected["model_file"]
        model_path = os.path.join(MODELS_DIR, model_file)

        if not os.path.exists(model_path):
            raise ModelNotFoundError(
                f"Model file not found: {model_path}. "
                "Run training/train_pipeline.py first."
            )

        self.pipeline = joblib.load(model_path)
        self.model_version = selected["version"]
        self.feature_importance = selected.get("feature_importance", {})
        self.district_rates = selected.get("district_rates", {})
        self.algorithm = selected["algorithm"]
        self.metrics = selected["metrics"]
        self.dataset_version = selected["dataset_version"]

    def predict(
        self,
        area: float,
        bedrooms: int,
        bathrooms: int,
        location: str,
        house_age: int,
        parking: int,
    ) -> dict:
        """
        Run prediction through the saved preprocessing + model pipeline.

        Args:
            area: Area in square feet
            bedrooms: Number of bedrooms
            bathrooms: Number of bathrooms
            location: One of 23 Sri Lanka districts
            house_age: Age of the house in years
            parking: Number of parking spaces

        Returns:
            dict with predicted_price, price_per_sqft, model_version, feature_importance
        """
        if self.pipeline is None:
            raise ModelNotFoundError("Pipeline not loaded.")

        # Benchmark rate for district (or national average if unknown)
        d_rate = float(
            self.district_rates.get(
                str(location),
                self.district_rates.get("national_avg", 10000.0)
            )
        )

        # Build input DataFrame matching training feature order
        input_df = pd.DataFrame(
            {
                "area": [float(area)],
                "bedrooms": [int(bedrooms)],
                "bathrooms": [int(bathrooms)],
                "house_age": [int(house_age)],
                "parking": [int(parking)],
                "district_rate": [d_rate],
                "location": [str(location)],
            }
        )[NUMERIC_FEATURES + CATEGORICAL_FEATURES]

        predicted_price = float(self.pipeline.predict(input_df)[0])
        # Safeguard lower bound (minimum realistic home in SL)
        predicted_price = max(1000000.0, predicted_price)
        price_per_sqft = round(predicted_price / area, 2) if area > 0 else None

        return {
            "predicted_price": round(predicted_price, 2),
            "price_per_sqft": price_per_sqft,
            "model_version": self.model_version,
            "algorithm": self.algorithm,
            "dataset_version": self.dataset_version,
            "feature_importance": self.feature_importance,
        }

    def get_model_info(self) -> dict:
        """Return model metadata for health/info endpoints."""
        return {
            "model_version": self.model_version,
            "algorithm": self.algorithm,
            "metrics": self.metrics,
            "dataset_version": self.dataset_version,
            "feature_importance": self.feature_importance,
            "status": "loaded",
        }
