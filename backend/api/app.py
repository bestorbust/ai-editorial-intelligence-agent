from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routers import apis
from backend.core.database import SessionLocal
from backend.services.startup_service import StartupService
from backend.core.init_db import init_db

from apscheduler.schedulers.background import BackgroundScheduler
import requests


scheduler = BackgroundScheduler()

# backend/api/app.py

import os
import sys
import traceback
import psutil

# 1. Debug Memory Immediately
process = psutil.Process(os.getpid())
print(f"🚀 [STARTUP] Process Started. PID: {os.getpid()}")
print(f"💾 [MEMORY] Initial Memory Usage: {process.memory_info().rss / 1024 / 1024:.2f} MB")

try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    
    # 2. Debug Imports (Common crash point for Spacy/KeyBERT)
    print("⏳ [IMPORT] Loading dependencies...")
    
    app = FastAPI()
    
    # Add CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"], # Tighten this in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 3. Debug Model Loading (Do NOT load Spacy/KeyBERT globally yet)
    # If you have global imports like `import spacy` or `nlp = spacy.load(...)`, 
    # COMMENT THEM OUT temporarily to see if the server starts.
    
    @app.get("/health")
    def health_check():
        current_mem = process.memory_info().rss / 1024 / 1024
        return {"status": "ok", "memory_mb": round(current_mem, 2)}

    # 4. Catch Startup Events
    @app.on_event("startup")
    async def startup_event():
        print("✅ [STARTUP] FastAPI App Started Successfully")
        print(f"💾 [MEMORY] Memory at Startup: {process.memory_info().rss / 1024 / 1024:.2f} MB")
        
        # Try importing your heavy modules here to see if they crash the server
        try:
            print("⏳ [LOAD] Attempting to load AI modules (Lazy Load Check)...")
            # DO NOT initialize them yet, just import
            from backend.intelligence.trend_discovery.processors.keyword_extractor import KeywordExtractor
            print("✅ [LOAD] KeywordExtractor module imported successfully (Not initialized)")
        except Exception as e:
            print(f"❌ [ERROR] Failed to import module: {e}")
            traceback.print_exc()

except Exception as e:
    print(f"❌ [CRITICAL FATAL ERROR] Application failed to start: {e}")
    traceback.print_exc()
    sys.exit(1)   
    
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
        "https://ai-editorial-intelligence-agent.vercel.app"
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