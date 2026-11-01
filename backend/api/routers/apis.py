from datetime import date, datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.core.cache.intelligence_cache import cache
from backend.core.database import get_db
from backend.core.models.snapshot import Snapshot
from backend.services.intelligence_service import IntelligenceService


router = APIRouter()


# ==========================================================
# Serialization Helpers
# Keep backend responses fully compatible with frontend types
# ==========================================================

def serialize_topic(topic: Any) -> dict:
    if isinstance(topic, dict):
        return topic
    return {
        "id": getattr(topic, "id", None),
        "title": getattr(topic, "title", ""),
        "summary": getattr(topic, "summary", ""),
        "source": getattr(topic, "source", ""),
        "source_url": getattr(topic, "source_url", getattr(topic, "cource_url", "")),
        "category": getattr(topic, "category", None),
        "language": getattr(topic, "language", "en"),
        "country": getattr(topic, "country", None),
        "keywords": getattr(topic, "keywords", None) or [],
        "entities": getattr(topic, "entities", None) or [],
        "trend_score": getattr(topic, "trend_score", 0.0),
        "confidence_score": getattr(topic, "confidence_score", 0.0),
        "status": getattr(topic, "status", "discovered"),
        "discovered_at": getattr(topic, "discovered_at", None),
        "updated_at": getattr(topic, "updated_at", None),
    }


def serialize_story(story: Any) -> dict:
    if isinstance(story, dict):
        return story

    representative = getattr(story, "representative", None)

    title = getattr(story, "title", None) or (
        getattr(representative, "title", "") if representative else ""
    )
    summary = getattr(story, "summary", None) or (
        getattr(representative, "summary", "") if representative else ""
    )
    keywords = getattr(story, "keywords", None) or (
        getattr(representative, "keywords", []) if representative else []
    )
    category = getattr(story, "category", None) or (
        getattr(representative, "category", None) if representative else None
    )

    editorial_score = getattr(story, "editorial_score", None)
    if editorial_score is None:
        editorial_score = getattr(story, "score", 0.0)

    topics_raw = getattr(story, "topics", [])
    topic_count = getattr(story, "topic_count", None)
    if topic_count is None:
        topic_count = len(topics_raw) if isinstance(topics_raw, list) else 0

    topics = [
        serialize_topic(t) for t in topics_raw
    ] if isinstance(topics_raw, list) else []

    rep_serialized = serialize_topic(representative) if representative else None

    return {
        "id": getattr(story, "id", None),
        "snapshot_id": getattr(story, "snapshot_id", None),
        "cluster_id": getattr(story, "cluster_id", getattr(story, "id", None)),
        "title": title,
        "summary": summary,
        "keywords": list(keywords) if keywords else [],
        "category": category,
        "editorial_score": editorial_score,
        "topic_count": topic_count,
        "representative": rep_serialized,
        "topics": topics,
        "probabilities": getattr(story, "probabilities", []),
    }


def serialize_opportunity(opp: Any) -> dict:
    if isinstance(opp, dict):
        return opp

    explanation = getattr(opp, "explanation", None) or {}
    if not isinstance(explanation, dict):
        explanation = {}

    return {
        "id": getattr(opp, "id", None),
        "story_id": getattr(opp, "story_id", None),
        "headline": getattr(opp, "headline", ""),
        "score": getattr(opp, "score", 0.0),
        "editorial_score": getattr(opp, "score", 0.0),
        "explanation": {
            "summary": explanation.get("summary", ""),
            "strengths": explanation.get("strengths", []),
            "weaknesses": explanation.get("weaknesses", []),
            "recommended_formats": explanation.get(
                "recommended_formats",
                [],
            ),
            "sources": explanation.get("sources", []),
            "scores": explanation.get("scores", {}),
            "keywords": explanation.get("keywords", []),
            "entities": explanation.get("entities", []),
        },
        "category": explanation.get("category"),
        "keywords": explanation.get("keywords", []),
        "entities": explanation.get("entities", []),
    }


# ==========================================================
# Endpoints
# ==========================================================

@router.get("/")
def root():
    return {
        "name": "AI Editorial OS",
        "status": "running"
    }


@router.post("/refresh")
def refresh(db: Session = Depends(get_db)):
    if cache.get().refreshing:
        return {
            "status": "already_running",
            "snapshot_id": cache.get().snapshot_id,
        }

    cache.start_refresh()

    try:
        snapshot = IntelligenceService().discover(db)
        return {
            "status": "success",
            "snapshot_id": snapshot.id,
        }

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
    topic_list = cache.get().topics or []
    return [serialize_topic(t) for t in topic_list]


@router.get("/stories")
def stories():
    clusters = cache.get().clusters
    if isinstance(clusters, dict):
        story_list = list(clusters.values())
    elif isinstance(clusters, list):
        story_list = clusters
    else:
        story_list = []

    return [serialize_story(s) for s in story_list]


@router.get("/opportunities")
def opportunities():
    opp_list = cache.get().opportunities_data or []
    return [serialize_opportunity(o) for o in opp_list]


@router.get("/status")
def status():
    c = cache.get()
    return {
        "refreshing": c.refreshing,
        "last_updated": c.last_updated,
        "snapshot": c.snapshot_id,
    }


@router.get("/history")
def history(
    selected_date: date | None = Query(default=None, alias="date"),
    db: Session = Depends(get_db),
):
    query = db.query(Snapshot)

    if selected_date:
        start = datetime.combine(selected_date, datetime.min.time())
        end = start + timedelta(days=1)
        query = query.filter(
            Snapshot.created_at >= start,
            Snapshot.created_at < end,
        )

    snapshots = query.order_by(Snapshot.created_at.desc()).limit(100).all()

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
