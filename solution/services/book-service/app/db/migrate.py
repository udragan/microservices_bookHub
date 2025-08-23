import os
import logging
from alembic import command
from alembic.config import Config

alembic_logger = logging.getLogger('alembic')
alembic_logger.setLevel(logging.INFO)


def run_migrations():
    """
    Runs Alembic migrations using alembic.ini and env.py
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    alembic_path = os.path.join(base_dir, "../alembic.ini")
    alembic_logger.info(f"alembic.ini path: {alembic_path}")

    alembic_cfg = Config(alembic_path)
    db_url = os.getenv("DATABASE_URL_MIGRATE")
    if db_url:
        alembic_cfg.set_main_option("sqlalchemy.url", db_url)

    alembic_logger.info("📦 Running Alembic migrations...")
    command.upgrade(alembic_cfg, "head")
    alembic_logger.info("✅ Migrations complete.")
