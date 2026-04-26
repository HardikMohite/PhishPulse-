import secrets
import random
import string
import logging
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password, verify_password
from app.schemas.auth_schema import RegisterRequest, LoginRequest
from app.config import settings
from app.utils.session_manager import session_manager

logger = logging.getLogger(__name__)

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


def _generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def _brevo_configured() -> bool:
    return bool(getattr(settings, 'BREVO_API_KEY', None))


def register_user(payload: RegisterRequest, db: Session) -> dict:
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered.")

    otp_code = _generate_otp()
    session_id = session_manager.create_session(
        email=payload.email,
        name=payload.name,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
        otp_code=otp_code,
    )

    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="Failed to create registration session.")

    if _brevo_configured():
        try:
            from app.utils.email_brevo import send_otp_email
            send_otp_email(session.email, session.otp_code, session.name)
            logger.info(f"Registration OTP sent to {session.email}")
        except Exception as e:
            logger.error(f"Registration OTP send failed for {session.email}: {e}")
            # Dev fallback — only print OTP to console when email fails
            print(f"\n[DEV] Registration OTP for {session.email}: {session.otp_code}\n")
    else:
        # No Brevo configured — dev mode
        print(f"\n[DEV] Registration OTP for {session.email}: {session.otp_code}\n")

    return {
        "session_id": session_id,
        "message": "OTP sent to email. Please verify within 10 minutes.",
    }


def login_user(payload: LoginRequest, db: Session) -> User:
    user = db.query(User).filter(User.email == payload.email).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid email or password.")

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
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid email or password.")

    if not user.is_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Account not verified. Please complete email verification.")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Account is disabled.")

    user.failed_login_attempts = 0
    user.locked_until = None
    db.commit()
    logger.info(f"User logged in: {user.email}")
    return user


def verify_otp(session_id: str, code: str, db: Session) -> User:
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Session expired or not found. Please register again.")

    if datetime.now(timezone.utc) > session.otp_expires_at.replace(tzinfo=timezone.utc):
        session_manager.delete_session(session_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="OTP has expired. Please register again.")

    if session.otp_code != code:
        new_attempts = session_manager.increment_attempts(session_id)
        remaining = 3 - new_attempts
        if remaining <= 0:
            session_manager.delete_session(session_id)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="Too many failed attempts. Please register again.")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Invalid OTP code. {remaining} attempts remaining.")

    user = User(
        name=session.name,
        email=session.email,
        phone=session.phone,
        hashed_password=session.hashed_password,
        is_verified=True,
        otp_code=None,
        otp_expires_at=None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    session_manager.delete_session(session_id)
    logger.info(f"New user registered: {user.email}")
    return user


def resend_otp(session_id: str) -> None:
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Session expired or not found. Please register again.")

    new_otp = session_manager.generate_new_otp(session_id)
    if not new_otp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Maximum resend limit reached. Please register again.")

    if _brevo_configured():
        try:
            from app.utils.email_brevo import send_otp_email
            send_otp_email(session.email, new_otp, session.name)
            logger.info(f"OTP resent to {session.email}")
        except Exception as e:
            logger.error(f"OTP resend failed for {session.email}: {e}")
            print(f"\n[DEV] Resent OTP for {session.email}: {new_otp}\n")
    else:
        print(f"\n[DEV] Resent OTP for {session.email}: {new_otp}\n")


def forgot_password_send_otp(email: str, db: Session) -> None:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        logger.debug(f"Reset OTP requested for unknown email (silent): {email}")
        return

    otp_code = _generate_otp()
    user.otp_code = otp_code
    user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    db.commit()

    if _brevo_configured():
        try:
            from app.utils.email_brevo import send_reset_otp_email
            send_reset_otp_email(user.email, otp_code, user.name)
            logger.info(f"Password reset OTP sent to {user.email}")
        except Exception as e:
            logger.error(f"Password reset OTP send failed for {user.email}: {e}")
            print(f"\n[DEV] Password reset OTP for {user.email}: {otp_code}\n")
    else:
        print(f"\n[DEV] Password reset OTP for {user.email}: {otp_code}\n")


def verify_reset_otp(email: str, code: str, db: Session) -> str:
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.otp_code or not user.otp_expires_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invalid or expired verification code. Please start over.")

    if datetime.now(timezone.utc) > user.otp_expires_at.replace(tzinfo=timezone.utc):
        user.otp_code = None
        user.otp_expires_at = None
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Verification code has expired. Please request a new one.")

    if user.otp_code.strip() != code.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Incorrect verification code. Please try again.")

    reset_token = secrets.token_urlsafe(32)
    user.reset_token = reset_token
    user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()
    logger.info(f"Password reset OTP verified for {user.email}")
    return reset_token


def forgot_password(email: str, db: Session) -> None:
    """Legacy link-based reset — kept for compatibility."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return

    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    db.commit()

    reset_link = f"{settings.FRONTEND_URL}/auth/reset-password?token={token}"
    if _brevo_configured():
        try:
            from app.utils.email_brevo import send_password_reset_email
            send_password_reset_email(user.email, user.name, reset_link)
            logger.info(f"Password reset link sent to {user.email}")
        except Exception as e:
            logger.error(f"Password reset link send failed for {user.email}: {e}")
            print(f"\n[DEV] Password reset link for {user.email}: {reset_link}\n")
    else:
        print(f"\n[DEV] Password reset link for {user.email}: {reset_link}\n")


def reset_password(token: str, new_password: str, db: Session) -> None:
    user = db.query(User).filter(User.reset_token == token).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invalid or expired reset token.")

    if not user.reset_token_expires_at or \
       datetime.now(timezone.utc) > user.reset_token_expires_at.replace(tzinfo=timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Reset token has expired.")

    user.hashed_password = hash_password(new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    db.commit()
    logger.info(f"Password reset completed for user {user.id}")