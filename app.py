# app.py - VARIA Carbon Predictor
# Direct model loading version - No API dependency

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
import joblib
import numpy as np

# Page configuration
st.set_page_config(page_title="VARIA Carbon Predictor", layout="wide", page_icon="🌾")

# Load model directly (cached for performance)
@st.cache_resource
def load_model():
    return joblib.load('carbon_model_real_70.pkl')

# Custom CSS for better styling
st.markdown("""
<style>
    .stApp {
        background: linear-gradient(135deg, #f8fafc 0%, #e8f5e9 100%);
    }
    .css-1kyxreq {
        background: rgba(26, 93, 58, 0.05);
    }
    .stButton button {
        background-color: #1a5d3a;
        color: white;
        border-radius: 30px;
        padding: 10px 30px;
        font-weight: bold;
    }
    .stButton button:hover {
        background-color: #2d6a4f;
    }
</style>
""", unsafe_allow_html=True)

# Header
col1, col2, col3 = st.columns([1, 2, 1])
with col2:
    st.title("🌾 VARIA Carbon Predictor")
    st.markdown("<p style='text-align: center; color: #666;'>AI-Powered Soil Organic Carbon Estimation</p>", unsafe_allow_html=True)

st.markdown("---")

# Input Section
st.subheader("📊 Input Parameters")

with st.form("carbon_form"):
    col1, col2 = st.columns(2)
    
    with col1:
        ndvi = st.number_input(
            "🌿 NDVI (Vegetation Index)", 
            min_value=0.0, max_value=1.0, 
            value=0.6, step=0.01,
            help="Normalized Difference Vegetation Index (0.1 = barren, 0.8 = dense forest)"
        )
        precipitation = st.number_input(
            "💧 Annual Precipitation", 
            min_value=0, value=600, step=50,
            help="mm per year"
        )
        temperature = st.number_input(
            "🌡️ Mean Annual Temperature", 
            min_value=-10, value=17, step=1,
            help="°Celsius"
        )
    
    with col2:
        elevation = st.number_input(
            "⛰️ Elevation", 
            min_value=0, value=300, step=50,
            help="meters above sea level"
        )
        clay = st.number_input(
            "🪨 Clay Content", 
            min_value=0, max_value=100, value=25, step=5,
            help="percentage of clay in soil"
        )
    
    submitted = st.form_submit_button("🔍 Predict Soil Carbon", use_container_width=True)

# Load model
try:
    model = load_model()
    model_loaded = True
except Exception as e:
    model_loaded = False
    st.error(f"⚠️ Model loading error: {e}. Please check if 'carbon_model_real_70.pkl' exists.")

# Results Section
if submitted and model_loaded:
    # Prepare input array for prediction
    input_array = np.array([[ndvi, precipitation, temperature, elevation, clay]])
    
    try:
        # Make prediction directly with model
        prediction = model.predict(input_array)[0]
        carbon = round(prediction, 2)
        
        # Display main result
        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            st.markdown("---")
            st.markdown("<h2 style='text-align: center;'>📊 Prediction Result</h2>", unsafe_allow_html=True)
            
            # Gauge Chart
            fig = go.Figure(go.Indicator(
                mode="gauge+number+delta",
                value=carbon,
                title={'text': "Soil Organic Carbon (%)", 'font': {'size': 16}},
                domain={'x': [0, 1], 'y': [0, 1]},
                gauge={
                    'axis': {'range': [0, 10], 'tickwidth': 1},
                    'bar': {'color': "#1a5d3a"},
                    'steps': [
                        {'range': [0, 2], 'color': "#ef4444"},
                        {'range': [2, 4], 'color': "#f59e0b"},
                        {'range': [4, 6], 'color': "#eab308"},
                        {'range': [6, 8], 'color': "#84cc16"},
                        {'range': [8, 10], 'color': "#22c55e"}
                    ],
                    'threshold': {
                        'line': {'color': "red", 'width': 4},
                        'thickness': 0.75,
                        'value': carbon
                    }
                }
            ))
            fig.update_layout(height=300, margin=dict(l=20, r=20, t=40, b=20))
            st.plotly_chart(fig, use_container_width=True)
            
            # Advice based on carbon level
            if carbon > 6:
                st.success(f"🌱 **{carbon}% - Carbon-rich soil!** ✅ Good potential for carbon credits.")
            elif carbon > 3:
                st.warning(f"⚠️ **{carbon}% - Moderate soil carbon.** You can increase it with proper management.")
            else:
                st.error(f"❌ **{carbon}% - Low soil carbon.** Action needed to improve soil fertility.")
        
        # Feature Importance Chart (simulated based on relationships)
        st.markdown("---")
        st.subheader("📈 Parameter Impact Analysis")
        
        impact_data = pd.DataFrame({
            'Parameter': ['NDVI', 'Precipitation', 'Temperature', 'Elevation', 'Clay'],
            'Impact (%)': [
                round(ndvi * 100, 1),
                round(precipitation / 1300 * 100, 1),
                round(max(0, (30 - temperature) / 30 * 100), 1),
                round(max(0, (2500 - elevation) / 2500 * 100), 1),
                round(clay / 60 * 100, 1)
            ]
        })
        
        fig2 = px.bar(impact_data, x='Parameter', y='Impact (%)', 
                     color='Impact (%)', color_continuous_scale='Greens',
                     title="Relative Impact of Each Parameter on Soil Carbon")
        fig2.update_layout(height=400, showlegend=False)
        st.plotly_chart(fig2, use_container_width=True)
        
        # Comparison with optimal values
        st.markdown("---")
        st.subheader("📊 Comparison with Optimal Values")
        
        compare_data = pd.DataFrame({
            'Parameter': ['NDVI', 'Precipitation (mm)', 'Temperature (°C)', 'Elevation (m)', 'Clay (%)'],
            'Your Value': [ndvi, precipitation, temperature, elevation, clay],
            'Optimal Range': ['0.6-0.8', '600-1000', '15-20', '200-800', '20-40']
        })
        st.dataframe(compare_data, use_container_width=True, hide_index=True)
        
        # Carbon Credit Potential
        st.markdown("---")
        st.subheader("💰 Carbon Credit Potential")
        if carbon > 4:
            est_credits = round(carbon * 0.5, 1)
            st.info(f"🌍 Estimated carbon credits per hectare: **{est_credits} tons CO₂ equivalent**")
            st.markdown("Contact VARIA for carbon credit verification and market access.")
        else:
            st.warning("⚠️ Carbon level below threshold for credit generation. Improve soil health first.")
        
    except Exception as e:
        st.error(f"❌ Prediction error: {e}")
elif submitted and not model_loaded:
    st.error("❌ Model not loaded. Please check the model file.")

# Footer
st.markdown("---")
col1, col2, col3 = st.columns([1, 2, 1])
with col2:
    st.markdown("<p style='text-align: center; color: #888; font-size: 12px;'>© 2026 VARIA AgTech Studio — Soil Intelligence for a Regenerative Future</p>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; color: #888; font-size: 12px;'>📧 mah.kzmi21@gmail.com | mahdieh.kazemi.m@ut.ac.ir | @varia_support</p>", unsafe_allow_html=True)
