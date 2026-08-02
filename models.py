"""
models.py - SQLAlchemy ORM Models for Stock Market Sentiment Analysis Application.

Maps to PostgreSQL tables defined in schema.sql with multi-database compatibility (SQLite / PostgreSQL).
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Text, DateTime, Date, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base


def generate_uuid():
    """Generates string representation of UUID4."""
    return str(uuid.uuid4())


def current_utc():
    """Returns current UTC timestamp."""
    return datetime.now(timezone.utc)


class ArticleModel(Base):
    """
    Stores harvested financial news articles.
    """
    __tablename__ = "articles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    url = Column(String(2048), nullable=False, unique=True, index=True)
    title = Column(String(512), nullable=False)
    body = Column(Text, nullable=True)
    source = Column(String(64), nullable=False)
    ticker = Column(String(16), nullable=False, index=True)
    published_at = Column(DateTime, nullable=False, default=current_utc, index=True)
    fetched_at = Column(DateTime, nullable=False, default=current_utc)
    created_at = Column(DateTime, nullable=False, default=current_utc)

    # Relationships
    sentiment_scores = relationship("SentimentScoreModel", back_populates="article", cascade="all, delete-orphan")


class SentimentScoreModel(Base):
    """
    Stores FinBERT classification scores per article.
    """
    __tablename__ = "sentiment_scores"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    article_id = Column(String(36), ForeignKey("articles.id", ondelete="CASCADE"), nullable=False, index=True)
    sentiment_label = Column(String(32), nullable=False, index=True)  # POSITIVE, NEGATIVE, NEUTRAL
    sentiment_score = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    probabilities = Column(JSON, nullable=False)  # Map of {"POSITIVE": float, "NEGATIVE": float, "NEUTRAL": float}
    processing_time_ms = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=current_utc)

    # Relationships
    article = relationship("ArticleModel", back_populates="sentiment_scores")


class DailyAggregateModel(Base):
    """
    Time-series daily aggregated sentiment per ticker.
    """
    __tablename__ = "daily_aggregates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    date = Column(Date, nullable=False, index=True)
    ticker = Column(String(16), nullable=False, index=True)
    avg_sentiment = Column(Float, nullable=False)
    positive_count = Column(Integer, nullable=False, default=0)
    negative_count = Column(Integer, nullable=False, default=0)
    neutral_count = Column(Integer, nullable=False, default=0)
    total_articles = Column(Integer, nullable=False, default=0)
    signal = Column(String(32), nullable=False)
    trend = Column(String(32), nullable=False, default="STABLE")
    created_at = Column(DateTime, nullable=False, default=current_utc)


class TradingSignalModel(Base):
    """
    High-conviction trading recommendations.
    """
    __tablename__ = "trading_signals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    date = Column(Date, nullable=False, index=True)
    ticker = Column(String(16), nullable=False, index=True)
    signal_type = Column(String(32), nullable=False)  # STRONG_BUY, BUY, HOLD, SELL, STRONG_SELL
    sentiment_score = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    target_horizon = Column(String(32), nullable=False, default="24 Hours")
    predicted_change_pct = Column(Float, nullable=False, default=0.0)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=current_utc)
