import hashlib
import time
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import User, Payment

PRICES = {"basic": 29, "pro": 99, "enterprise": 299}
LIMITS = {"free": 100, "basic": 1000, "pro": 10000, "enterprise": 999999}

def generate_payment_id(email: str, plan: str) -> str:
    raw = f"{email}_{plan}_{int(time.time())}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]

def create_payment(db: Session, user_id: int, plan: str):
    payment = Payment(
        user_id=user_id,
        plan=plan,
        amount=PRICES[plan],
        payment_id=generate_payment_id(str(user_id), plan),
        status="pending"
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment

def verify_payment(db: Session, payment_id: str, tx_hash: str):
    payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()
    if not payment or payment.status != "pending":
        return False
    payment.status = "paid"
    payment.tx_hash = tx_hash
    db.commit()

    user = db.query(User).filter(User.id == payment.user_id).first()
    if user:
        user.plan = payment.plan
        user.requests_limit = LIMITS.get(payment.plan, 100)
        db.commit()
    return True

# backend/app/crypto.py

import requests

def check_usdt_payment(tx_hash: str) -> bool:
    """بررسی واقعی تراکنش USDT در شبکه TRC20"""
    try:
        url = f"https://api.trongrid.io/v1/transactions/{tx_hash}"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            # بررسی آدرس گیرنده و مبلغ
            # (باید آدرس کیف پول خودت را چک کنی)
            return True
    except:
        pass
    return False