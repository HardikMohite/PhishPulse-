"""
PhishPulse — Vault 01 Router
Endpoints:
  GET  /api/vault01            — vault overview (meta + all levels with status)
  GET  /api/vault01/levels     — all levels with user status
  GET  /api/vault01/level/{id} — single level with teaching steps
  GET  /api/vault01/progress   — user's progress across all levels
  POST /api/vault01/submit     — submit answers, get XP, unlock next level
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from app.modules.vault01 import service
from app.modules.vault01.schemas import (
    SubmitAnswerRequest,
    SubmitAnswerResponse,
    ResetVaultResponse,
    CheckAnswerRequest,
    CheckAnswerResponse,
)

router = APIRouter(prefix="/vault01", tags=["vault01"])


@router.get("")
def get_vault_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Vault landing page data: meta + all levels with per-user status."""
    return service.get_vault_overview(current_user.id, db)


@router.get("/levels")
def get_all_levels(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """All levels with status — used for the level selector grid."""
    overview = service.get_vault_overview(current_user.id, db)
    return overview["levels"]


@router.get("/level/{level_id}")
def get_level(
    level_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Single level with teaching steps and email list (answers stripped).
    Returns 404 if level not found, 403 if level is still locked.
    """
    level = service.get_level_detail(current_user.id, level_id, db)
    if not level:
        raise HTTPException(status_code=404, detail=f"Level {level_id} not found")

    if level["status"] == "locked":
        raise HTTPException(
            status_code=403,
            detail="This level is locked. Complete the previous level to unlock it.",
        )

    emails = service.get_level_emails(level_id)
    return {"level": level, "emails": emails}


@router.get("/progress")
def get_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """User's progress for all vault01 levels."""
    return service.get_user_progress(current_user.id, db)


@router.post("/reset", response_model=ResetVaultResponse)
def reset_vault(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Wipe all vault01 progress for the authenticated user.
    Reverses XP and coins earned from vault completions.
    Returns fresh user state for frontend authStore sync.
    """
    try:
        result = service.reset_vault_progress(current_user.id, db)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/check-answer", response_model=CheckAnswerResponse)
def check_answer(
    payload: CheckAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Phase 1 — Per-email instant validation.
    Stateless lookup: no DB writes, no XP, no coins.
    Returns ground truth only after the user has committed their answer.
    """
    try:
        result = service.check_single_answer(
            level_id=payload.level_id,
            email_id=payload.email_id,
            user_guess=payload.user_guess,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/submit", response_model=SubmitAnswerResponse)
def submit_answers(
    payload: SubmitAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submit email classification answers for a level.
    Validates answers, awards XP/coins, unlocks next level if passed.
    """
    try:
        result = service.submit_answers(
            user_id=current_user.id,
            level_id=payload.level_id,
            user_answers=payload.answers,
            time_seconds=payload.time_seconds,
            db=db,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))