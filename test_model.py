# test_model.py (نسخه نهایی)
import joblib
import pandas as pd
import warnings
warnings.filterwarnings('ignore')

model = joblib.load('carbon_model_v2.pkl')

test_cases = pd.DataFrame([
    {'ndvi': 0.75, 'precipitation': 1100, 'temperature': 18, 'elevation': 800, 'clay': 25,
     'expected': '8.0-10.0', 'desc': 'جنگل انبوه'},
    {'ndvi': 0.20, 'precipitation': 250, 'temperature': 28, 'elevation': 400, 'clay': 15,
     'expected': '1.5-3.0', 'desc': 'دشت خشک'},
    {'ndvi': 0.45, 'precipitation': 600, 'temperature': 8, 'elevation': 1800, 'clay': 20,
     'expected': '3.5-5.5', 'desc': 'کوهستان سرد'},
    {'ndvi': 0.60, 'precipitation': 700, 'temperature': 17, 'elevation': 300, 'clay': 35,
     'expected': '5.0-7.5', 'desc': 'کشاورزی فشرده'}
])

print("="*60)
print("🧪 VARIA Carbon - نتایج تست مدل (نسخه اصلاح شده)")
print("="*60)

features = ['ndvi', 'precipitation', 'temperature', 'elevation', 'clay']
X_new = test_cases[features]
predictions = model.predict(X_new)

for i, (idx, row) in enumerate(test_cases.iterrows()):
    print(f"\n📌 سناریو {chr(65+i)}: {row['desc']}")
    print(f"   ورودی: NDVI={row['ndvi']}, بارش={row['precipitation']}mm, دما={row['temperature']}°C, ارتفاع={row['elevation']}m, رس={row['clay']}%")
    print(f"   🔮 پیش‌بینی مدل: {predictions[i]:.2f}%")
    print(f"   📊 محدوده مورد انتظار: {row['expected']}%")
    expected_low, expected_high = map(float, row['expected'].split('-'))
    print(f"   ✅ منطقی است؟ {'بله' if expected_low <= predictions[i] <= expected_high else 'خیر (نیاز به تنظیم دارد)'}")