import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
APP_ENV = os.getenv("APP_ENV", "development")
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
HOST = os.getenv("HOST", "0.0.0.0")
APP_PORT = int(os.getenv("APP_PORT", 8000))
