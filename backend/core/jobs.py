from backend.services.intelligence_service import IntelligenceService
from backend.core.database import SessionLocal


def refresh_pipeline():

    db = SessionLocal()

    try:
        IntelligenceService().discover(db)

    finally:
        db.close()