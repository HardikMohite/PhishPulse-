"""
PhishPulse Backend — FastAPI Application Entry Point
"""

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import init_db
from app.utils.session_manager import session_manager
from app.routers import auth_router, ctf_router, leaderboard_router

# ── Vault modules ─────────────────────────────────────────────────────────────
from app.modules.vault01 import router as vault01_router


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs once on startup, then yields, then runs on shutdown.
    """
    # ── Startup ───────────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print(f"  {settings.APP_NAME}")
    print(f"  Environment : {'DEVELOPMENT' if settings.DEBUG else 'PRODUCTION'}")
    print(f"  Database    : {settings.DATABASE_URL}")
    print(f"  Frontend    : {settings.FRONTEND_URL}")
    print("=" * 60 + "\n")

    # Initialise database (creates tables including vault_progress)
    init_db()
    print("[DB] Tables initialised.")

    # Start background task that periodically cleans up expired registration sessions
    cleanup_task = asyncio.create_task(_session_cleanup_loop())
    print("[SESSION] Background cleanup task started.")

    yield  # ← application runs here

    # ── Shutdown ──────────────────────────────────────────────────────────────
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass
    print("\n[SHUTDOWN] PhishPulse backend stopped cleanly.")


async def _session_cleanup_loop():
    """
    Background coroutine: purge expired registration sessions every 5 minutes.
    """
    while True:
        await asyncio.sleep(5 * 60)
        removed = session_manager.cleanup_expired_sessions()
        if removed:
            print(f"[SESSION CLEANUP] Removed {removed} expired session(s).")


# ── Application factory ───────────────────────────────────────────────────────

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        description=(
            "PhishPulse API — Cybersecurity awareness and gamification platform.\n\n"
            "Provides authentication (JWT via httpOnly cookie), CTF challenges, "
            "leaderboard, vault training, and user gamification endpoints."
        ),
        version="1.0.0",
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
        openapi_url="/openapi.json" if settings.DEBUG else None,
        lifespan=lifespan,
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    cors_origins = list({settings.FRONTEND_URL, *settings.BACKEND_CORS_ORIGINS})
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Global exception handler ───────────────────────────────────────────────
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        print(f"[UNHANDLED ERROR] {request.method} {request.url.path} → {exc}")
        return JSONResponse(
            status_code=500,
            content={"detail": "An internal server error occurred. Please try again later."},
        )

    # ── Health check ───────────────────────────────────────────────────────────
    @app.get("/health", tags=["system"], summary="Health check")
    def health():
        return {
            "status": "ok",
            "app": settings.APP_NAME,
            "debug": settings.DEBUG,
        }

    # ── Root ───────────────────────────────────────────────────────────────────
    @app.get("/", tags=["system"], include_in_schema=False)
    def root():
        if settings.DEBUG:
            return {"message": f"Welcome to {settings.APP_NAME}. Docs at /docs"}
        return {"message": f"Welcome to {settings.APP_NAME}."}

    # ── Existing routers ───────────────────────────────────────────────────────
    app.include_router(auth_router.router,        prefix=settings.API_V1_PREFIX)
    app.include_router(ctf_router.router,         prefix=settings.API_V1_PREFIX)
    app.include_router(leaderboard_router.router, prefix=settings.API_V1_PREFIX)

    # ── Vault modules ──────────────────────────────────────────────────────────
    app.include_router(vault01_router.router,     prefix=settings.API_V1_PREFIX)

    return app


# ── Application instance ──────────────────────────────────────────────────────

app = create_app()


# ── Dev entry-point ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info",
    )
