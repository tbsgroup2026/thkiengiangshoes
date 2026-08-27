"""
TBS II - Database Configuration
Hỗ trợ SQLite (dev) và PostgreSQL (production).
Tự động load biến môi trường từ file .env.
"""
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tbs2_factory.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False,
    # Production safety: pool_pre_ping + pool_recycle
    pool_pre_ping=True,
    pool_recycle=3600,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency injection: cung cấp database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
