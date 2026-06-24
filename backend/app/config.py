import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL")
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60
    CRYPTO_WALLET = os.getenv("CRYPTO_WALLET", "")

    FREE_LIMIT = 100
    BASIC_LIMIT = 1000
    PRO_LIMIT = 10000
    ENTERPRISE_LIMIT = 999999

    BASIC_PRICE = 29
    PRO_PRICE = 99
    ENTERPRISE_PRICE = 299

    BENCHMARK_DATA = {
        "global_average": 3.5,
        "europe_average": 4.2,
        "optimal_for_cropland": 4.0,
        "optimal_for_grassland": 5.5,
        "low_threshold": 2.0,
        "high_threshold": 6.0
    }

settings = Settings()