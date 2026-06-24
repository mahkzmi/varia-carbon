# api.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import os
from datetime import datetime, timedelta

# اضافه کردن قسمت لایسنس
from license_check import check_license, get_license_status

# ========== بخش لایسنس ==========
LICENSE_VALID = check_license()

if not LICENSE_VALID:
    # چک کردن تاریخ نصب برای نسخه آزمایشی ۱۴ روزه
    install_date_file = 'install_date.txt'
    if not os.path.exists(install_date_file):
        with open(install_date_file, 'w') as f:
            f.write(datetime.now().isoformat())
    
    with open(install_date_file, 'r') as f:
        install_date = datetime.fromisoformat(f.read().strip())
    
    days_passed = (datetime.now() - install_date).days
    
    if days_passed > 14:
        print("⚠️ نسخه آزمایشی ۱۴ روزه به پایان رسیده است.")
        print("💰 لطفاً لایسنس خریداری کنید: varia.agtech@gmail.com")
        exit(1)
    else:
        print(f"📅 نسخه آزمایشی: {14 - days_passed} روز باقی مانده")
# =================================


app = FastAPI(title="VARIA Carbon Predictor", description="Predict Soil Organic Carbon from environmental data")

model = joblib.load('carbon_model_real_70.pkl')
class SoilFeatures(BaseModel):
    ndvi: float
    precipitation: float
    temperature: float
    elevation: float
    clay: float

@app.post("/predict")
def predict_carbon(features: SoilFeatures):
    input_array = np.array([[features.ndvi, features.precipitation, 
                             features.temperature, features.elevation, features.clay]])
    prediction = model.predict(input_array)[0]
    return {"predicted_soc_percent": round(prediction, 2)}

@app.get("/")
def read_root():
    return {"message": "VARIA Carbon API is running. Use /predict endpoint."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app)