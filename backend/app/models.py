from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    api_key = Column(String, unique=True, index=True)
    plan = Column(String, default="free")
    requests_used = Column(Integer, default=0)
    requests_limit = Column(Integer, default=100)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    ndvi = Column(Float)
    precipitation = Column(Float)
    temperature = Column(Float)
    elevation = Column(Float)
    clay = Column(Float)
    soc_percent = Column(Float)
    carbon_credits = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Payment(Base):
    __tablename__ = "payments"
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    plan = Column(String)
    amount = Column(Float)
    payment_id = Column(String, unique=True)
    status = Column(String, default="pending")
    tx_hash = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())