# Current System Analysis

## Original Project: real-estate-house-price-prediction-ml

**Inspection Date:** 2026-09-17  
**Inspected By:** RealEstateIQ Migration Assessment

---

## 1. Existing Architecture

```
real-estate-house-price-prediction-ml/
├── data/
│   └── house_data.csv          ← 10-row synthetic dataset
├── src/
│   ├── data_preprocessing.py   ← Data loading + encoding
│   ├── train_model.py          ← Training script
│   ├── evaluate_model.py       ← Evaluation script
│   └── predict_price.py        ← Single prediction function
├── app.py                      ← Streamlit UI
├── requirements.txt            ← pandas, numpy, scikit-learn, streamlit
└── README.md
```

---

## 2. Dataset Analysis

**File:** `data/house_data.csv`  
**Rows:** 10 (fully synthetic, Sri Lanka context)  
**Columns:** 7

| Column     | Type        | Values                             |
|------------|-------------|------------------------------------|
| area       | numeric     | 1000–3500 sqft                     |
| bedrooms   | numeric     | 2–5                                |
| bathrooms  | numeric     | 1–4                                |
| location   | categorical | Colombo, Kandy, Galle, Negombo     |
| house_age  | numeric     | 1–10 years                         |
| parking    | numeric     | 1–3 spaces                         |
| price      | numeric     | 250,000–820,000 (target, LKR)      |

**Critical limitation:** 10 rows — with 80/20 split, model trains on 8 rows and tests on 2 rows. Evaluation metrics are computed honestly but carry very high statistical variance due to sample size.

---

## 3. Existing ML Pipeline

```
house_data.csv
     ↓
load_data()          ← pd.read_csv
     ↓
preprocess_data()    ← dropna + get_dummies(location, drop_first=True)
     ↓
split_data()         ← train_test_split(test_size=0.2, random_state=42)
     ↓
RandomForestRegressor(n_estimators=100, random_state=42)
     ↓
model.fit(X_train, y_train)
     ↓
Evaluate: MAE, MSE, R²
     ↓
pickle.dump(model) → models/house_price_model.pkl
```

**Encoded columns after get_dummies (drop_first=True):**
- `location_Galle`
- `location_Kandy`
- `location_Negombo`
(Colombo is the dropped reference category)

---

## 4. Existing Prediction Code

```python
def predict_house_price(area, bedrooms, bathrooms, location, house_age, parking):
    # Loads model fresh on every call
    with open(MODEL_PATH, "rb") as file:
        model = pickle.load(file)

    # Manually reconstructs encoded DataFrame — FRAGILE
    input_data = pd.DataFrame({
        "area": [area],
        "bedrooms": [bedrooms],
        "bathrooms": [bathrooms],
        "house_age": [house_age],
        "parking": [parking],
        "location_Galle": [1 if location == "Galle" else 0],
        "location_Kandy": [1 if location == "Kandy" else 0],
        "location_Negombo": [1 if location == "Negombo" else 0],
    })

    return model.predict(input_data)[0]
```

**Problems identified:**
1. Hardcoded one-hot encoding — breaks if dataset changes
2. No pipeline serialization — preprocessing logic not saved
3. Model loaded on every prediction call (no caching)
4. Uses `pickle` instead of `joblib`
5. No input validation
6. No versioning

---

## 5. Existing UI

`app.py` — Streamlit UI:
- 6 inputs: area, bedrooms, bathrooms, location, house_age, parking
- Single button: "Predict Price"
- Displays raw predicted number
- No authentication, no history, no comparison

---

## 6. Existing Dependencies

```
pandas
numpy
scikit-learn
streamlit
```

---

## 7. Problems & Limitations

| Problem | Severity | Migration Action |
|---------|----------|-----------------|
| 10-row dataset | Critical | Expand to 100 rows synthetically, document clearly |
| No pipeline serialization | High | Use sklearn Pipeline + joblib |
| Hardcoded encoding | High | Replace with saved ColumnTransformer |
| No API | Critical | Create FastAPI service |
| No authentication | Critical | Create JWT auth in Node.js backend |
| No database | Critical | Create MongoDB with Mongoose |
| No frontend | Critical | Create Next.js frontend |
| No testing | High | Create test suite |
| Streamlit-coupled ML | High | Separate ML logic from UI |
| No model versioning | Medium | Create ml_models collection |
| pickle usage | Medium | Replace with joblib |
| No error handling | High | Centralized error middleware |

---

## 8. Reusable Code

| Element | Reuse Decision |
|---------|---------------|
| Feature set (6 columns) | ✅ Keep — forms the model input schema |
| Location values (4 cities) | ✅ Keep — used for frontend dropdowns and encoding |
| Dataset CSV | ✅ Keep as seed, augment to 100 rows |
| preprocessing concept | ✅ Keep but refactor into sklearn Pipeline |
| RandomForestRegressor | ✅ Keep as one candidate among 4 models |
| Model comparison idea | ✅ Expand — evaluate 4 models, select best |
| MAE/R² metrics | ✅ Keep — computed honestly |

---

## 9. Migration Strategy

### Phase 1: ML Core
- Augment dataset to 100 rows (clearly documented as synthetic)
- Implement sklearn Pipeline with ColumnTransformer
- Compare 4 models: LinearRegression, DecisionTree, RandomForest, GradientBoosting
- Select best model by R² on test set
- Save full pipeline (preprocessing + model) with joblib
- Create prediction module using saved pipeline

### Phase 2: FastAPI ML Service
- Wrap prediction module in FastAPI
- Input validation via Pydantic
- Health endpoint
- Predict endpoint
- Feature importance endpoint

### Phase 3: Database (MongoDB)
- 7 collections: users, properties, predictions, saved_properties, ml_models, datasets, audit_logs
- Mongoose schemas
- Appropriate indexes

### Phase 4: Node.js Backend
- Express + TypeScript
- Auth: JWT + bcrypt
- Property CRUD + search/filter
- Prediction orchestration (calls FastAPI)
- Audit logging
- Admin APIs

### Phase 5: Next.js Frontend
- Professional dark theme
- 15+ pages
- Real API integration

### Phase 6: DevOps + Docs
- Docker Compose
- README
- API docs
- ML pipeline docs
