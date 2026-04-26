"""
PhishPulse — Routers package
Expose all router modules so main.py can import them cleanly.
"""
from app.routers import auth_router, ctf_router, leaderboard_router

__all__ = ["auth_router", "ctf_router", "leaderboard_router"]