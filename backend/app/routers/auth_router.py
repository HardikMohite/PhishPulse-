from fastapi import APIRouter, Depends, Response, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth_schema import (
    RegisterRequest, LoginRequest, VerifyOtpRequest,
    ResendOtpRequest, ForgotPasswordRequest, ForgotPasswordOtpRequest,
    VerifyResetOtpRequest, ResetPasswordRequest, UserResponse
)
from app.services import auth_service
from app.core.jwt_handler import create_access_token
from app.core.dependencies import get_current_user
from app.models.user import User
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

COOKIE_NAME = "access_token"


def _set_auth_cookie(response: Response, token: str, remember_me: bool = False):
    """Set httpOnly cookie. secure=True in production (DEBUG=False), False in dev."""
    expire_days = settings.REMEMBER_ME_EXPIRE_DAYS if remember_me else settings.ACCESS_TOKEN_EXPIRE_DAYS
    max_age = 60 * 60 * 24 * expire_days
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=not settings.DEBUG,  # Fix: True in prod, False in dev only
        samesite="lax",
        max_age=max_age,
    )


@router.post("/register", status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    result = auth_service.register_user(payload, db)
    return {
        "message": result["message"],
        "sessionId": result["session_id"],
    }


@router.post("/login")
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = auth_service.login_user(payload, db)
    token = create_access_token(user.id, remember_me=payload.remember_me)
    _set_auth_cookie(response, token, remember_me=payload.remember_me)
    return {
        "message": "Login successful.",
        "user": UserResponse.model_validate(user),
        "userId": user.id,
    }


@router.post("/verify-otp")
def verify_otp(payload: VerifyOtpRequest, response: Response, db: Session = Depends(get_db)):
    user = auth_service.verify_otp(payload.user_id, payload.code, db)
    token = create_access_token(user.id)
    _set_auth_cookie(response, token)
    return {
        "message": "Registration complete. Account verified successfully.",
        "user": UserResponse.model_validate(user),
    }


@router.post("/resend-otp")
def resend_otp(payload: ResendOtpRequest):
    """
    Resend OTP for session-based registration.
    Fix: session_manager already enforces MAX_RESENDS=2, so this is protected
    against abuse — after 2 resends the session is invalidated.
    """
    try:
        auth_service.resend_otp(payload.user_id)
        return {"message": "OTP resent successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Legacy link-based reset — kept for compatibility."""
    auth_service.forgot_password(payload.email, db)
    return {"message": "If this email exists, a reset link has been sent."}


@router.post("/forgot-password-otp")
def forgot_password_otp(payload: ForgotPasswordOtpRequest, db: Session = Depends(get_db)):
    """Send a 6-digit OTP to the user's email for password reset."""
    auth_service.forgot_password_send_otp(payload.email, db)
    return {"message": "If this email exists, a verification code has been sent."}


@router.post("/verify-reset-otp")
def verify_reset_otp(payload: VerifyResetOtpRequest, db: Session = Depends(get_db)):
    """Verify the password-reset OTP and return a short-lived reset token."""
    reset_token = auth_service.verify_reset_otp(payload.email, payload.code, db)
    return {"reset_token": reset_token}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Reset password using the token issued by verify-reset-otp.
    Token is single-use, 15-min expiry, validated server-side.
    Password policy enforced by ResetPasswordRequest schema validator.
    """
    auth_service.reset_password(payload.token, payload.new_password, db)
    return {"message": "Password reset successful. Please log in."}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key=COOKIE_NAME,
        httponly=True,
        samesite="lax",
        secure=not settings.DEBUG,
    )
    return {"message": "Logged out successfully."}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user