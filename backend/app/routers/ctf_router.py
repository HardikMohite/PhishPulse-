from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.ctf import CTFChallenge, CTFSolve
from app.core.dependencies import get_current_user
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone

router = APIRouter(prefix="/ctf", tags=["ctf"])


# ── Response schemas ──────────────────────────────────────────────────────────

class ChallengeOut(BaseModel):
    id: str
    title: str
    description: str
    difficulty: str
    xp_reward: int
    coins_reward: int
    is_active: bool
    expires_at: Optional[datetime]
    solved: bool   # whether the current user has solved it

    class Config:
        from_attributes = True


class SubmitFlagRequest(BaseModel):
    challenge_id: str
    flag: str


class SubmitFlagResponse(BaseModel):
    correct: bool
    message: str
    xp_earned: int = 0
    coins_earned: int = 0
    new_xp: int = 0
    new_coins: int = 0
    new_level: int = 0


# ── Helpers ───────────────────────────────────────────────────────────────────

def _has_solved(user_id: str, challenge_id: str, db: Session) -> bool:
    return db.query(CTFSolve).filter_by(user_id=user_id, challenge_id=challenge_id).first() is not None


def _xp_for_level(level: int) -> int:
    """XP required to reach next level from current level."""
    return level * 100


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/daily", response_model=Optional[ChallengeOut])
def get_daily_challenge(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return today's active daily CTF challenge, auto-expiring stale ones."""
    now = datetime.now(timezone.utc)

    # Auto-deactivate any challenges whose expires_at has passed
    expired = (
        db.query(CTFChallenge)
        .filter(
            CTFChallenge.is_active == True,
            CTFChallenge.expires_at != None,
            CTFChallenge.expires_at <= now.replace(tzinfo=None),
        )
        .all()
    )
    for c in expired:
        c.is_active = False
    if expired:
        db.commit()

    challenge = (
        db.query(CTFChallenge)
        .filter(CTFChallenge.is_active == True)
        .order_by(CTFChallenge.created_at.desc())
        .first()
    )
    if not challenge:
        return None

    solved = _has_solved(current_user.id, challenge.id, db)
    return ChallengeOut(
        id=challenge.id,
        title=challenge.title,
        description=challenge.description,
        difficulty=challenge.difficulty,
        xp_reward=challenge.xp_reward,
        coins_reward=challenge.coins_reward,
        is_active=challenge.is_active,
        expires_at=challenge.expires_at,
        solved=solved,
    )


@router.get("/past", response_model=List[ChallengeOut])
def get_past_challenges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return past (inactive) challenges for practice."""
    challenges = (
        db.query(CTFChallenge)
        .filter(CTFChallenge.is_active == False)
        .order_by(CTFChallenge.created_at.desc())
        .limit(20)
        .all()
    )

    result = []
    for c in challenges:
        result.append(
            ChallengeOut(
                id=c.id,
                title=c.title,
                description=c.description,
                difficulty=c.difficulty,
                xp_reward=c.xp_reward,
                coins_reward=c.coins_reward,
                is_active=c.is_active,
                expires_at=c.expires_at,
                solved=_has_solved(current_user.id, c.id, db),
            )
        )
    return result


@router.post("/submit", response_model=SubmitFlagResponse)
def submit_flag(
    payload: SubmitFlagRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit a flag for a CTF challenge. Awards XP/coins for active daily only."""
    challenge = db.query(CTFChallenge).filter_by(id=payload.challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found.")

    # Normalise and check flag
    submitted = payload.flag.strip()
    if submitted.upper() != challenge.flag.upper():
        return SubmitFlagResponse(
            correct=False,
            message="Wrong flag. Keep trying!",
            new_xp=current_user.xp,
            new_coins=current_user.coins,
            new_level=current_user.level,
        )

    # Correct — check if already solved
    already_solved = _has_solved(current_user.id, challenge.id, db)

    xp_earned = 0
    coins_earned = 0

    if not already_solved:
        # Record solve
        solve = CTFSolve(user_id=current_user.id, challenge_id=challenge.id)
        db.add(solve)

        # Only award XP/coins for the active daily challenge
        if challenge.is_active:
            xp_earned = challenge.xp_reward
            coins_earned = challenge.coins_reward

            current_user.xp += xp_earned
            current_user.coins += coins_earned

            # Level-up: keep consuming XP until we can't level up any more.
            # _xp_for_level(L) = XP needed to go from level L to L+1.
            while current_user.xp >= _xp_for_level(current_user.level):
                current_user.xp -= _xp_for_level(current_user.level)
                current_user.level += 1

        db.commit()
        db.refresh(current_user)
        message = "Correct! 🎉 " + ("You've earned XP and Coins!" if xp_earned else "No rewards in practice mode.")
    else:
        message = "Correct! (Already solved — no duplicate rewards.)"

    return SubmitFlagResponse(
        correct=True,
        message=message,
        xp_earned=xp_earned,
        coins_earned=coins_earned,
        new_xp=current_user.xp,
        new_coins=current_user.coins,
        new_level=current_user.level,
    )