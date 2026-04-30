"""
PhishPulse — Vault 01 Service
Orchestrates: JSON loading, DB progress reads/writes, answer validation, XP award.
"""

from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.vault_progress import VaultProgress
from app.utils.json_loader import (
    load_vault01_meta,
    load_vault01_levels,
    load_vault01_level,
    load_vault01_emails_for_level,
    load_vault01_rules_for_level,
    load_vault01_reward_for_level,
)
from app.modules.vault01.validator import check_answers, calculate_xp, calculate_health_change, compute_tag
from app.modules.vault01.constants import VAULT_ID, DEFAULT_UNLOCKED_LEVEL, TOTAL_LEVELS


# ── Progress helpers ──────────────────────────────────────────────────────────

def _get_or_create_progress(user_id: str, level_id: int, db: Session) -> VaultProgress:
    """Fetch existing progress row or create a default one."""
    row = (
        db.query(VaultProgress)
        .filter_by(user_id=user_id, vault_id=VAULT_ID, level_id=level_id)
        .first()
    )
    if row:
        return row

    # Determine default status
    status = "unlocked" if level_id == DEFAULT_UNLOCKED_LEVEL else "locked"
    row = VaultProgress(
        user_id=user_id,
        vault_id=VAULT_ID,
        level_id=level_id,
        status=status,
    )
    db.add(row)
    db.flush()
    return row


def _get_all_progress(user_id: str, db: Session) -> dict[int, VaultProgress]:
    """Return a dict of level_id -> VaultProgress for all levels."""
    rows = (
        db.query(VaultProgress)
        .filter_by(user_id=user_id, vault_id=VAULT_ID)
        .all()
    )
    return {r.level_id: r for r in rows}


def _build_status_map(user_id: str, db: Session) -> dict[int, str]:
    """
    Build a level_id -> status map for all 10 levels.
    Level 1 defaults to 'unlocked' if no progress row exists.
    All others default to 'locked'.
    """
    existing = _get_all_progress(user_id, db)
    status_map = {}
    for level_id in range(1, TOTAL_LEVELS + 1):
        if level_id in existing:
            status_map[level_id] = existing[level_id].status
        elif level_id == DEFAULT_UNLOCKED_LEVEL:
            status_map[level_id] = "unlocked"
        else:
            status_map[level_id] = "locked"
    return status_map


# ── Public service functions ──────────────────────────────────────────────────

def get_vault_overview(user_id: str, db: Session) -> dict:
    """Return meta + all levels with per-user status injected."""
    meta = load_vault01_meta()
    levels = load_vault01_levels()
    status_map = _build_status_map(user_id, db)

    levels_out = []
    for level in levels:
        level_out = {k: v for k, v in level.items() if k != "teaching_steps"}
        level_out["status"] = status_map.get(level["id"], "locked")
        levels_out.append(level_out)

    return {"meta": meta, "levels": levels_out}


def get_level_detail(user_id: str, level_id: int, db: Session) -> dict | None:
    """Return a single level with teaching steps + status."""
    level = load_vault01_level(level_id)
    if not level:
        return None

    status_map = _build_status_map(user_id, db)
    level_out = dict(level)
    level_out["status"] = status_map.get(level_id, "locked")
    return level_out


def get_level_emails(level_id: int) -> list[dict]:
    """Return emails for a level — is_phishing stripped out."""
    emails = load_vault01_emails_for_level(level_id)
    # Strip the answer from the response
    return [{k: v for k, v in e.items() if k != "is_phishing"} for e in emails]


def get_user_progress(user_id: str, db: Session) -> dict:
    """Return progress for all levels."""
    existing = _get_all_progress(user_id, db)
    levels_progress = []

    for level_id in range(1, TOTAL_LEVELS + 1):
        if level_id in existing:
            row = existing[level_id]
            levels_progress.append({
                "level_id": level_id,
                "status": row.status,
                "best_accuracy": row.best_accuracy,
                "completed_at": row.completed_at.isoformat() if row.completed_at else None,
            })
        else:
            levels_progress.append({
                "level_id": level_id,
                "status": "unlocked" if level_id == DEFAULT_UNLOCKED_LEVEL else "locked",
                "best_accuracy": None,
                "completed_at": None,
            })

    return {"vault_id": VAULT_ID, "levels": levels_progress}


def reset_vault_progress(user_id: str, db: Session) -> dict:
    """
    Wipe all vault01 progress for the user and subtract XP/coins earned from it.
    Returns fresh user state for the frontend to sync into authStore.
    """
    # Gather all completed progress rows to reverse XP/coins
    rows = (
        db.query(VaultProgress)
        .filter_by(user_id=user_id, vault_id=VAULT_ID)
        .all()
    )

    total_xp_earned = sum(r.xp_earned or 0 for r in rows)
    total_coins_earned = sum(r.coins_earned or 0 for r in rows)

    # Delete all progress rows for this vault
    for row in rows:
        db.delete(row)

    # Subtract from user
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise ValueError(f"User {user_id} not found")

    user.xp = max(0, (user.xp or 0) - total_xp_earned)
    user.coins = max(0, (user.coins or 0) - total_coins_earned)
    user.level = max(1, user.xp // 100 + 1)

    db.commit()

    return {
        "success": True,
        "new_xp": user.xp,
        "new_coins": user.coins,
        "new_level": user.level,
        "health": 100,
    }


def check_single_answer(level_id: int, email_id: int, user_guess: bool) -> dict:
    """
    Phase 1 — stateless per-email answer check.
    Loads rules.json, looks up the correct answer for email_id,
    computes tag and health_change. No DB writes.
    """
    rules = load_vault01_rules_for_level(level_id)
    if not rules:
        raise ValueError(f"Rules for level {level_id} not found")

    correct_answers = rules.get("correct_answers", {})
    email_key = str(email_id)

    if email_key not in correct_answers:
        raise ValueError(
            f"Email {email_id} does not belong to level {level_id}"
        )

    is_phishing: bool = correct_answers[email_key]
    is_correct = user_guess == is_phishing
    tag = compute_tag(is_phishing, user_guess)
    health_change = 0 if is_correct else -20

    return {
        "email_id": email_id,
        "is_correct": is_correct,
        "is_phishing": is_phishing,
        "user_guess": user_guess,
        "tag": tag,
        "health_change": health_change,
    }


def submit_answers(
    user_id: str,
    level_id: int,
    user_answers: dict[str, bool],
    time_seconds: int,
    db: Session,
) -> dict:
    """
    Validate answers, update progress, award XP/coins, unlock next level.
    Returns the full result payload.
    """
    # Load level info
    level = load_vault01_level(level_id)
    if not level:
        raise ValueError(f"Level {level_id} not found")

    # Load rules for this level
    rules = load_vault01_rules_for_level(level_id)
    correct_answers = rules["correct_answers"] if rules else {}

    # Validate answers
    result = check_answers(user_answers, correct_answers)
    accuracy = result["accuracy"]
    wrong_count = result["wrong_count"]
    passed = result["passed"]

    # Calculate XP and coins — only awarded on pass
    if passed:
        xp_earned = calculate_xp(level["xp_reward"], accuracy)
        coins_earned = round(level["coins_reward"] * (accuracy / 100))
    else:
        xp_earned = 0
        coins_earned = 0
    health_change = calculate_health_change(wrong_count)

    # Update user XP, coins, level in DB — only on pass
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise ValueError(f"User {user_id} not found")

    if passed:
        new_xp = (user.xp or 0) + xp_earned
        new_coins = (user.coins or 0) + coins_earned
        # Simple level-up: every 100 XP = 1 level
        new_user_level = max((user.level or 1), new_xp // 100 + 1)
        user.xp = new_xp
        user.coins = new_coins
        user.level = new_user_level
    else:
        new_xp = user.xp or 0
        new_coins = user.coins or 0
        new_user_level = user.level or 1

    # Update vault progress for this level
    progress_row = _get_or_create_progress(user_id, level_id, db)
    progress_row.time_seconds = time_seconds

    if passed:
        if progress_row.best_accuracy is None or accuracy > progress_row.best_accuracy:
            progress_row.best_accuracy = accuracy
        if progress_row.status != "completed":
            progress_row.status = "completed"
            progress_row.completed_at = datetime.now(timezone.utc)
        progress_row.xp_earned = xp_earned
        progress_row.coins_earned = coins_earned
    else:
        # Failed attempt — mark as active (in-progress) so user knows to retry
        if progress_row.status == "locked":
            progress_row.status = "active"

    # Unlock next level if passed and next level exists
    next_level_id = level_id + 1 if level_id < TOTAL_LEVELS else None
    next_level_unlocked = False

    if passed and next_level_id:
        next_row = _get_or_create_progress(user_id, next_level_id, db)
        if next_row.status == "locked":
            next_row.status = "unlocked"
            next_level_unlocked = True

    db.commit()

    # Load reward and rule data to include in response
    reward = load_vault01_reward_for_level(level_id) or {}
    red_flags = rules.get("red_flags", []) if rules else []
    attack_timeline = rules.get("attack_timeline", []) if rules else []
    what_you_learned = reward.get("what_you_learned", [])

    return {
        "correct": passed,
        "accuracy": accuracy,
        "xp_earned": xp_earned,
        "coins_earned": coins_earned,
        "new_xp": new_xp,
        "new_coins": new_coins,
        "new_level": new_user_level,
        "health_change": health_change,
        "next_level_unlocked": next_level_unlocked,
        "next_level_id": next_level_id if next_level_unlocked else None,
        "red_flags": red_flags,
        "attack_timeline": attack_timeline,
        "what_you_learned": what_you_learned,
        "per_email_results": result.get("per_email_results", []),
    }