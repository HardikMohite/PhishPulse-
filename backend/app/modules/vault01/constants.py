"""
PhishPulse — Vault 01 Constants
Pure logic constants only. Content (names, emails, rewards) lives in JSON.
"""

VAULT_ID = 1
TOTAL_LEVELS = 10

# XP is reduced proportionally based on accuracy
# e.g. 80% accuracy = 80% of base xp_reward
XP_ACCURACY_SCALE = True

# Health penalty per wrong answer in a level (negative int).
# Must match HEALTH_PENALTY = 20 on the frontend (useVault01.ts).
# Only wrong answers trigger this — correct answers (THREAT BLOCKED / SAFE VERIFIED) never deduct.
HEALTH_PER_WRONG = -20

# Minimum accuracy to pass a level and unlock the next.
# Must match PASS_THRESHOLD = 75 in frontend scoring.ts.
PASS_THRESHOLD = 75.0  # percent

# Level 1 is always unlocked for new users
DEFAULT_UNLOCKED_LEVEL = 1