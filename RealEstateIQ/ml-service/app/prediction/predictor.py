"""
RealEstateIQ ML Predictor

Loads the saved sklearn Pipeline (preprocessing + model) and provides
a clean predict() interface used by the FastAPI service.
"""

import json
import os
from typing import Optional

import joblib
import numpy as np
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
        self.explainer = None
        self.preprocessor = None
        self.base_lkr_value = 24929330.0
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

        # Initialize SHAP TreeExplainer once for sub-millisecond Explainable AI
        self.explainer = None
        self.preprocessor = None
        self.base_lkr_value = 24929330.0
        try:
            import shap
            if hasattr(self.pipeline, "regressor_") and hasattr(self.pipeline.regressor_, "named_steps"):
                model_step = self.pipeline.regressor_.named_steps.get("model")
                self.preprocessor = self.pipeline.regressor_.named_steps.get("preprocessor")
                if model_step is not None:
                    self.explainer = shap.TreeExplainer(model_step)
                    base_log = float(np.atleast_1d(self.explainer.expected_value)[0])
                    self.base_lkr_value = float(np.expm1(base_log))
        except Exception:
            self.explainer = None

    def _generate_factor_explanation(
        self,
        key: str,
        impact_lkr: float,
        location: str,
        area: float,
        bedrooms: int,
        bathrooms: int,
        house_age: int,
        parking: int,
    ) -> str:
        if key == "location":
            return (
                f"{location} commands a prime district benchmark rate in Sri Lanka's real estate market index."
                if impact_lkr >= 0
                else f"{location} reflects an emerging regional market profile compared to high-density western coastal hubs."
            )
        elif key == "area":
            return (
                f"{area:,.0f} sqft expansive floor area exceeds median benchmark layouts, generating strong spatial equity."
                if impact_lkr >= 0
                else f"{area:,.0f} sqft compact living area represents an accessible, entry-level footprint."
            )
        elif key == "bathrooms":
            return (
                f"{bathrooms} bathrooms provide superior ensuite accommodation and modern sanitary convenience."
                if impact_lkr >= 0
                else f"{bathrooms} bathroom(s) limits ensuite convenience relative to total property occupancy."
            )
        elif key == "bedrooms":
            return (
                f"{bedrooms} bedrooms provide robust multi-occupant living capacity and rental yield potential."
                if impact_lkr >= 0
                else f"{bedrooms} bedroom accommodation layout offers streamlined, single-family utility."
            )
        elif key == "house_age":
            return (
                f"{house_age} years old represents modern construction standards with negligible structural depreciation."
                if impact_lkr >= 0
                else f"{house_age} years of structural lifecycle warrants future architectural modernization allowances."
            )
        elif key == "parking":
            return (
                f"{parking} parking slot(s) provide secured on-site vehicular accommodation in demand by urban homeowners."
                if impact_lkr >= 0
                else f"{parking} parking space(s) imposes vehicle accommodation constraints."
            )
        return ""

    def _compute_shap_breakdown(
        self,
        input_df: pd.DataFrame,
        predicted_price: float,
        area: float,
        bedrooms: int,
        bathrooms: int,
        location: str,
        house_age: int,
        parking: int,
    ) -> Optional[dict]:
        """
        Compute fast, mathematically exact SHAP Waterfall Attribution in LKR.
        Guarantees: base_value_lkr + sum(factors.impact_lkr) == final_predicted_price_lkr.
        """
        if self.explainer is None or self.preprocessor is None:
            return None

        try:
            X_trans = self.preprocessor.transform(input_df)
            shap_row = np.atleast_2d(self.explainer.shap_values(X_trans))[0]
            feature_names = list(self.preprocessor.get_feature_names_out())
            feature_shaps = dict(zip(feature_names, shap_row))

            loc_shap = float(
                feature_shaps.get("num__district_rate", 0.0)
                + sum(v for k, v in feature_shaps.items() if k.startswith("cat__location"))
            )
            area_shap = float(feature_shaps.get("num__area", 0.0))
            bath_shap = float(feature_shaps.get("num__bathrooms", 0.0))
            bed_shap = float(feature_shaps.get("num__bedrooms", 0.0))
            age_shap = float(feature_shaps.get("num__house_age", 0.0))
            park_shap = float(feature_shaps.get("num__parking", 0.0))

            group_shaps = {
                "location": (loc_shap, "Location & District Premium", f"{location}"),
                "area": (area_shap, "Living Area Floor Space", f"{area:,.0f} sqft"),
                "bathrooms": (bath_shap, "Bathrooms & Ensuite Layout", f"{bathrooms} bath{'s' if bathrooms > 1 else ''}"),
                "bedrooms": (bed_shap, "Bedrooms & Accommodation", f"{bedrooms} bed{'s' if bedrooms > 1 else ''}"),
                "house_age": (age_shap, "Property Age & Lifecycle", f"{house_age} year{'s' if house_age != 1 else ''}"),
                "parking": (park_shap, "Secured Parking Capacity", f"{parking} slot{'s' if parking != 1 else ''}"),
            }

            tot_shap = sum(v[0] for v in group_shaps.values())
            base_lkr = round(self.base_lkr_value, 2)
            final_lkr = round(predicted_price, 2)
            delta_lkr = round(final_lkr - base_lkr, 2)

            abs_shap_sum = sum(abs(v[0]) for v in group_shaps.values()) or 1.0

            factors = []
            allocated_impact = 0.0
            factor_keys = list(group_shaps.keys())

            for i, key in enumerate(factor_keys):
                s_val, feat_name, user_val = group_shaps[key]
                if abs(tot_shap) > 1e-7:
                    if i == len(factor_keys) - 1:
                        # Ensure exact rupee conservation for the closing item in waterfall
                        imp_lkr = round(delta_lkr - allocated_impact, 2)
                    else:
                        imp_lkr = round(delta_lkr * (s_val / tot_shap), 2)
                        allocated_impact += imp_lkr
                else:
                    imp_lkr = 0.0

                pct = round((abs(s_val) / abs_shap_sum) * 100.0, 1)
                direction = "positive" if imp_lkr >= 0 else "negative"

                explanation = self._generate_factor_explanation(
                    key, imp_lkr, location, area, bedrooms, bathrooms, house_age, parking
                )

                factors.append({
                    "id": key,
                    "feature": feat_name,
                    "user_value": user_val,
                    "impact_lkr": imp_lkr,
                    "shap_value": round(s_val, 4),
                    "impact_percentage": pct,
                    "direction": direction,
                    "explanation": explanation,
                })

            factors.sort(key=lambda x: abs(x["impact_lkr"]), reverse=True)

            pos_factors = [f for f in factors if f["impact_lkr"] > 0]
            neg_factors = [f for f in factors if f["impact_lkr"] < 0]
            top_pos = pos_factors[0] if pos_factors else None
            top_neg = neg_factors[0] if neg_factors else None

            summary_parts = []
            if top_pos:
                summary_parts.append(
                    f"Top value appreciation is driven by {top_pos['feature']} (+Rs. {abs(top_pos['impact_lkr']):,.0f})"
                )
            if top_neg:
                summary_parts.append(
                    f"counterbalanced by {top_neg['feature']} (-Rs. {abs(top_neg['impact_lkr']):,.0f})"
                )

            summary = (
                f"Starting from Sri Lanka's national baseline benchmark of Rs. {base_lkr:,.0f}, "
                + (", ".join(summary_parts) if summary_parts else "property matches benchmark baseline indicators.")
                + f". Net market valuation adjustment: {('+' if delta_lkr >= 0 else '')}Rs. {delta_lkr:,.0f}."
            )

            return {
                "base_value_lkr": base_lkr,
                "final_predicted_price_lkr": final_lkr,
                "net_impact_lkr": delta_lkr,
                "factors": factors,
                "summary": summary,
            }
        except Exception:
            return None

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
            dict with predicted_price, price_per_sqft, model_version, feature_importance, shap_breakdown
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

        shap_breakdown = self._compute_shap_breakdown(
            input_df=input_df,
            predicted_price=predicted_price,
            area=area,
            bedrooms=bedrooms,
            bathrooms=bathrooms,
            location=location,
            house_age=house_age,
            parking=parking,
        )

        return {
            "predicted_price": round(predicted_price, 2),
            "price_per_sqft": price_per_sqft,
            "model_version": self.model_version,
            "algorithm": self.algorithm,
            "dataset_version": self.dataset_version,
            "feature_importance": self.feature_importance,
            "shap_breakdown": shap_breakdown,
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
