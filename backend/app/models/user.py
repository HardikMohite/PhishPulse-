from sqlalchemy import Column, String, Integer, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.sql import func
from app.database import Base
import enum
import uuid


class UserRole(str, enum.Enum):
    employee = "employee"
    admin = "admin"
    developer = "developer"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, nullable=False)  # Removed unique constraint - allow same phone for multiple accounts
    hashed_password = Column(String, nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.employee, nullable=False)

    # Gamification
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    coins = Column(Integer, default=0)
    streak = Column(Integer, default=0)

    # Avatar
    avatar_seed = Column(String, default="agent-one")
    avatar_style = Column(String, default="avataaars")

    # Account state
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)  # True after 2FA on registration
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)

    # OTP
    otp_code = Column(String, nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)

    # Password reset
    reset_token = Column(String, nullable=True)
    reset_token_expires_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())