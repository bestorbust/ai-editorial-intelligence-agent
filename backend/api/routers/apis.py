from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta
from fastapi import Query
from backend.core.database import SessionLocal

from backend.core.models.snapshot import Snapshot

from backend.core.cache.intelligence_cache import cache
from backend.core.database import get_db
from backend.services.intelligence_service import IntelligenceService


router = APIRouter()

@router.get("/")
def root():
    return {
        "name": "AI Editorial OS",
        "status": "running"
    }

@router.post("/refresh")
def refresh(db: Session = Depends(get_db)):

    cache.start_refresh()

    try:
        snapshot = IntelligenceService().discover(db)

        return snapshot

    except Exception as e:

        cache.fail()

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )
    
@router.get("/dashboard")
def dashboard():

    c = cache.get()

    return {
        "snapshot": c.snapshot_id,
        "last_updated": c.last_updated,
        "raw_articles": c.raw_articles,
        "semantic_unique": c.semantic_unique,
        "stories": c.stories,
        "opportunities": c.opportunities,
        "refreshing": c.refreshing,
    }

@router.get("/topics")
def topics():

    return cache.get().topics

@router.get("/stories")
def stories():

    return cache.get().clusters

@router.get("/opportunities")
def opportunities():

    return cache.get().opportunities_data

@router.get("/status")
def status():

    c = cache.get()

    return {
        "refreshing": c.refreshing,
        "last_updated": c.last_updated,
        "snapshot": c.snapshot_id,
    }


@router.get("/history")
def history(selected_date: date | None = Query(default=None, alias="date")):
    db = SessionLocal()

    try:
        # Default = today's history
        target_date = selected_date or date.today()

        start = datetime.combine(target_date, datetime.min.time())
        end = start + timedelta(days=1)

        snapshots = (
            db.query(Snapshot)
            .filter(
                Snapshot.created_at >= start,
                Snapshot.created_at < end,
            )
            .order_by(Snapshot.created_at.desc())
            .all()
        )

        return [
            {
                "id": snapshot.id,
                "created_at": snapshot.created_at,
                "raw_collected": snapshot.raw_collected,
                "semantic_unique": snapshot.semantic_unique,
                "stories": snapshot.stories,
                "opportunities": snapshot.opportunities,
                "pipeline_time": snapshot.pipeline_time,
            }
            for snapshot in snapshots
        ]

    finally:
        db.close()