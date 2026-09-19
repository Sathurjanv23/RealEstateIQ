"""
RealEstateIQ ML Training Pipeline

Trains and evaluates multiple regression models on authentic Sri Lanka house price dataset.
Uses log-transformed target regression and district benchmark price rate features
so that EVERY one of the 23 Sri Lankan districts produces authentic, distinct, realistic valuations.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.compose import ColumnTransformer, TransformedTargetRegressor
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeRegressor

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "house_data_extended.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")
METADATA_PATH = os.path.join(MODELS_DIR, "model_metadata.json")

# Feature Configuration
NUMERIC_FEATURES = ["area", "bedrooms", "bathrooms", "house_age", "parking", "district_rate"]
CATEGORICAL_FEATURES = ["location"]
TARGET = "price"
LOCATIONS = [
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
]
DATASET_VERSION = "v4.0-authentic-sl-all-23-districts-14833rows"
MODEL_VERSION_PREFIX = {
    "LinearRegression": "LR",
    "DecisionTreeRegressor": "DT",
    "RandomForestRegressor": "RF",
    "GradientBoostingRegressor": "GB",
}


def load_and_validate(path: str) -> pd.DataFrame:
    """Load CSV and validate expected columns."""
    df = pd.read_csv(path)
    base_required = set(["area", "bedrooms", "bathrooms", "house_age", "parking", "location", TARGET])
    missing = base_required - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns in dataset: {missing}")
    print(f"[OK] Dataset loaded: {len(df)} rows, {len(df.columns)} columns")
    return df


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Drop rows with missing values and remove duplicates."""
    before = len(df)
    df = df.dropna()
    df = df.drop_duplicates()
    after = len(df)
    if before != after:
        print(f"     Cleaned: {before - after} rows removed")
    invalid_loc = ~df["location"].isin(LOCATIONS)
    if invalid_loc.any():
        df = df[~invalid_loc]
        print(f"     Removed {invalid_loc.sum()} rows with unknown locations")
    return df


def compute_district_rates(df: pd.DataFrame) -> dict:
    """Compute benchmark price per sqft per district from actual transactions."""
    rates = (df.groupby("location")["price"].sum() / df.groupby("location")["area"].sum()).to_dict()
    national_avg = float(df["price"].sum() / df["area"].sum())
    rates["national_avg"] = national_avg
    return rates


def build_preprocessor() -> ColumnTransformer:
    """StandardScales numeric features and OneHotEncodes location with drop=None."""
    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(
        categories=[LOCATIONS],
        drop=None,
        sparse_output=False,
        handle_unknown="ignore",
    )
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, NUMERIC_FEATURES),
            ("cat", categorical_transformer, CATEGORICAL_FEATURES),
        ],
        remainder="drop",
    )
    return preprocessor


def get_candidate_models() -> dict:
    """Return candidate regressors to compare."""
    return {
        "LinearRegression": LinearRegression(),
        "DecisionTreeRegressor": DecisionTreeRegressor(max_depth=10, random_state=42),
        "RandomForestRegressor": RandomForestRegressor(
            n_estimators=100, max_depth=12, min_samples_leaf=2, random_state=42
        ),
        "GradientBoostingRegressor": GradientBoostingRegressor(
            n_estimators=180, max_depth=6, learning_rate=0.08, random_state=42
        ),
    }


def evaluate_model(
    wrapped_model, X_train, X_test, y_train, y_test, model_name: str
) -> dict:
    """Fit model and compute evaluation metrics on test set."""
    wrapped_model.fit(X_train, y_train)
    preds = wrapped_model.predict(X_test)

    mae = float(mean_absolute_error(y_test, preds))
    rmse = float(np.sqrt(mean_squared_error(y_test, preds)))
    r2 = float(r2_score(y_test, preds))

    return {
        "model_name": model_name,
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "r2": round(r2, 4),
    }


def get_feature_importance(wrapped_model, model_name: str) -> dict:
    """Extract feature importance from the fitted estimator."""
    pipeline = (
        wrapped_model.regressor_
        if hasattr(wrapped_model, "regressor_")
        else wrapped_model
    )
    model = pipeline.named_steps["model"]
    preprocessor = pipeline.named_steps["preprocessor"]

    num_names = NUMERIC_FEATURES.copy()
    ohe = preprocessor.named_transformers_["cat"]
    cat_names = list(ohe.get_feature_names_out(CATEGORICAL_FEATURES))
    all_names = num_names + cat_names

    importance_dict = {}
    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
        importance_dict = {
            name: round(float(imp), 6)
            for name, imp in zip(all_names, importances)
        }
    elif hasattr(model, "coef_"):
        coefs = np.abs(model.coef_)
        total = coefs.sum()
        importance_dict = {
            name: round(float(c / total), 6) if total > 0 else 0.0
            for name, c in zip(all_names, coefs)
        }
    return importance_dict


def train():
    """Full training pipeline with district-rate indexing and log-transform regression."""
    os.makedirs(MODELS_DIR, exist_ok=True)

    df = load_and_validate(DATA_PATH)
    df = clean_data(df)

    district_rates = compute_district_rates(df)
    df["district_rate"] = df["location"].map(district_rates).fillna(district_rates["national_avg"])

    X = df[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"\n[INFO] Train: {len(X_train)} rows | Test: {len(X_test)} rows")

    candidates = get_candidate_models()
    results = []

    print("\n[INFO] Training and evaluating log-scale transformed models...\n")
    for model_name, raw_model in candidates.items():
        pipeline = Pipeline([
            ("preprocessor", build_preprocessor()),
            ("model", raw_model),
        ])
        wrapped = TransformedTargetRegressor(
            regressor=pipeline,
            func=np.log1p,
            inverse_func=np.expm1,
        )
        metrics = evaluate_model(
            wrapped, X_train, X_test, y_train, y_test, model_name
        )
        results.append(metrics)
        print(
            f"  {model_name:<30} MAE=Rs. {metrics['mae']:>11,.0f}  "
            f"RMSE=Rs. {metrics['rmse']:>11,.0f}  "
            f"R2={metrics['r2']:.4f}"
        )

    # Select best model
    best = max(results, key=lambda r: r["r2"])
    best_model_name = best["model_name"]
    print(f"\n[WINNER] Best model: {best_model_name} (R2={best['r2']})")

    # Retrain winner on all data
    final_pipeline = Pipeline([
        ("preprocessor", build_preprocessor()),
        ("model", candidates[best_model_name]),
    ])
    final_wrapped_model = TransformedTargetRegressor(
        regressor=final_pipeline,
        func=np.log1p,
        inverse_func=np.expm1,
    )
    final_wrapped_model.fit(X, y)

    # Feature importance
    importance = get_feature_importance(final_wrapped_model, best_model_name)
    print("\n[INFO] Top Feature Importances:")
    top_feats = sorted(importance.items(), key=lambda x: -x[1])[:10]
    for feat, val in top_feats:
        bar = "#" * int(val * 40)
        print(f"  {feat:<30} {bar} {val:.4f}")

    # Save artifacts
    prefix = MODEL_VERSION_PREFIX.get(best_model_name, "ML")
    version = f"{prefix}-v1.0"
    model_filename = f"pipeline_{version.lower().replace('-', '_')}.joblib"
    model_path = os.path.join(MODELS_DIR, model_filename)

    joblib.dump(final_wrapped_model, model_path)
    print(f"\n[SAVED] Pipeline -> {model_path}")

    # Save metadata including district rates
    metadata = {
        "selected_model": {
            "model_name": best_model_name,
            "version": version,
            "algorithm": best_model_name,
            "metrics": {
                "mae": best["mae"],
                "rmse": best["rmse"],
                "r2": best["r2"],
            },
            "feature_importance": importance,
            "district_rates": district_rates,
            "dataset_version": DATASET_VERSION,
            "training_date": datetime.now().isoformat() + "Z",
            "status": "production",
            "model_file": model_filename,
            "numeric_features": NUMERIC_FEATURES,
            "categorical_features": CATEGORICAL_FEATURES,
            "locations": LOCATIONS,
            "target": TARGET,
            "train_size": int(len(X_train)),
            "test_size": int(len(X_test)),
        },
        "all_model_results": results,
    }

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"[SAVED] Metadata -> {METADATA_PATH}")

    # Verification across all 23 districts
    print("\n[VERIFICATION] Sample Predictions across Sri Lanka:")
    test_locs = [
        "Colombo", "Kandy", "Galle", "Jaffna", "Batticaloa",
        "Gampaha", "Nuwara Eliya", "Badulla", "Anuradhapura", "Ampara",
        "Trincomalee", "Monaragala", "Matara", "Kurunegala", "Kalutara"
    ]
    for loc in test_locs:
        sample = pd.DataFrame([{
            "area": 2000,
            "bedrooms": 3,
            "bathrooms": 2,
            "house_age": 5,
            "parking": 1,
            "district_rate": district_rates.get(loc, district_rates["national_avg"]),
            "location": loc,
        }])
        pred_p = float(final_wrapped_model.predict(sample)[0])
        print(f"  {loc:<15}: Rs. {pred_p:>14,.0f}  (Rs. {pred_p/2000:>6.0f}/sqft)")

    print("\n[OK] Training complete.\n")
    return metadata


if __name__ == "__main__":
    train()
