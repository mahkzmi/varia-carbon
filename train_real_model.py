# train_real_model_70.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import joblib
import warnings
warnings.filterwarnings('ignore')

# ============================================
# لود داده‌های واقعی (70 نمونه)
# ============================================
df = pd.read_csv('real_soil_data_70.csv')
print(f"✅ تعداد نمونه‌ها: {len(df)}")
print(f"📊 محدوده SOC: {df['soc'].min():.1f}% تا {df['soc'].max():.1f}%")
print(f"📈 میانگین SOC: {df['soc'].mean():.2f}%")
print(f"📉 انحراف معیار SOC: {df['soc'].std():.2f}%")

# ============================================
# آماده‌سازی داده
# ============================================
features = ['ndvi', 'precipitation', 'temperature', 'elevation', 'clay']
X = df[features]
y = df['soc']

# ============================================
# تقسیم داده (80% آموزش، 20% تست)
# ============================================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"\n📚 داده آموزش: {len(X_train)} نمونه")
print(f"🧪 داده تست: {len(X_test)} نمونه")

# ============================================
# آموزش Random Forest
# ============================================
print("\n🔄 در حال آموزش مدل Random Forest با 70 نمونه...")

rf = RandomForestRegressor(
    n_estimators=150,
    max_depth=8,
    min_samples_split=4,
    min_samples_leaf=2,
    random_state=42
)

rf.fit(X_train, y_train)

# ============================================
# ارزیابی
# ============================================
y_pred_train = rf.predict(X_train)
y_pred_test = rf.predict(X_test)

r2_train = r2_score(y_train, y_pred_train)
r2_test = r2_score(y_test, y_pred_test)
mae_test = mean_absolute_error(y_test, y_pred_test)
rmse_test = np.sqrt(mean_squared_error(y_test, y_pred_test))

print("\n" + "="*50)
print("📈 نتایج ارزیابی مدل (با 70 نمونه):")
print("="*50)
print(f"🎯 R² (آموزش): {r2_train:.3f}")
print(f"🎯 R² (تست): {r2_test:.3f}")
print(f"📊 MAE (تست): {mae_test:.2f}% SOC")
print(f"📊 RMSE (تست): {rmse_test:.2f}% SOC")

# اعتبارسنجی متقاطع
cv_scores = cross_val_score(rf, X, y, cv=5)
print(f"\n🔄 Cross-validation R² (5-fold): {cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})")

# ============================================
# اهمیت ویژگی‌ها
# ============================================
importance = pd.DataFrame({
    'feature': features,
    'importance': rf.feature_importances_
}).sort_values('importance', ascending=False)

print("\n📈 اهمیت ویژگی‌ها در پیش‌بینی SOC:")
for i, row in importance.iterrows():
    bar = "█" * int(row['importance'] * 50)
    print(f"   {row['feature']:12s}: {row['importance']:.3f} {bar}")

# ============================================
# ذخیره مدل
# ============================================
joblib.dump(rf, 'carbon_model_real_70.pkl')
print("\n✅ مدل با 70 نمونه ذخیره شد: carbon_model_real_70.pkl")

# ============================================
# تست نهایی
# ============================================
print("\n" + "="*50)
print("🧪 تست روی نمونه‌های جدید:")
print("="*50)

test_samples = pd.DataFrame([
    {'ndvi': 0.75, 'precipitation': 900, 'temperature': 20, 'elevation': 300, 'clay': 30,
     'desc': 'منطقه نیمه‌مَرطوب با پوشش گیاهی خوب'},
    {'ndvi': 0.35, 'precipitation': 450, 'temperature': 22, 'elevation': 600, 'clay': 38,
     'desc': 'منطقه خشک با پوشش کم'},
    {'ndvi': 0.60, 'precipitation': 650, 'temperature': 16, 'elevation': 400, 'clay': 25,
     'desc': 'کشاورزی معمولی'},
])

for i, sample in test_samples.iterrows():
    input_array = np.array([[sample['ndvi'], sample['precipitation'], 
                             sample['temperature'], sample['elevation'], sample['clay']]])
    pred = rf.predict(input_array)[0]
    print(f"\n📌 {sample['desc']}:")
    print(f"   NDVI={sample['ndvi']}, بارش={sample['precipitation']}mm, دما={sample['temperature']}°C, ارتفاع={sample['elevation']}m, رس={sample['clay']}%")
    print(f"   🔮 SOC پیش‌بینی شده: {pred:.2f}%")
    
    # توصیه
    if pred > 6:
        print(f"   ✅ وضعیت: عالی - پتانسیل بالای اعتبار کربنی")
    elif pred > 4:
        print(f"   ⚠️ وضعیت: متوسط - قابل بهبود با مدیریت مناسب")
    else:
        print(f"   ❌ وضعیت: ضعیف - نیاز به اقدام فوری")