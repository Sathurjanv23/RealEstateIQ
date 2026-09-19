"""
RealEstateIQ ML Training Pipeline

Trains and evaluates multiple regression models on the house price dataset.
Selects the best model based on R2 score on the test set.
Saves the full sklearn Pipeline (preprocessing + model) using joblib.

Dataset: Synthetic augmented dataset (100 rows) based on Sri Lanka real estate features.
NOTE: This dataset is synthetic and should not be interpreted as real market data.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeRegressor

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "house_data_extended.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")
METADATA_PATH = os.path.join(MODELS_DIR, "model_metadata.json")

# Feature Configuration
NUMERIC_FEATURES = ["area", "bedrooms", "bathrooms", "house_age", "parking"]
CATEGORICAL_FEATURES = ["location"]
TARGET = "price"
LOCATIONS = ["Colombo", "Kandy", "Galle", "Negombo"]
DATASET_VERSION = "v3.0-authentic-sl-real-estate-14937rows"
MODEL_VERSION_PREFIX = {
    "LinearRegression": "LR",
    "DecisionTreeRegressor": "DT",
    "RandomForestRegressor": "RF",
    "GradientBoostingRegressor": "GB",
}


def load_and_validate(path: str) -> pd.DataFrame:
    """Load CSV and validate expected columns."""
    df = pd.read_csv(path)
    required = set(NUMERIC_FEATURES + CATEGORICAL_FEATURES + [TARGET])
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns in dataset: {missing}")
    print(f"[OK] Dataset loaded: {len(df)} rows, {len(df.columns)} columns")
    print(f"     Missing values: {df.isnull().sum().sum()}")
    return df


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Drop rows with any missing values and remove duplicates."""
    before = len(df)
    df = df.dropna()
    df = df.drop_duplicates()
    after = len(df)
    if before != after:
        print(f"     Cleaned: {before - after} rows removed")
    # Validate location values
    invalid_loc = ~df["location"].isin(LOCATIONS)
    if invalid_loc.any():
        df = df[~invalid_loc]
        print(f"     Removed {invalid_loc.sum()} rows with unknown locations")
    return df


def build_preprocessor() -> ColumnTransformer:
    """
    Build a ColumnTransformer that:
    - StandardScales numeric features
    - OneHotEncodes the location column (drop='first' to avoid multicollinearity)
    """
    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(
        categories=[LOCATIONS],
        drop="first",
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
    """Return candidate models for comparison."""
    return {
        "LinearRegression": LinearRegression(),
        "DecisionTreeRegressor": DecisionTreeRegressor(random_state=42),
        "RandomForestRegressor": RandomForestRegressor(
            n_estimators=100, random_state=42
        ),
        "GradientBoostingRegressor": GradientBoostingRegressor(
            n_estimators=100, random_state=42, learning_rate=0.1
        ),
    }


def evaluate_model(
    pipeline: Pipeline, X_train, X_test, y_train, y_test, model_name: str
) -> dict:
    """Fit pipeline and compute evaluation metrics on the test set."""
    pipeline.fit(X_train, y_train)
    preds = pipeline.predict(X_test)

    mae = float(mean_absolute_error(y_test, preds))
    rmse = float(np.sqrt(mean_squared_error(y_test, preds)))
    r2 = float(r2_score(y_test, preds))

    # Cross-validation for robustness
    kf = KFold(n_splits=5, shuffle=True, random_state=42)
    # Combine train + test for CV (we have only 100 rows)
    X_all = pd.concat([X_train, X_test])
    y_all = pd.concat([y_train, y_test])
    cv_r2 = cross_val_score(pipeline, X_all, y_all, cv=kf, scoring="r2")

    return {
        "model_name": model_name,
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "r2": round(r2, 4),
        "cv_r2_mean": round(float(cv_r2.mean()), 4),
        "cv_r2_std": round(float(cv_r2.std()), 4),
    }


def get_feature_importance(pipeline: Pipeline, model_name: str) -> dict:
    """Extract feature importance where supported."""
    model = pipeline.named_steps["model"]
    preprocessor = pipeline.named_steps["preprocessor"]

    # Build feature names after transformation
    num_names = NUMERIC_FEATURES.copy()
    # OneHotEncoder with drop='first': 3 dummy columns for 4 locations
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
        # For linear models, use absolute coefficients (normalised)
        coefs = np.abs(model.coef_)
        total = coefs.sum()
        importance_dict = {
            name: round(float(c / total), 6) if total > 0 else 0.0
            for name, c in zip(all_names, coefs)
        }
    return importance_dict


def train():
    """Full training pipeline: load -> validate -> clean -> split -> compare -> select -> save."""
    os.makedirs(MODELS_DIR, exist_ok=True)

    # Load & prepare data
    df = load_and_validate(DATA_PATH)
    df = clean_data(df)

    X = df[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"\n[INFO] Train: {len(X_train)} rows | Test: {len(X_test)} rows")

    # Compare models
    preprocessor = build_preprocessor()
    candidates = get_candidate_models()
    results = []

    print("\n[INFO] Training and evaluating models...\n")
    for model_name, model in candidates.items():
        pipeline = Pipeline(
            steps=[("preprocessor", preprocessor), ("model", model)]
        )
        metrics = evaluate_model(
            pipeline, X_train, X_test, y_train, y_test, model_name
        )
        results.append(metrics)
        print(
            f"  {model_name:<30} MAE={metrics['mae']:>10,.0f}  "
            f"RMSE={metrics['rmse']:>10,.0f}  "
            f"R2={metrics['r2']:.4f}  "
            f"CV-R2={metrics['cv_r2_mean']:.4f}+/-{metrics['cv_r2_std']:.4f}"
        )

    # Select best model
    best = max(results, key=lambda r: r["r2"])
    best_model_name = best["model_name"]
    print(f"\n[WINNER] Best model: {best_model_name} (R2={best['r2']})")

    # Retrain best model on all data for the final saved pipeline
    best_pipeline = Pipeline(
        steps=[
            ("preprocessor", build_preprocessor()),
            ("model", candidates[best_model_name]),
        ]
    )
    best_pipeline.fit(X_train, y_train)

    # Feature importance
    importance = get_feature_importance(best_pipeline, best_model_name)
    print("\n[INFO] Feature Importance:")
    for feat, val in sorted(importance.items(), key=lambda x: -x[1]):
        bar = "#" * int(val * 40)
        print(f"  {feat:<30} {bar} {val:.4f}")

    # Save artifacts
    prefix = MODEL_VERSION_PREFIX.get(best_model_name, "ML")
    version = f"{prefix}-v1.0"
    model_filename = f"pipeline_{version.lower().replace('-', '_')}.joblib"
    model_path = os.path.join(MODELS_DIR, model_filename)

    joblib.dump(best_pipeline, model_path)
    print(f"\n[SAVED] Pipeline -> {model_path}")

    # Save metadata
    metadata = {
        "selected_model": {
            "model_name": best_model_name,
            "version": version,
            "algorithm": best_model_name,
            "metrics": {
                "mae": best["mae"],
                "rmse": best["rmse"],
                "r2": best["r2"],
                "cv_r2_mean": best["cv_r2_mean"],
                "cv_r2_std": best["cv_r2_std"],
            },
            "feature_importance": importance,
            "dataset_version": DATASET_VERSION,
            "training_date": datetime.utcnow().isoformat() + "Z",
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

    print("\n[OK] Training complete.\n")
    print("=" * 60)
    print("MODEL EVALUATION SUMMARY")
    print("=" * 60)
    print(f"Selected Model : {best_model_name}")
    print(f"Version        : {version}")
    print(f"MAE            : {best['mae']:,.2f}")
    print(f"RMSE           : {best['rmse']:,.2f}")
    print(f"R2             : {best['r2']:.4f}")
    print(f"CV R2 (mean)   : {best['cv_r2_mean']:.4f} +/- {best['cv_r2_std']:.4f}")
    print(f"Dataset        : {DATASET_VERSION}")
    print("=" * 60)
    print(
        "\nNOTE: Dataset is synthetic/augmented. "
        "Metrics are real but reflect synthetic data patterns.\n"
    )

    return metadata


if __name__ == "__main__":
    train()
