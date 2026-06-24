import joblib
import numpy as np
import pandas as pd
from pathlib import Path

class SoilCarbonPredictor:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            model_path = Path(__file__).parent / "model" / "carbon_model_real_70.pkl"
            cls._instance.model = joblib.load(model_path)
        return cls._instance

    def predict(self, ndvi, precipitation, temperature, elevation, clay):
        data = pd.DataFrame([[ndvi, precipitation, temperature, elevation, clay]],
                            columns=['ndvi', 'precipitation', 'temperature', 'elevation', 'clay'])
        pred = self.model.predict(data)[0]
        return {
            "soc_percent": float(round(pred, 2)),
            "carbon_credits": float(round(pred * 0.5, 2))
        }