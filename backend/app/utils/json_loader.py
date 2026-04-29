"""
PhishPulse — JSON Content Loader
Safely reads vault content JSON files from app/content/
"""

import json
from pathlib import Path
from typing import Any

CONTENT_DIR = Path(__file__).resolve().parent.parent / "content"


def _load(relative_path: str) -> Any:
    """Load and parse a JSON file relative to the content directory."""
    full_path = CONTENT_DIR / relative_path
    if not full_path.exists():
        raise FileNotFoundError(f"Content file not found: {full_path}")
    with open(full_path, "r", encoding="utf-8") as f:
        return json.load(f)


# ── Vault 01 loaders ──────────────────────────────────────────────────────────

def load_vault01_meta() -> dict:
    return _load("vault01/meta.json")


def load_vault01_levels() -> list[dict]:
    return _load("vault01/levels.json")


def load_vault01_level(level_id: int) -> dict | None:
    levels = load_vault01_levels()
    return next((l for l in levels if l["id"] == level_id), None)


def load_vault01_emails() -> list[dict]:
    return _load("vault01/emails.json")


def load_vault01_emails_for_level(level_id: int) -> list[dict]:
    emails = load_vault01_emails()
    return [e for e in emails if e["level_id"] == level_id]


def load_vault01_rules() -> list[dict]:
    return _load("vault01/rules.json")


def load_vault01_rules_for_level(level_id: int) -> dict | None:
    rules = load_vault01_rules()
    return next((r for r in rules if r["level_id"] == level_id), None)


def load_vault01_rewards() -> list[dict]:
    return _load("vault01/rewards.json")


def load_vault01_reward_for_level(level_id: int) -> dict | None:
    rewards = load_vault01_rewards()
    return next((r for r in rewards if r["level_id"] == level_id), None)
