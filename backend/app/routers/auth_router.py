from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth_schema import (
    RegisterRequest, LoginRequest, VerifyOtpRequest,
    ResendOtpRequest, ForgotPasswordRequest, ResetPasswordRequest, UserResponse
)
from app.services import auth_service
from app.core.jwt_handler import create_access_token
from app.core.dependencies import get_current_user
from app.models.user import User
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

COOKIE_NAME = "access_token"


def _set_auth_cookie(response: Response, token: str, remember_me: bool = False):
    """Set httpOnly cookie with configurable max_age based on remember_me."""
    expire_days = settings.REMEMBER_ME_EXPIRE_DAYS if remember_me else settings.ACCESS_TOKEN_EXPIRE_DAYS
    max_age = 60 * 60 * 24 * expire_days  # Convert days to seconds
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=False,   # Set True in production with HTTPS
        samesite="lax",
        max_age=max_age,
    )


@router.post("/register", status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """
    Session-based registration: Returns session_id instead of user_id.
    User account is only created after OTP verification.
    """
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
    """
    Verify OTP from session and create user account.
    user_id parameter now accepts session_id for registration flow.
    """
    user = auth_service.verify_otp(payload.user_id, payload.code, db)
    # Issue token after successful verification
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
    user_id parameter now accepts session_id for registration flow.
    """
    auth_service.resend_otp(payload.user_id)
    return {"message": "OTP resent successfully."}


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    auth_service.forgot_password(payload.email, db)
    return {"message": "If this email exists, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    auth_service.reset_password(payload.token, payload.new_password, db)
    return {"message": "Password reset successful. Please log in."}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(COOKIE_NAME)
    return {"message": "Logged out successfully."}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user