"""
database.py - Database Connection and Session Management for Sentiment Analysis Engine.

Supports PostgreSQL via DATABASE_URL and automatically falls back to SQLite for seamless local execution.
"""

import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger("Database")

# Fetch DATABASE_URL from environment or fallback to local SQLite
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./sentiment.db"
)

# Fix postgresql:// prefix if using legacy postgres:// URI schema
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Configure Engine args
engine_args = {}
if "sqlite" in DATABASE_URL:
    engine_args["connect_args"] = {"check_same_thread": False}
else:
    engine_args["pool_pre_ping"] = True
    engine_args["pool_size"] = 10
    engine_args["max_overflow"] = 20

logger.info(f"Connecting database engine to target: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")

engine = create_engine(DATABASE_URL, **engine_args)

# Create SessionLocal factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative Base Model
Base = declarative_base()


def get_db():
    """
    FastAPI Dependency to yield DB session per request and close it after request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database tables defined in models.py.
    """
    import models  # Import models to ensure metadata registration
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
