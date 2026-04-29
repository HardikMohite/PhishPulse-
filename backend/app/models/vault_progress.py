"""
PhishPulse — Vault Progress Model
Tracks per-user level completion state for all vaults.
"""

from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from app.database import Base
import uuid


class VaultProgress(Base):
    """One row per user per level — tracks completion state."""
    __tablename__ = "vault_progress"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)

    vault_id = Column(Integer, nullable=False, default=1)
    level_id = Column(Integer, nullable=False)

    # Status: locked | unlocked | active | completed
    status = Column(String, nullable=False, default="locked")

    # Results (null until completed)
    best_accuracy = Column(Float, nullable=True)
    xp_earned = Column(Integer, nullable=True)
    coins_earned = Column(Integer, nullable=True)
    time_seconds = Column(Integer, nullable=True)

    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Each user can only have one progress row per vault+level
    __table_args__ = (
        UniqueConstraint("user_id", "vault_id", "level_id", name="uq_user_vault_level"),
    )
