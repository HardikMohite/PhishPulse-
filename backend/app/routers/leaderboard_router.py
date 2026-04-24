from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


class LeaderboardEntry(BaseModel):
    rank: int
    id: str
    name: str
    level: int
    xp: int
    streak: int
    coins: int
    is_you: bool

    class Config:
        from_attributes = True


@router.get("", response_model=List[LeaderboardEntry])
def get_leaderboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return top 50 users sorted by XP descending."""
    users = (
        db.query(User)
        .filter(User.is_verified == True, User.is_active == True)
        .order_by(User.xp.desc(), User.level.desc(), User.coins.desc())
        .limit(50)
        .all()
    )

    entries = []
    for i, u in enumerate(users):
        entries.append(
            LeaderboardEntry(
                rank=i + 1,
                id=u.id,
                name=u.name,
                level=u.level,
                xp=u.xp,
                streak=u.streak,
                coins=u.coins,
                is_you=(u.id == current_user.id),
            )
        )

    # If current user not in top 50, append them at their actual rank
    user_ids = {u.id for u in users}
    if current_user.id not in user_ids:
        # Count users who rank strictly above current_user using the same
        # tie-breaking order as the main query: xp DESC, level DESC, coins DESC
        from sqlalchemy import or_, and_
        total_above = (
            db.query(User)
            .filter(
                User.is_verified == True,
                User.is_active == True,
                User.id != current_user.id,   # exclude self to avoid off-by-one
                or_(
                    User.xp > current_user.xp,
                    and_(User.xp == current_user.xp, User.level > current_user.level),
                    and_(
                        User.xp == current_user.xp,
                        User.level == current_user.level,
                        User.coins > current_user.coins,
                    ),
                ),
            )
            .count()
        )
        entries.append(
            LeaderboardEntry(
                rank=total_above + 1,
                id=current_user.id,
                name=current_user.name,
                level=current_user.level,
                xp=current_user.xp,
                streak=current_user.streak,
                coins=current_user.coins,
                is_you=True,
            )
        )

    return entries