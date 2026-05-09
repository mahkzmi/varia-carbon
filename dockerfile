FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY api.py .
COPY app.py .
COPY carbon_model_real_70.pkl .
COPY sample_data.csv .

EXPOSE 8000 8501

CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]