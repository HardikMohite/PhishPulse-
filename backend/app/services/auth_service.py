import secrets
import random
import string
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password, verify_password
from app.schemas.auth_schema import RegisterRequest, LoginRequest
from app.config import settings
from app.utils.session_manager import session_manager

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


def _generate_otp() -> str:
    """Generate a 6-digit OTP code."""
    return "".join(random.choices(string.digits, k=6))


def register_user(payload: RegisterRequest, db: Session) -> dict:
    """
    Session-based registration: Store data temporarily, only create DB user after OTP verification.
    Returns session_id instead of user object.
    """
    # Check if email already exists (only verified users in DB)
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered.")
    
    # Phone can be shared across multiple accounts - no uniqueness check

    # Generate OTP code
    otp_code = _generate_otp()

    # Create session (not DB user yet)
    session_id = session_manager.create_session(
        email=payload.email,
        name=payload.name,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
        otp_code=otp_code
    )
    
    # Get session to send OTP
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create registration session.")
    
    # Send OTP via Email
    # Always log OTP in development mode for testing
    print(f"\n{'='*60}")
    print(f"📧 OTP CODE FOR TESTING")
    print(f"Email: {session.email}")
    print(f"Code: {session.otp_code}")
    print(f"{'='*60}\n")
    
    if hasattr(settings, 'BREVO_API_KEY') and settings.BREVO_API_KEY:
        try:
            from app.utils.email_brevo import send_otp_email
            result = send_otp_email(session.email, session.otp_code, session.name)
            if result:
                print(f"[OTP SENT via Brevo] To: {session.email}")
            else:
                print(f"[OTP WARNING] Brevo send failed but code is available above")
        except Exception as e:
            print(f"[OTP ERROR] {e}")
            print(f"[OTP - CODE AVAILABLE ABOVE] Email: {session.email}")
    else:
        # Development mode: Brevo not configured
        print(f"[OTP - DEVELOPMENT MODE] Brevo not configured, use code above")
    
    return {
        "session_id": session_id,
        "message": "OTP sent to email. Please verify within 10 minutes."
    }


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


def verify_otp(session_id: str, code: str, db: Session) -> User:
    """
    Verify OTP from session and create DB user only after successful verification.
    This ensures all-or-nothing registration.
    """
    # Get session data
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration session expired or not found. Please register again.")

    # Check if OTP expired
    if datetime.now(timezone.utc) > session.otp_expires_at.replace(tzinfo=timezone.utc):
        session_manager.delete_session(session_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP has expired. Please register again.")

    # Verify OTP code
    if session.otp_code != code:
        # Increment failed attempts
        session_manager.increment_attempts(session_id)
        remaining = 3 - session.attempts
        if remaining <= 0:
            session_manager.delete_session(session_id)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Too many failed attempts. Please register again.")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid OTP code. {remaining} attempts remaining.")

    # OTP verified! Now create the user in database
    user = User(
        name=session.name,
        email=session.email,
        phone=session.phone,
        hashed_password=session.hashed_password,
        is_verified=True,  # Mark as verified immediately
        otp_code=None,
        otp_expires_at=None
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Delete session after successful registration
    session_manager.delete_session(session_id)
    
    print(f"[REGISTRATION COMPLETE] User created: {user.email}")
    return user


def resend_otp(session_id: str) -> None:
    """
    Resend OTP for session-based registration. Max 2 resends within session window.
    """
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration session expired or not found. Please register again.")

    # Generate new OTP within session
    new_otp = session_manager.generate_new_otp(session_id)
    if not new_otp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to generate new OTP.")

    # Send OTP via Email
    if hasattr(settings, 'BREVO_API_KEY') and settings.BREVO_API_KEY:
        try:
            from app.utils.email_brevo import send_otp_email
            send_otp_email(session.email, new_otp, session.name)
            print(f"[OTP RESENT via Brevo] To: {session.email} | Code: {new_otp}")
        except Exception as e:
            print(f"[OTP ERROR] {e}")
            print(f"[OTP - FALLBACK] Email: {session.email} | Code: {new_otp}")
    else:
        # Development mode: print to console
        print(f"[OTP - DEVELOPMENT MODE] Email: {session.email} | Code: {new_otp}")


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
    
    # Send password reset email via Brevo
    if hasattr(settings, 'BREVO_API_KEY') and settings.BREVO_API_KEY:
        try:
            from app.utils.email_brevo import send_password_reset_email
            send_password_reset_email(user.email, user.name, reset_link)
            print(f"[PASSWORD RESET EMAIL SENT via Brevo] To: {user.email}")
        except Exception as e:
            print(f"[PASSWORD RESET ERROR] {e}")
            print(f"[PASSWORD RESET - FALLBACK] User: {user.email} | Reset Link: {reset_link}")
    else:
        # Development mode: print to console
        print(f"[PASSWORD RESET - DEVELOPMENT MODE] User: {user.email}")
        print(f"Reset Link: {reset_link}")


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