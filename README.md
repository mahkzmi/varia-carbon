# 🌾 VARIA Carbon

**AI-Powered Soil Organic Carbon Prediction from Satellite Data**

[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()
[![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)]()
[![Streamlit](https://img.shields.io/badge/Streamlit-1.28-orange.svg)]()

---

## 📖 Table of Contents
- [Overview](#overview)
- [Why VARIA Carbon?](#why-varia-carbon)
- [Key Features](#key-features)
- [Technical Performance](#technical-performance)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running with Docker (Recommended)](#running-with-docker-recommended)
  - [Running Locally](#running-locally)
- [API Endpoints](#api-endpoints)
- [Dashboard](#dashboard)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [License & Pricing](#license--pricing)
- [Contact](#contact)

---

## Overview

**VARIA Carbon** is a machine learning tool that predicts **Soil Organic Carbon (SOC%)** from five environmental inputs:

- NDVI (from satellite imagery)
- Annual Precipitation (mm/year)
- Mean Annual Temperature (°C)
- Elevation (m)
- Clay Content (%)

Traditional lab tests cost **$30–50/ha** and take weeks. VARIA Carbon delivers results in **seconds** at a fraction of the cost — making soil carbon MRV accessible, scalable, and affordable.

---

## Why VARIA Carbon?

| Problem | Solution |
|---------|----------|
| Lab tests are expensive ($30–50/ha) | AI prediction at ~90% lower cost |
| Weeks of waiting | Results in seconds |
| Limited samples → high uncertainty | Scalable to thousands of hectares |
| Data leaves your organization | On‑premise deployment (data stays with you) |
| Black‑box algorithms | Transparent, auditable Random Forest model |

---

## Key Features

- ✅ **Accurate**: R² = 0.78 (validated on EU LUCAS soil database)
- ✅ **Fast**: Predictions in under 1 second
- ✅ **Scalable**: Works for 1 hectare or 10,000+
- ✅ **On‑Premise**: Deploy on your own server (data privacy)
- ✅ **Transparent**: Full code included (no black box)
- ✅ **User‑Friendly**: Interactive dashboard + REST API
- ✅ **Dockerized**: One‑command installation

---

## Technical Performance

| Metric | Value |
|--------|-------|
| **R² (Test Set)** | 0.786 |
| **MAE** | 0.80% SOC |
| **RMSE** | 1.02% SOC |
| **Cross‑Validation (5‑fold)** | 0.827 (±0.071) |
| **Train R²** | 0.939 |
| **Test R²** | 0.786 |
| **Overfitting Gap** | 0.153 (acceptable) |

### Feature Importance
Clay: 28.6% ██████████████
Elevation: 24.2% ████████████
Temperature: 18.9% █████████
NDVI: 17.5% ████████
Precipitation:10.9% █████

text

---

## Quick Start

### Prerequisites

- Python 3.9+
- Docker (recommended)
- 4GB RAM minimum

### Installation
Frontend application built with Next.js, React, and TypeScript.

Prerequisites

Make sure you have the following installed:

Node.js (LTS version recommended)

npm (included with Node.js)

Git

Getting Started

1. Clone the repository

git clone https://github.com/mahkzmi/varia-carbon.git
cd varia-carbon/front-end

2. Install dependencies

npm install

3. Configure environment variables

Copy .env.example to .env.local in the frontend project directory.

Windows (PowerShell):

Copy-Item .env.example .env.local

** macOS / Linux:**

cp .env.example .env.local

Open .env.local and configure the required environment variables with the appropriate values.

Do not commit .env.local or share secrets such as API keys and passwords. Only .env.example should be committed to Git, with placeholder values instead of real credentials.

4. Run the development server

npm run dev

Open http://localhost:3000 in your browser.

The development server supports hot reloading, so changes to your code will appear automatically.

Available Scripts

Command

Description

npm run dev

Start the development server

npm run build

Build the application for production

npm run start

Start the production server (run npm run build first)

npm run lint

Run ESLint

Production Build

To create and run a production build:

npm run build
npm run start

The application will be available at http://localhost:3000.

Project Structure

varia-carbon/
├── front-end/
│   ├── app/              # Next.js App Router pages and layouts
│   ├── components/       # Reusable UI components
│   ├── public/            # Static assets
│   ├── .env.example       # Example environment variables
│   ├── .env.local         # Local environment variables (not committed)
│   ├── package.json
│   └── README.md
└── ...

Note: The structure above is illustrative. Actual directories may vary.

Troubleshooting

npm install fails: Check your Node.js and npm versions, then try running npm install again.

Environment variables are missing: Make sure .env.local exists and contains all required variables.

Environment changes are not applied: Restart the development server after updating .env.local.

Port 3000 is already in use: Stop the other process or configure a different port.

Contributing

Create a feature branch.

Make your changes.

Commit your changes with a descriptive message.

Push your branch and open a Pull Request.


```bash
# Clone the repository
git clone https://github.com/yourusername/varia-carbon.git
cd varia-carbon

# Install dependencies (if running locally)
pip install -r requirements.txt
Running with Docker (Recommended)
bash
# Build and run with Docker Compose
docker-compose up -d

# Access the services:
# - API: http://localhost:8000
# - Dashboard: http://localhost:8501
Running Locally
bash
# Start the API
uvicorn api:app --host 0.0.0.0 --port 8000

# In a separate terminal, start the dashboard
streamlit run app.py
API Endpoints
POST /predict
Predict SOC% from environmental data.

Request Body:

json
{
  "ndvi": 0.60,
  "precipitation": 600,
  "temperature": 17,
  "elevation": 300,
  "clay": 25
}
Response:

json
{
  "predicted_soc_percent": 5.64
}
GET /
Health check endpoint.

Response:

json
{
  "message": "VARIA Carbon API is running. Use /predict endpoint."
}



Interactive API Documentation:
Once running, visit http://localhost:8000/docs for Swagger UI.

Dashboard
The Streamlit dashboard provides a user‑friendly interface for:

Inputting environmental data

Visualizing predictions (SOC% + carbon credits)

Comparing inputs against optimal ranges

Downloading reports (coming soon)

Access: http://localhost:8501

Project Structure
text
varia-carbon/
├── api.py                  # FastAPI REST API
├── app.py                  # Streamlit dashboard
├── carbon_model_real_70.pkl # Trained Random Forest model
├── requirements.txt        # Python dependencies
├── Dockerfile              # Docker container definition
├── docker-compose.yml      # Multi‑service orchestration
├── sample_data.csv         # Example input data
├── README.md               
└── docs/
    ├── Executive_Summary.docx
    └── Technical_Report.docx



Contact
Creator: Mahdieh Kazemi
Email: mah.kzmi21@gmail.com
LinkedIn: Mahdieh Kazemi
Live Demo: varia-carbon.streamlit.app
Telegram: @varia_support



⚠️ Disclaimer
This tool is designed for baseline estimation and cost‑effective MRV. It is not a replacement for lab‑grade accuracy for final carbon credit issuance. Always validate predictions with ground‑truth samples for high‑stakes decisions.

Ready to deploy. Ready to scale. 🌱
