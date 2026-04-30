"""
PhishPulse — Vault 01 Validator
Pure functions. Takes answers + rules, returns results. No DB, no side effects.

HEALTH DEDUCTION RULES
──────────────────────
Correct answers NEVER reduce health:
  • Phishing mail + Mark Phishing  → THREAT BLOCKED  → no deduction
  • Safe mail    + Mark Safe       → SAFE VERIFIED   → no deduction

Wrong answers ALWAYS reduce health by HEALTH_PER_WRONG (−20 each):
  • Phishing mail + Mark Safe      → MISSED THREAT   → −20
  • Safe mail    + Mark Phishing   → FALSE ALARM     → −20

Unanswered emails are treated as wrong (user didn't classify = missed threat).
"""

from app.modules.vault01.constants import HEALTH_PER_WRONG, PASS_THRESHOLD, XP_ACCURACY_SCALE


def compute_tag(is_phishing: bool, user_guess: bool | None) -> str:
    """
    Compute the classification tag for a single email answer.

    is_phishing=True  + user_guess=True  → THREAT_BLOCKED
    is_phishing=False + user_guess=False → SAFE_VERIFIED
    is_phishing=True  + user_guess=False (or None) → MISSED_THREAT
    is_phishing=False + user_guess=True  → FALSE_ALARM
    """
    if user_guess is None:
        return "MISSED_THREAT"
    if is_phishing and user_guess:
        return "THREAT_BLOCKED"
    if not is_phishing and not user_guess:
        return "SAFE_VERIFIED"
    if is_phishing and not user_guess:
        return "MISSED_THREAT"
    return "FALSE_ALARM"


def check_answers(
    user_answers: dict[str, bool],
    correct_answers: dict[str, bool],
) -> dict:
    """
    Compare user answers against correct answers.
    Returns a result dict with accuracy, correct count, wrong count.

    user_answers   : { "1": True,  "2": False, "3": True  }
    correct_answers: { "1": False, "2": False, "3": True  }

    Keys are always strings (JSON keys). Values:
      True  = phishing
      False = safe/legitimate

    Correct outcomes  → correct_count  (no health penalty)
    Wrong outcomes    → wrong_count    (health penalty applied by caller)
    """
    total = len(correct_answers)
    if total == 0:
        return {"correct_count": 0, "wrong_count": 0, "accuracy": 0.0, "passed": False}

    correct_count = 0
    wrong_count = 0
    per_email_results = []

    for email_id, correct_value in correct_answers.items():
        user_value = user_answers.get(str(email_id))
        tag = compute_tag(correct_value, user_value)

        if user_value is None:
            wrong_count += 1
            is_correct = False
        elif user_value == correct_value:
            correct_count += 1
            is_correct = True
        else:
            wrong_count += 1
            is_correct = False

        per_email_results.append({
            "email_id": int(email_id),
            "is_correct": is_correct,
            "correct_answer": correct_value,
            "user_guess": user_value,
            "tag": tag,
        })

    accuracy = round((correct_count / total) * 100, 1)
    passed = accuracy >= PASS_THRESHOLD

    return {
        "correct_count": correct_count,
        "wrong_count": wrong_count,
        "accuracy": accuracy,
        "passed": passed,
        "per_email_results": per_email_results,
    }


def calculate_xp(base_xp: int, accuracy: float) -> int:
    """Scale XP earned based on accuracy if scaling is enabled."""
    if not XP_ACCURACY_SCALE:
        return base_xp
    return round(base_xp * (accuracy / 100))


def calculate_health_change(wrong_count: int) -> int:
    """
    Return the total health change (always 0 or negative) based on wrong answers only.

    HEALTH_PER_WRONG is −20, matching the frontend HEALTH_PENALTY constant.
    Correct answers contribute 0 to this value — they are never penalised.

    Examples:
      0 wrong → 0
      1 wrong → −20
      3 wrong → −60
      5 wrong → −100  (capped to 0 HP on the frontend, never goes below 0)
    """
    if wrong_count <= 0:
        return 0
    return wrong_count * HEALTH_PER_WRONG