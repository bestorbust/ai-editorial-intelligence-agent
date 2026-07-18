from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routers import apis
from backend.core.database import SessionLocal
from backend.services.startup_service import StartupService
from backend.core.init_db import init_db

from apscheduler.schedulers.background import BackgroundScheduler
import requests


scheduler = BackgroundScheduler()


def scheduled_refresh():
    """
    Automatically trigger intelligence refresh every 30 minutes.
    """

    print("\n[AUTO REFRESH] Triggering scheduled refresh...")

    try:
        response = requests.post(
            "http://127.0.0.1:8000/refresh",
            timeout=600
        )

        print(
            f"[AUTO REFRESH] Request sent. "
            f"Status: {response.status_code}"
        )

    except Exception as e:
        print(f"[AUTO REFRESH] Failed: {e}")


app = FastAPI(
    title="AI Editorial OS",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(apis.router)


@app.on_event("startup")
def startup():

    # Initialize database
    init_db()

    # Load latest snapshot into cache
    db = SessionLocal()

    try:
        StartupService(db).load_cache()
    finally:
        db.close()

    # Schedule refresh every 15 minutes
    scheduler.add_job(
        scheduled_refresh,
        trigger="interval",
        minutes=15,
        id="intelligence_auto_refresh",
        replace_existing=True,
        max_instances=1,
    )

    scheduler.start()

    print("[STARTUP] Auto-refresh scheduler started")
    print("[STARTUP] Intelligence refresh scheduled every 30 minutes")


@app.on_event("shutdown")
def shutdown():

    if scheduler.running:
        scheduler.shutdown()

    print("[SHUTDOWN] Scheduler stopped")