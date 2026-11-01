import os
import psutil
import requests
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routers import apis
from backend.core.database import SessionLocal
from backend.core.init_db import init_db
from backend.services.startup_service import StartupService


scheduler = BackgroundScheduler()
process = psutil.Process(os.getpid())


app = FastAPI(
    title="AI Editorial OS",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(apis.router)


@app.get("/health")
def health_check():
    current_mem = process.memory_info().rss / 1024 / 1024
    return {
        "status": "ok",
        "memory_mb": round(current_mem, 2),
    }


def scheduled_refresh():
    """
    Automatically trigger intelligence refresh every 15 minutes.
    """
    print("\n[AUTO REFRESH] Triggering scheduled refresh...")
    try:
        response = requests.post(
            "http://127.0.0.1:8000/refresh",
            timeout=600,
        )
        print(
            f"[AUTO REFRESH] Request sent. Status: {response.status_code}"
        )
    except Exception as e:
        print(f"[AUTO REFRESH] Failed: {e}")


@app.on_event("startup")
def startup():
    print("✅ [STARTUP] Initializing AI Editorial OS...")
    print(f"💾 [MEMORY] Initial Memory Usage: {process.memory_info().rss / 1024 / 1024:.2f} MB")

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

    print("[STARTUP] Auto-refresh scheduler started (every 15 minutes)")


@app.on_event("shutdown")
def shutdown():
    if scheduler.running:
        scheduler.shutdown()
    print("[SHUTDOWN] Scheduler stopped")
