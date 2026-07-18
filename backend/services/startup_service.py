from sqlalchemy.orm import Session

from backend.core.cache.intelligence_cache import cache
from backend.core.models.snapshot import Snapshot
from backend.core.models.story import Story
from backend.core.models.opportunity import Opportunity
from backend.core.models.topic import Topic


class StartupService:

    def __init__(self, db: Session):
        self.db = db

    def load_cache(self):

        snapshot = (
            self.db.query(Snapshot)
            .order_by(Snapshot.id.desc())
            .first()
        )

        if not snapshot:
            return

        stories = (
            self.db.query(Story)
            .filter(Story.snapshot_id == snapshot.id)
            .all()
        )

        opportunities = (
            self.db.query(Opportunity)
            .join(Story)
            .filter(Story.snapshot_id == snapshot.id)
            .all()
        )

        topics = (
            self.db.query(Topic)
            .all()
        )

        cache.get().snapshot_id = snapshot.id
        cache.get().last_updated = snapshot.created_at

        cache.get().raw_articles = snapshot.raw_collected
        cache.get().semantic_unique = snapshot.semantic_unique

        cache.get().stories = len(stories)
        cache.get().opportunities = len(opportunities)

        cache.get().topics = topics
        cache.get().clusters = stories
        cache.get().opportunities_data = opportunities