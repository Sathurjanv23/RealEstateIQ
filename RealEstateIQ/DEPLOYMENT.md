# RealEstateIQ — Production Deployment Guide

A step-by-step walkthrough for deploying the full RealEstateIQ stack to:
- **Frontend** → Vercel
- **Backend + ML Service** → Render
- **Database** → MongoDB Atlas (already configured)
- **Image Storage** → Cloudinary
- **Email** → Gmail (App Password) or SendGrid

---

## 1. Prerequisites

| Requirement | Setup Link |
|---|---|
| MongoDB Atlas account | https://www.mongodb.com/cloud/atlas |
| Render account | https://render.com |
| Vercel account | https://vercel.com |
| Cloudinary account (free tier OK) | https://cloudinary.com |
| Gmail App Password **or** SendGrid API key | https://myaccount.google.com/apppasswords |

---

## 2. Cloudinary Setup (Image Storage)

1. Sign up / log in at https://console.cloudinary.com
2. From the **Dashboard**, note your:
   - `Cloud name`
   - `API Key`
   - `API Secret`
3. These go into the backend environment variables as:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```
   When these are set, uploaded property images are stored in Cloudinary under the `realestate-iq/properties/` folder and delivered via CDN automatically.

---

## 3. SMTP Email Setup

### Option A — Gmail App Password (free, simple)

1. Enable 2-Factor Authentication on your Google Account.
2. Go to https://myaccount.google.com/apppasswords
3. Create an App Password → name it "RealEstateIQ".
4. Set:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=abcd efgh ijkl mnop   # 16-character App Password (no spaces)
   NOTIFICATION_EMAIL=admin@yourdomain.com
   ```

### Option B — SendGrid (recommended for production scale)

1. Sign up at https://sendgrid.com (free up to 100 emails/day)
2. Create an API key: Settings → API Keys → Create API Key (Full Access)
3. Set:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=SG.xxxxxxxxxxxx   # Your SendGrid API Key
   NOTIFICATION_EMAIL=admin@yourdomain.com
   ```

---

## 4. Deploy ML Service on Render

1. Go to https://dashboard.render.com → **New** → **Web Service**
2. Connect your GitHub repo.
3. Settings:
   - **Root directory**: `RealEstateIQ/ml-service`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variable: `PORT = 8000`
5. Note the deployed URL e.g. `https://realestate-iq-ml.onrender.com`

---

## 5. Deploy Backend API on Render

1. **New** → **Web Service** → Connect repo.
2. Settings:
   - **Root directory**: `RealEstateIQ/backend`
   - **Runtime**: Node
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
3. Add **Environment Variables** (from Render dashboard):

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGO_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | A long random string (32+ chars) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `ML_SERVICE_URL` | Render ML service URL (from step 4) |
   | `CORS_ORIGIN` | Your Vercel frontend URL |
   | `SMTP_HOST` | (see step 3) |
   | `SMTP_PORT` | `587` |
   | `SMTP_USER` | (see step 3) |
   | `SMTP_PASS` | (see step 3) |
   | `NOTIFICATION_EMAIL` | Admin email |
   | `CLOUDINARY_CLOUD_NAME` | (see step 2) |
   | `CLOUDINARY_API_KEY` | (see step 2) |
   | `CLOUDINARY_API_SECRET` | (see step 2) |

4. After deployment, run the database seed once via Render **Shell**:
   ```bash
   npm run seed
   ```
5. Note the deployed URL e.g. `https://realestate-iq-backend.onrender.com`

---

## 6. Deploy Frontend on Vercel

1. Go to https://vercel.com → **New Project** → Import from GitHub.
2. Select the repository. Set **Root Directory** to `RealEstateIQ/frontend`.
3. Framework preset: **Next.js** (auto-detected).
4. Add **Environment Variable**:
   ```
   NEXT_PUBLIC_API_URL = https://realestate-iq-backend.onrender.com
   ```
5. Click **Deploy**. ✅

---

## 7. Post-Deployment Checklist

- [ ] Visit `https://your-backend.onrender.com/health` → should return `{"success":true,"data":{"status":"ok"}}`
- [ ] Visit `https://your-ml.onrender.com/health` → should return `{"status":"ok"}`
- [ ] Visit the Vercel frontend URL → login with `demo@realestate-iq.com / User@123456`
- [ ] Run a price prediction and verify the result renders correctly.
- [ ] Upload a property photo and verify the Cloudinary CDN URL appears.
- [ ] Submit a viewing inquiry and verify notification email is received.

---

## 8. Docker Compose (Local Full-Stack)

To run the entire stack locally with Docker:

```bash
# Copy and fill in env vars
cp RealEstateIQ/backend/.env.example .env

# Build and start all services
docker compose -f RealEstateIQ/docker-compose.yml --env-file .env up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
# ML:       http://localhost:8000
```

---

## 9. Environment Variable Summary

### Backend (`.env`)
| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | JWT signing secret |
| `ML_SERVICE_URL` | ✅ | FastAPI ML service URL |
| `CORS_ORIGIN` | ✅ | Frontend origin |
| `SMTP_HOST` | Optional | SMTP server (leave blank → log mode) |
| `SMTP_PORT` | Optional | Default `587` |
| `SMTP_USER` | Optional | SMTP username / Gmail email |
| `SMTP_PASS` | Optional | App password or API key |
| `NOTIFICATION_EMAIL` | Optional | Admin notification inbox |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API secret |

### Frontend (`.env.local`)
| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API base URL |
