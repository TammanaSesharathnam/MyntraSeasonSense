import os

class Config:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/seasonsense")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "seasonsense-super-secret-key-123")
    PORT = int(os.getenv("PORT", 5000))
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
