import random
import string
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password, verify_password
from app.schemas.auth_schema import RegisterRequest, LoginRequest
from app.config import settings

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15
OTP_EXPIRY_MINUTES = 5


def _generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def _send_sms(phone: str, message: str):
    # TODO: Integrate Twilio in Phase 3
    # For now print to console during development
    print(f"[SMS] To: {phone} | Message: {message}")


def _send_email(email: str, subject: str, body: str):
    # TODO: Integrate email service in Phase 3
    print(f"[EMAIL] To: {email} | Subject: {subject} | Body: {body}")


def register_user(payload: RegisterRequest, db: Session) -> User:
    # Check duplicates
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered.")
    if db.query(User).filter(User.phone == payload.phone).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Phone number already registered.")

    otp = _generate_otp()
    otp_expires = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)

    user = User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
        otp_code=otp,
        otp_expires_at=otp_expires,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    _send_sms(user.phone, f"Your PhishPulse verification code is: {otp}. Expires in 5 minutes.")
    return user


def login_user(payload: LoginRequest, db: Session) -> User:
    user = db.query(User).filter(User.email == payload.email).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    # Check account lock
    if user.locked_until and datetime.now(timezone.utc) < user.locked_until.replace(tzinfo=timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=f"Account locked. Try again after {user.locked_until.strftime('%H:%M')}."
        )

    if not verify_password(payload.password, user.hashed_password):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
            user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINUTES)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=f"Too many failed attempts. Account locked for {LOCKOUT_MINUTES} minutes."
            )
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    if not user.is_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account not verified. Please complete 2FA registration.")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled.")

    # Reset failed attempts on success
    user.failed_login_attempts = 0
    user.locked_until = None
    db.commit()
    return user


def verify_otp(user_id: str, code: str, db: Session) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if not user.otp_code or not user.otp_expires_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No OTP found. Request a new one.")

    if datetime.now(timezone.utc) > user.otp_expires_at.replace(tzinfo=timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP has expired. Request a new one.")

    if user.otp_code != code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP code.")

    # Clear OTP and mark verified
    user.otp_code = None
    user.otp_expires_at = None
    user.is_verified = True
    db.commit()
    db.refresh(user)
    return user


def resend_otp(user_id: str, db: Session) -> None:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    otp = _generate_otp()
    user.otp_code = otp
    user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)
    db.commit()

    _send_sms(user.phone, f"Your new PhishPulse verification code is: {otp}. Expires in 5 minutes.")


def forgot_password(email: str, db: Session) -> None:
    user = db.query(User).filter(User.email == email).first()
    # Always return success to prevent email enumeration
    if not user:
        return

    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    db.commit()

    reset_link = f"{settings.FRONTEND_URL}/auth/reset-password?token={token}"
    _send_email(
        user.email,
        "PhishPulse Password Reset",
        f"Click the link to reset your password: {reset_link}\nExpires in 1 hour."
    )


def reset_password(token: str, new_password: str, db: Session) -> None:
    user = db.query(User).filter(User.reset_token == token).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token.")

    if not user.reset_token_expires_at or datetime.now(timezone.utc) > user.reset_token_expires_at.replace(tzinfo=timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token has expired.")

    user.hashed_password = hash_password(new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    db.commit()