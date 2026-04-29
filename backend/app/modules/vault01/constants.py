"""
PhishPulse — Vault 01 Constants
Pure logic constants only. Content (names, emails, rewards) lives in JSON.
"""

VAULT_ID = 1
TOTAL_LEVELS = 10

# XP is reduced proportionally based on accuracy
# e.g. 80% accuracy = 80% of base xp_reward
XP_ACCURACY_SCALE = True

# Health penalty per wrong answer in a level (negative int)
HEALTH_PER_WRONG = -10

# Minimum accuracy to pass a level and unlock the next
PASS_THRESHOLD = 60.0  # percent

# Level 1 is always unlocked for new users
DEFAULT_UNLOCKED_LEVEL = 1
