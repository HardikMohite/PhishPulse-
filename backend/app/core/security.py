import bcrypt as _bcrypt

# Use bcrypt directly instead of through passlib to avoid version issues
def hash_password(password: str) -> str:
    """Hash a password using bcrypt directly."""
    # Encode password and truncate to 72 bytes if needed
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    # Generate salt and hash
    salt = _bcrypt.gensalt()
    hashed = _bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain password against a hashed password."""
    # Encode and truncate
    plain_bytes = plain.encode('utf-8')
    if len(plain_bytes) > 72:
        plain_bytes = plain_bytes[:72]
    
    hashed_bytes = hashed.encode('utf-8')
    return _bcrypt.checkpw(plain_bytes, hashed_bytes)