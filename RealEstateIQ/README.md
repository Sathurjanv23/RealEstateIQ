# RealEstateIQ — AI-Powered Real Estate Intelligence Platform

> A portfolio-grade Full-Stack + Machine Learning application built with Next.js, Node.js/Express, Python/FastAPI, and MongoDB.

---

## ⚠️ Important Disclaimer

> **This application uses a synthetic/augmented dataset** created for demonstration purposes.
> ML metrics (MAE, RMSE, R²) are **real** — computed from actual model evaluation on the test split.
> However, the underlying data is not real Sri Lanka market data and should **not** be used for actual real estate decisions.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│              Next.js 15 Frontend (Port 3000)                │
│   TypeScript · React Query · Recharts · Tailwind CSS        │
└──────────────────────┬──────────────────────────────────────┘
                       │  REST API (JWT Auth)
                       ▼
┌──────────────────────────────────────────────────────────────┐
│          Node.js + Express Backend (Port 5000)               │
│   TypeScript · Mongoose · JWT · Bcrypt · Rate Limiting       │
└──────────────┬───────────────────────────┬───────────────────┘
               │  MongoDB                  │  HTTP (internal)
               ▼                           ▼
┌──────────────────────┐    ┌──────────────────────────────────┐
│  MongoDB Atlas       │    │  Python FastAPI ML Service        │
│  or Local :27017     │    │  (Port 8000)                      │
│  Mongoose ODM        │    │  scikit-learn · joblib · FastAPI  │
└──────────────────────┘    └──────────────────────────────────┘
```

### Rule: **Frontend NEVER directly communicates with the ML model.**
All ML predictions go through: `Frontend → Backend → ML Service → Backend → Frontend`

---

## Technology Stack

| Layer         | Technology                                              |
|---------------|---------------------------------------------------------|
| Frontend      | Next.js 15, TypeScript, Tailwind CSS, Recharts          |
| State/Data    | React Query, Axios, React Hot Toast                     |
| Backend       | Node.js, Express 4, TypeScript                          |
| Auth          | JWT (jsonwebtoken), Bcrypt (bcryptjs)                   |
| Database      | MongoDB, Mongoose ODM                                   |
| ML Service    | Python 3.12, FastAPI, scikit-learn, joblib              |
| Containers    | Docker, Docker Compose                                  |

---

## ML Model Details

| Metric         | Value                         |
|----------------|-------------------------------|
| Algorithm      | LinearRegression (selected from 4 candidates) |
| Version        | LR-v1.0                       |
| R²             | 0.9965                        |
| MAE            | Rs. 8,126.70                  |
| RMSE           | Rs. 11,157.90                 |
| CV R² Mean     | 0.9954 ± 0.0013               |
| Train / Test   | 79 / 20 rows                  |
| Dataset        | v1.0-synthetic-100rows        |

**Competing models:** Linear Regression, Decision Tree, Random Forest, Gradient Boosting
**Features:** area, bedrooms, bathrooms, location, house_age, parking

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- Python 3.12+
- MongoDB (local) OR MongoDB Atlas URI
- npm

### 1. ML Service

```bash
cd RealEstateIQ/ml-service

# Install Python dependencies
pip install fastapi uvicorn pydantic scikit-learn pandas numpy joblib

# Train the model (generates pipeline_lr_v1.0.joblib)
python training/train_pipeline.py

# Start ML service
python main.py
# → http://localhost:8000
# → http://localhost:8000/docs (Swagger UI)
```

### 2. Backend

```bash
cd RealEstateIQ/backend

# Install dependencies
npm install

# Copy env file
cp .env.example .env
# Edit .env — set MONGO_URI, JWT_SECRET, ML_SERVICE_URL

# Seed database (admin user + demo properties + ML model metadata)
npm run seed

# Start backend
npm run dev
# → http://localhost:5000
# → http://localhost:5000/health
```

### 3. Frontend

```bash
cd RealEstateIQ/frontend

# Install dependencies
npm install

# Create env file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Start frontend
npm run dev
# → http://localhost:3000
```

---

## Running Tests

### 1. Backend Automated Tests (Jest + Supertest)
```bash
cd RealEstateIQ/backend
npm test
# Runs 4 test suites: health, auth, market, and property endpoints
```

### 2. ML Service Tests (pytest)
```bash
cd RealEstateIQ/ml-service
python -m pytest tests/ -v
# Validates predictor singleton, input preprocessing, and predictions across all locations
```

### 3. Frontend Typecheck & Build
```bash
cd RealEstateIQ/frontend
npm run build
# Compiles all 23 Next.js TypeScript pages and validates static generation
```

---

## Demo Credentials

| Role  | Email                          | Password       |
|-------|--------------------------------|----------------|
| User  | demo@realestate-iq.com         | User@123456    |
| Admin | admin@realestate-iq.com        | Admin@123456   |

---

## API Endpoints

### Auth
```
POST   /api/auth/register        Create account
POST   /api/auth/login           Login (returns JWT)
POST   /api/auth/logout          Logout
GET    /api/auth/me              Current user info
```

### Properties
```
GET    /api/properties           List (filter, search, paginate)
GET    /api/properties/:id       Get property
POST   /api/properties           Create property [auth]
PUT    /api/properties/:id       Update property [auth, owner/admin]
DELETE /api/properties/:id       Delete property [auth, owner/admin]
POST   /api/properties/:id/save  Save property [auth]
DELETE /api/properties/:id/save  Unsave property [auth]
GET    /api/properties/saved     Get saved [auth]
POST   /api/properties/compare   Compare up to 5 [auth]
```

### Predictions (ML)
```
POST   /api/predictions          Create prediction [auth] → calls ML service
GET    /api/predictions/history  My prediction history [auth]
GET    /api/predictions/:id      Get prediction [auth]
```

### Market
```
GET    /api/market/analytics        Market stats from DB
GET    /api/market/recommendations Rule-based recommendations [auth]
GET    /api/market/model-info       Live active ML model info & metrics
```

### Admin
```
GET    /api/admin/dashboard      Platform metrics [admin]
GET    /api/admin/users          List users [admin]
PUT    /api/admin/users/:id/role Update role [admin]
DELETE /api/admin/users/:id      Delete user [admin]
GET    /api/admin/predictions/analytics  Prediction stats [admin]
GET    /api/admin/models         ML model registry [admin]
PUT    /api/admin/models/:id/status  Change model status [admin]
GET    /api/admin/datasets       Dataset registry [admin]
GET    /api/admin/audit-logs     System audit trail [admin]
```

### ML Service (Internal)
```
GET    /health                   Health check
GET    /model-info               Model metadata
POST   /predict                  Price prediction
GET    /docs                     Swagger UI
```

---

## Features

- 🏠 Property listing with search, filter, pagination
- 🧠 AI price prediction (LR model, R²=0.9965)
- 📊 Market analytics with Recharts visualizations
- ⭐ Rule-based property recommendations (transparent scoring)
- 🔄 Property comparison (up to 5)
- 🔖 Save/bookmark properties
- 👤 JWT authentication + bcrypt password hashing
- 🛡️ Role-based access (USER / ADMIN)
- 📋 Full system audit log
- 🎨 Dark mode glassmorphism UI

---

## Project Structure

```
RealEstateIQ/
├── ml-service/              # Python FastAPI ML service
│   ├── app/
│   │   ├── api/routes.py    # Endpoints: /predict /health /model-info
│   │   ├── prediction/      # Predictor singleton
│   │   └── schemas/         # Pydantic input/output schemas
│   ├── training/
│   │   └── train_pipeline.py  # Model comparison + serialization
│   ├── models/              # Saved joblib pipeline + metadata
│   └── data/                # Synthetic training dataset
│
├── backend/                 # Node.js Express API
│   └── src/
│       ├── app.ts           # Entry point + middleware
│       ├── controllers/     # authController, propertyController...
│       ├── routes/          # authRoutes, propertyRoutes...
│       ├── models/          # Mongoose schemas
│       ├── middleware/       # auth, errorHandler, validate
│       └── utils/           # logger, mlClient, auditLogger, seeder
│
├── frontend/                # Next.js application
│   └── src/
│       ├── pages/           # All pages (index, login, dashboard...)
│       ├── components/      # Layout, UI components
│       ├── context/         # AuthContext
│       ├── services/        # API call functions
│       └── types/           # TypeScript interfaces
│
├── docs/                    # Architecture documentation
└── docker-compose.yml       # Multi-service orchestration
```

---

*Built as a portfolio demonstration project. ML metrics are real; dataset is synthetic.*
