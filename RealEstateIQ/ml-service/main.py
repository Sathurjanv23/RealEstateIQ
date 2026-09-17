"""
RealEstateIQ ML Service — FastAPI Application Entry Point
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.prediction.predictor import ModelNotFoundError, Predictor


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-load the model at startup."""
    try:
        predictor = Predictor.get_instance()
        print(
            f"[OK] Model loaded: {predictor.model_version} ({predictor.algorithm})"
        )
    except ModelNotFoundError as e:
        print(f"[WARNING] {e}")
        print("   The /predict endpoint will return 503 until the model is trained.")
    yield


app = FastAPI(
    title="RealEstateIQ ML Service",
    description=(
        "AI-powered property price prediction API. "
        "All predictions are ML estimates from a model trained on synthetic data."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow requests from the Node.js backend
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5000,http://backend:5000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(router, prefix="")

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
