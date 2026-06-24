# backend/app/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import uvicorn
import folium
import os

from app.database import get_db
from app.models import User, Prediction, Payment
from app.schemas import *
from app.auth import *
from app.predictor import SoilCarbonPredictor
from app.config import settings
from app.crypto import create_payment, verify_payment, PRICES, LIMITS

app = FastAPI(title="VARIA Carbon API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = SoilCarbonPredictor()

# ===== MAPS DIRECTORY =====
# ایجاد پوشه maps در مسیر درست
MAPS_DIR = os.path.join(os.path.dirname(__file__), "..", "maps")
os.makedirs(MAPS_DIR, exist_ok=True)

# سرویس‌دهی فایل‌های استاتیک از پوشه maps
app.mount("/maps", StaticFiles(directory=MAPS_DIR), name="maps")

print(f"📁 Maps directory: {MAPS_DIR}")

# ============================================================
#  AUTH
# ============================================================

@app.post("/auth/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(400, "Email already registered")
    new = User(
        email=user.email,
        hashed_password=get_password_hash(user.password),
        full_name=user.full_name,
        api_key=secrets.token_urlsafe(32),
        plan="free",
        requests_limit=settings.FREE_LIMIT
    )
    db.add(new)
    db.commit()
    db.refresh(new)
    return new

@app.post("/auth/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(401, "Incorrect email or password")
    return {"access_token": create_access_token({"sub": user.email}), "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse)
def me(current: User = Depends(get_current_user)):
    return current

# ============================================================
#  PREDICT
# ============================================================

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.requests_used >= user.requests_limit:
        raise HTTPException(429, "Request limit exceeded")
    result = predictor.predict(req.ndvi, req.precipitation, req.temperature, req.elevation, req.clay)
    p = Prediction(
        user_id=user.id,
        ndvi=req.ndvi,
        precipitation=req.precipitation,
        temperature=req.temperature,
        elevation=req.elevation,
        clay=req.clay,
        soc_percent=result["soc_percent"],
        carbon_credits=result["carbon_credits"]
    )
    db.add(p)
    user.requests_used += 1
    db.commit()
    return result

@app.get("/history", response_model=list[PredictionResponse])
def history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Prediction).filter(Prediction.user_id == user.id).order_by(Prediction.created_at.desc()).all()

# ============================================================
#  MAP (FIXED)
# ============================================================

@app.post("/predict-map")
def predict_map(req: PredictRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.requests_used >= user.requests_limit:
        raise HTTPException(429, "Request limit exceeded")
    result = predictor.predict(req.ndvi, req.precipitation, req.temperature, req.elevation, req.clay)
    p = Prediction(
        user_id=user.id,
        ndvi=req.ndvi,
        precipitation=req.precipitation,
        temperature=req.temperature,
        elevation=req.elevation,
        clay=req.clay,
        soc_percent=result["soc_percent"],
        carbon_credits=result["carbon_credits"]
    )
    db.add(p)
    user.requests_used += 1
    db.commit()

    # ===== CREATE MAP =====
    m = folium.Map(location=[35, 51], zoom_start=10)
    folium.Marker(
        [35, 51],
        popup=f"SOC: {result['soc_percent']}%<br>Credits: {result['carbon_credits']} tCO₂/ha",
        icon=folium.Icon(color='green', icon='leaf', prefix='fa')
    ).add_to(m)
    folium.Circle(
        [35, 51],
        radius=10000,
        color='green',
        fill=True,
        fillOpacity=0.1
    ).add_to(m)

    # ===== SAVE MAP =====
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    fname = f"map_{user.id}_{timestamp}.html"
    map_path = os.path.join(MAPS_DIR, fname)
    m.save(map_path)
    
    print(f"✅ Map saved: {map_path}")
    print(f"📍 Map URL: /maps/{fname}")

    return {
        "soc_percent": result["soc_percent"],
        "carbon_credits": result["carbon_credits"],
        "map_url": f"/maps/{fname}"
    }

# ============================================================
#  BENCHMARK
# ============================================================

@app.post("/benchmark")
def benchmark(req: PredictRequest, user: User = Depends(get_current_user)):
    soc = predictor.predict(req.ndvi, req.precipitation, req.temperature, req.elevation, req.clay)["soc_percent"]
    b = settings.BENCHMARK_DATA
    status = "high" if soc >= b["high_threshold"] else "good" if soc >= b["optimal_for_cropland"] else "moderate" if soc >= b["low_threshold"] else "low"
    return {
        "your_soc": soc,
        "vs_global": round(soc - b["global_average"], 2),
        "vs_europe": round(soc - b["europe_average"], 2),
        "vs_optimal_cropland": round(soc - b["optimal_for_cropland"], 2),
        "vs_optimal_grassland": round(soc - b["optimal_for_grassland"], 2),
        "status": status,
        "status_text": {"high": "Excellent", "good": "Good", "moderate": "Moderate", "low": "Low"}[status]
    }

# ============================================================
#  TREND
# ============================================================

@app.get("/trend")
def trend(user: User = Depends(get_current_user), db: Session = Depends(get_db), days: int = 30):
    cutoff = datetime.utcnow() - timedelta(days=days)
    data = db.query(Prediction).filter(
        Prediction.user_id == user.id,
        Prediction.created_at >= cutoff
    ).order_by(Prediction.created_at.asc()).all()
    if len(data) < 2:
        return {"message": "At least 2 predictions needed", "data": []}
    return {"data": [
        {
            "date": p.created_at.isoformat(),
            "soc_percent": p.soc_percent,
            "carbon_credits": p.carbon_credits
        }
        for p in data
    ]}

# ============================================================
#  PAYMENT
# ============================================================

@app.post("/payment/create", response_model=PaymentResponse)
def create_payment_endpoint(
    req: PaymentRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if req.plan not in PRICES:
        raise HTTPException(400, "Invalid plan")
    p = create_payment(db, user.id, req.plan)
    return {
        "payment_id": p.payment_id,
        "wallet_address": settings.CRYPTO_WALLET,
        "amount": p.amount,
        "plan": p.plan,
        "message": f"Send {p.amount} USDT (TRC20) to {settings.CRYPTO_WALLET}. ID: {p.payment_id}"
    }

@app.post("/payment/verify")
def verify_payment_endpoint(
    req: PaymentVerifyRequest,
    db: Session = Depends(get_db)
):
    if verify_payment(db, req.payment_id, req.tx_hash):
        return {"message": "Payment verified. Plan upgraded."}
    raise HTTPException(400, "Verification failed")

@app.get("/payment/status/{payment_id}")
def payment_status(
    payment_id: str,
    db: Session = Depends(get_db)
):
    p = db.query(Payment).filter(Payment.payment_id == payment_id).first()
    if not p:
        raise HTTPException(404, "Not found")
    return {
        "payment_id": p.payment_id,
        "status": p.status,
        "plan": p.plan,
        "amount": p.amount,
        "created_at": p.created_at
    }

# ============================================================
#  PLANS
# ============================================================

@app.get("/plans", response_model=list[PlanResponse])
def plans():
    return [
        {"name": "free", "price": 0, "limit": settings.FREE_LIMIT, "description": "100 requests/month"},
        {"name": "basic", "price": settings.BASIC_PRICE, "limit": settings.BASIC_LIMIT, "description": "1,000 requests/month"},
        {"name": "pro", "price": settings.PRO_PRICE, "limit": settings.PRO_LIMIT, "description": "10,000 requests/month"},
        {"name": "enterprise", "price": settings.ENTERPRISE_PRICE, "limit": settings.ENTERPRISE_LIMIT, "description": "Unlimited requests"}
    ]

# ============================================================
#  ROOT
# ============================================================

@app.get("/")
def root():
    return {"message": "VARIA Carbon API is running. Visit /docs for documentation."}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)