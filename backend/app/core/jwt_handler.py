from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from fastapi import HTTPException, Request, status
from app.config import settings

ALGORITHM = settings.ALGORITHM


def create_access_token(user_id: str, remember_me: bool = False) -> str:
    """Create JWT access token with configurable expiry."""
    expire_days = settings.REMEMBER_ME_EXPIRE_DAYS if remember_me else settings.ACCESS_TOKEN_EXPIRE_DAYS
    expire = datetime.now(timezone.utc) + timedelta(days=expire_days)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> str:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")
        return user_id
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.")


def get_token_from_cookie(request: Request) -> str:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")
    return token