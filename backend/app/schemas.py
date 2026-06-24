from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    plan: str
    requests_used: int
    requests_limit: int
    api_key: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class PredictRequest(BaseModel):
    ndvi: float
    precipitation: float
    temperature: float
    elevation: float
    clay: float

class PredictResponse(BaseModel):
    soc_percent: float
    carbon_credits: float

class PredictionResponse(BaseModel):
    id: int
    ndvi: float
    precipitation: float
    temperature: float
    elevation: float
    clay: float
    soc_percent: float
    carbon_credits: float
    created_at: datetime

class PlanResponse(BaseModel):
    name: str
    price: int
    limit: int
    description: str

class PaymentRequest(BaseModel):
    plan: str

class PaymentResponse(BaseModel):
    payment_id: str
    wallet_address: str
    amount: float
    plan: str
    message: str

class PaymentVerifyRequest(BaseModel):
    payment_id: str
    tx_hash: str