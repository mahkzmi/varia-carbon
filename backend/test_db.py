# test_db.py
from sqlalchemy import create_engine, text

url = "postgresql://neondb_owner:npg_oCPUupx5GqE4@ep-morning-paper-aizkvkl9.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"

print(f"Connecting to: {url}")

try:
    engine = create_engine(url)
    with engine.connect() as conn:
        # استفاده از text() برای کوئری خام
        result = conn.execute(text("SELECT 1"))
        print("✅ Connection successful!")
        print(f"Result: {result.scalar()}")
except Exception as e:
    print(f"❌ Error: {e}")