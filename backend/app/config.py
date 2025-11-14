import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env file from the app directory
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

MONGO_URL = os.getenv("MONGO_URL")
JWT_SECRET = os.getenv("JWT_SECRET")
