# api.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import os
from datetime import datetime, timedelta


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