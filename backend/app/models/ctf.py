from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base
import uuid


class CTFChallenge(Base):
    """Daily/archival CTF challenges."""
    __tablename__ = "ctf_challenges"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String, nullable=False)   # Easy / Medium / Hard
    flag = Column(String, nullable=False)          # correct answer
    xp_reward = Column(Integer, default=50)
    coins_reward = Column(Integer, default=30)
    is_active = Column(Boolean, default=True)      # True = today's daily challenge
    expires_at = Column(DateTime, nullable=True)   # when daily expires
    created_at = Column(DateTime, server_default=func.now())


class CTFSolve(Base):
    """Tracks which users solved which challenges."""
    __tablename__ = "ctf_solves"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    challenge_id = Column(String, ForeignKey("ctf_challenges.id"), nullable=False)
    solved_at = Column(DateTime, server_default=func.now())