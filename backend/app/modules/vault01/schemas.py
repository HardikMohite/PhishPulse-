"""
PhishPulse — Vault 01 Pydantic Schemas
All request/response shapes for the vault01 API.
"""

from pydantic import BaseModel
from typing import Optional


# ── Meta ──────────────────────────────────────────────────────────────────────

class VaultMetaOut(BaseModel):
    vault_id: int
    title: str
    subtitle: str
    tier: str
    total_levels: int
    total_xp: int
    total_coins: int
    badge_name: str
    est_total_minutes: int


# ── Levels ────────────────────────────────────────────────────────────────────

class LevelOut(BaseModel):
    id: int
    name: str
    concept: str
    description: str
    difficulty: str
    tag: str
    email_count: int
    xp_reward: int
    coins_reward: int
    est_minutes: int
    # Injected from progress table
    status: str = "locked"


class LevelWithTeachingOut(LevelOut):
    teaching_steps: list[dict]


# ── Emails ────────────────────────────────────────────────────────────────────

class EmailLinkOut(BaseModel):
    display_text: str
    real_url: str
    is_dangerous: bool


class EmailOut(BaseModel):
    id: int
    level_id: int
    sender: str
    address: str
    subject: str
    preview: str
    time: str
    avatar_color: str
    content_html: str
    links: list[EmailLinkOut]
    # NOTE: is_phishing is intentionally NOT included here.
    # The frontend must not know the answer before the user decides.


# ── Progress ──────────────────────────────────────────────────────────────────

class ProgressEntryOut(BaseModel):
    level_id: int
    status: str
    best_accuracy: Optional[float]
    completed_at: Optional[str]

    class Config:
        from_attributes = True


class VaultProgressOut(BaseModel):
    vault_id: int
    levels: list[ProgressEntryOut]


# ── Submit ────────────────────────────────────────────────────────────────────

class SubmitAnswerRequest(BaseModel):
    level_id: int
    # key: email_id as string (JSON keys are always strings), value: user's guess
    answers: dict[str, bool]
    time_seconds: int


class CheckAnswerRequest(BaseModel):
    level_id: int
    email_id: int
    user_guess: bool


class CheckAnswerResponse(BaseModel):
    email_id: int
    is_correct: bool
    is_phishing: bool       # ground truth — safe to reveal after user commits
    user_guess: bool
    tag: str                # THREAT_BLOCKED | SAFE_VERIFIED | MISSED_THREAT | FALSE_ALARM
    health_change: int      # 0 if correct, -20 if wrong


class ResetVaultResponse(BaseModel):
    success: bool
    new_xp: int
    new_coins: int
    new_level: int
    health: int


class SubmitAnswerResponse(BaseModel):
    correct: bool                   # True if all answers correct
    accuracy: float                 # 0.0 – 100.0
    xp_earned: int
    coins_earned: int
    new_xp: int
    new_coins: int
    new_level: int
    health_change: int              # 0 or negative
    next_level_unlocked: bool
    next_level_id: Optional[int]
    # Sent back so frontend can show the red flags without a second call
    red_flags: list[dict]
    attack_timeline: list[dict]
    what_you_learned: list[str]
    per_email_results: list[dict]