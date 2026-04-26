"""
Session Manager for Pending Registrations
Stores registration data temporarily until OTP verification is complete.
"""
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from dataclasses import dataclass, asdict
import logging

logger = logging.getLogger(__name__)


@dataclass
class PendingRegistration:
    """Represents a pending registration awaiting OTP verification."""
    session_id: str
    name: str
    email: str
    phone: str
    hashed_password: str
    otp_code: str
    otp_expires_at: datetime
    created_at: datetime
    attempts: int = 0
    resend_count: int = 0


class RegistrationSessionManager:
    """
    Manages pending registration sessions.
    Uses in-memory storage with TTL (Time-To-Live).
    """
    
    # Configuration
    SESSION_TTL_MINUTES = 15        # Total session lifetime
    OTP_EXPIRY_MINUTES = 5          # Individual OTP code expiry
    MAX_OTP_ATTEMPTS = 3            # Max wrong OTP tries
    MAX_RESENDS = 2                 # Max OTP resends per session
    
    def __init__(self):
        # In-memory storage: {session_id: PendingRegistration}
        self._sessions: Dict[str, PendingRegistration] = {}
    
    def create_session(
        self,
        name: str,
        email: str,
        phone: str,
        hashed_password: str,
        otp_code: str
    ) -> str:
        """
        Create a new registration session.
        Returns session_id to be sent to frontend.
        """
        session_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        
        session = PendingRegistration(
            session_id=session_id,
            name=name,
            email=email,
            phone=phone,
            hashed_password=hashed_password,
            otp_code=otp_code,
            otp_expires_at=now + timedelta(minutes=self.OTP_EXPIRY_MINUTES),
            created_at=now,
            attempts=0,
            resend_count=0
        )
        
        self._sessions[session_id] = session
        logger.debug(f"Session created: {session_id[:8]}... for {email}")
        return session_id
    
    def get_session(self, session_id: str) -> Optional[PendingRegistration]:
        """Get a session by ID. Returns None if not found or expired."""
        session = self._sessions.get(session_id)
        
        if not session:
            return None
        
        # Check if session has expired (TTL)
        now = datetime.now(timezone.utc)
        session_age = (now - session.created_at).total_seconds() / 60
        
        if session_age > self.SESSION_TTL_MINUTES:
            # Session expired, delete it
            self.delete_session(session_id)
            logger.debug(f"Session expired: {session_id[:8]}...")
            return None
        
        return session
    
    def verify_otp(self, session_id: str, otp_code: str) -> tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
        """
        Verify OTP code for a session.
        Returns: (success: bool, error_message: Optional[str], user_data: Optional[dict])
        """
        session = self.get_session(session_id)
        
        if not session:
            return False, "Session not found or expired. Please register again.", None
        
        # Check if too many attempts
        if session.attempts >= self.MAX_OTP_ATTEMPTS:
            self.delete_session(session_id)
            return False, "Too many failed attempts. Please register again.", None
        
        # Check if OTP has expired
        now = datetime.now(timezone.utc)
        if now > session.otp_expires_at:
            return False, "OTP code has expired. Please request a new one.", None
        
        # Verify OTP code
        if session.otp_code != otp_code:
            session.attempts += 1
            logger.debug(f"OTP failed attempt {session.attempts}/{self.MAX_OTP_ATTEMPTS}")
            
            remaining = self.MAX_OTP_ATTEMPTS - session.attempts
            if remaining > 0:
                return False, f"Invalid OTP code. {remaining} attempt(s) remaining.", None
            else:
                self.delete_session(session_id)
                return False, "Too many failed attempts. Please register again.", None
        
        # Success! Return user data for account creation
        user_data = {
            "name": session.name,
            "email": session.email,
            "phone": session.phone,
            "hashed_password": session.hashed_password
        }
        
        logger.debug(f"OTP verified for session {session_id[:8]}...")
        return True, None, user_data
    
    def update_otp(self, session_id: str, new_otp: str) -> tuple[bool, Optional[str]]:
        """
        Update OTP code for a session (resend functionality).
        Returns: (success: bool, error_message: Optional[str])
        """
        session = self.get_session(session_id)
        
        if not session:
            return False, "Session not found or expired. Please register again."
        
        # Check if max resends reached
        if session.resend_count >= self.MAX_RESENDS:
            self.delete_session(session_id)
            return False, f"Maximum resend limit ({self.MAX_RESENDS}) reached. Please register again."
        
        # Update OTP and expiry
        now = datetime.now(timezone.utc)
        session.otp_code = new_otp
        session.otp_expires_at = now + timedelta(minutes=self.OTP_EXPIRY_MINUTES)
        session.resend_count += 1
        session.attempts = 0  # Reset attempts on resend
        
        logger.debug(f"OTP resent ({session.resend_count}/{self.MAX_RESENDS})")
        return True, None
    
    def increment_attempts(self, session_id: str) -> int:
        """Increment the failed OTP attempt counter. Returns the new attempt count."""
        session = self._sessions.get(session_id)
        if session:
            session.attempts += 1
            logger.debug(f"OTP failed attempt {session.attempts}/{self.MAX_OTP_ATTEMPTS}")
            return session.attempts
        return 0

    def generate_new_otp(self, session_id: str) -> str | None:
        """Generate and store a new OTP for a session (used by resend). Returns new OTP or None on failure."""
        import random, string
        session = self.get_session(session_id)
        if not session:
            return None
        if session.resend_count >= self.MAX_RESENDS:
            self.delete_session(session_id)
            return None
        from datetime import datetime, timedelta, timezone
        new_otp = "".join(random.choices(string.digits, k=6))
        session.otp_code = new_otp
        session.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=self.OTP_EXPIRY_MINUTES)
        session.resend_count += 1
        session.attempts = 0  # reset attempts on resend
        logger.debug(f"OTP regenerated ({session.resend_count}/{self.MAX_RESENDS})")
        return new_otp

    def delete_session(self, session_id: str) -> None:
        """Delete a session (cleanup)."""
        if session_id in self._sessions:
            session = self._sessions[session_id]
            del self._sessions[session_id]
            logger.debug(f"Session deleted: {session_id[:8]}...")
    
    def cleanup_expired_sessions(self) -> int:
        """
        Cleanup expired sessions (call periodically).
        Returns number of sessions deleted.
        """
        now = datetime.now(timezone.utc)
        expired = []
        
        for session_id, session in self._sessions.items():
            session_age = (now - session.created_at).total_seconds() / 60
            if session_age > self.SESSION_TTL_MINUTES:
                expired.append(session_id)
        
        for session_id in expired:
            self.delete_session(session_id)
        
        if expired:
            logger.debug(f"Cleaned up {len(expired)} expired session(s)")
        
        return len(expired)
    
    def get_session_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session info for debugging/display (without sensitive data)."""
        session = self.get_session(session_id)
        
        if not session:
            return None
        
        now = datetime.now(timezone.utc)
        session_age = (now - session.created_at).total_seconds() / 60
        otp_remaining = (session.otp_expires_at - now).total_seconds() / 60
        
        return {
            "session_id": session.session_id,
            "email": session.email,
            "created_at": session.created_at.isoformat(),
            "session_age_minutes": round(session_age, 1),
            "otp_expires_in_minutes": round(max(0, otp_remaining), 1),
            "attempts": session.attempts,
            "max_attempts": self.MAX_OTP_ATTEMPTS,
            "resend_count": session.resend_count,
            "max_resends": self.MAX_RESENDS
        }


# Global session manager instance
session_manager = RegistrationSessionManager()