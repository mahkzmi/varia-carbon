# license_check.py
import hashlib
import os
from datetime import datetime

def check_license():
    """
    بررسی می‌کند که آیا فایل لایسنس معتبر وجود دارد یا نه
    """
    try:
        if not os.path.exists('license.key'):
            return False
        
        with open('license.key', 'r') as f:
            key = f.read().strip()
        
        # یک کلید ساده و ثابت (برای نسخه تست)
        # در نسخه تجاری، کلیدها را یکتا می‌کنیم
        valid_keys = [
            "VARIA-DEMO-jdkjgf8734ity2rho3dilrnfw",
            "VARIA-FULL-.fmkvhgeyot32r8upewfjkvnf", 
            "TEST-KEY-nvfd67e89pi3krl;ejfsvlkfepoi"
        ]
        
        if key in valid_keys:
            return True
        else:
            return False
            
    except Exception:
        return False

def get_license_status():
    """
    برگرداندن وضعیت لایسنس به صورت خوانا
    """
    if check_license():
        return "✅ لایسنس معتبر است - نسخه کامل"
    else:
        return "❌ لایسنس نامعتبر - نسخه آزمایشی (۱۴ روز)"