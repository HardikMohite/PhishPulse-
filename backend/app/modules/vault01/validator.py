"""
PhishPulse — Vault 01 Validator
Pure functions. Takes answers + rules, returns results. No DB, no side effects.
"""

from app.modules.vault01.constants import HEALTH_PER_WRONG, PASS_THRESHOLD, XP_ACCURACY_SCALE


def check_answers(
    user_answers: dict[str, bool],
    correct_answers: dict[str, bool],
) -> dict:
    """
    Compare user answers against correct answers.
    Returns a result dict with accuracy, correct count, wrong count.

    user_answers  : { "1": True, "2": False, "3": True }
    correct_answers: { "1": False, "2": False, "3": True }
    """
    total = len(correct_answers)
    if total == 0:
        return {"correct_count": 0, "wrong_count": 0, "accuracy": 0.0, "passed": False}

    correct_count = 0
    wrong_count = 0

    for email_id, correct_value in correct_answers.items():
        user_value = user_answers.get(str(email_id))
        if user_value is None:
            # Unanswered counts as wrong
            wrong_count += 1
        elif user_value == correct_value:
            correct_count += 1
        else:
            wrong_count += 1

    accuracy = round((correct_count / total) * 100, 1)
    passed = accuracy >= PASS_THRESHOLD

    return {
        "correct_count": correct_count,
        "wrong_count": wrong_count,
        "accuracy": accuracy,
        "passed": passed,
    }


def calculate_xp(base_xp: int, accuracy: float) -> int:
    """Scale XP earned based on accuracy if scaling is enabled."""
    if not XP_ACCURACY_SCALE:
        return base_xp
    return round(base_xp * (accuracy / 100))


def calculate_health_change(wrong_count: int) -> int:
    """Return a negative health change based on number of wrong answers."""
    return wrong_count * HEALTH_PER_WRONG
