import logging
import os
from dotenv import load_dotenv
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s:  %(message)s",
    handlers=[logging.StreamHandler()]
)

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

logging.info("environment variables:")
logging.info("MEDIA_STORAGE_PATH: %s", os.getenv("MEDIA_STORAGE_PATH"))
logging.info("JWKS_URL: %s", os.getenv("JWKS_URL"))
logging.info("JWT_AUDIENCE: %s", os.getenv("JWT_AUDIENCE"))
logging.info("----------------------")
