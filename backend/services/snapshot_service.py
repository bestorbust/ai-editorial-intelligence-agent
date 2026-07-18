import hashlib
import time

from sqlalchemy.orm import Session

from backend.core.cache.intelligence_cache import cache

from backend.core.models.snapshot import Snapshot
from backend.core.models.story import Story as StoryDB
from backend.core.models.topic import Topic as TopicDB
from backend.core.models.opportunity import Opportunity as OpportunityDB
from backend.core.models.topic_snapshot import TopicSnapshot

from backend.intelligence.trend_discovery.models import TrendDiscoveryResult


class SnapshotService:

    def __init__(self, db: Session):
        self.db = db

    def _hash(self, topic):

        return hashlib.sha256(
            f"{topic.title}|{topic.source}|{topic.source_url}".encode()
        ).hexdigest()
    
    def save(self, result: TrendDiscoveryResult):

        start = time.perf_counter()

        snapshot = Snapshot(
            raw_collected=result.raw_collected,
            semantic_unique=result.semantic_unique,
            stories=len(result.clusters),
            opportunities=len(result.opportunities),
        )

        self.db.add(snapshot)

        self.db.flush()

        topic_map = {}

        for topic in result.topics:

            content_hash = self._hash(topic)

            existing = (
                self.db.query(TopicDB)
                .filter_by(content_hash=content_hash)
                .first()
            )

            if existing:

                db_topic = existing

            else:

                db_topic = TopicDB(

                    title=topic.title,
                    summary=topic.summary,

                    source=topic.source,
                    source_url=topic.source_url,

                    category=topic.category,
                    language=topic.language,
                    country=topic.country,

                    keywords=topic.keywords,
                    entities=topic.entities,

                    trend_score=topic.trend_score,
                    confidence_score=topic.confidence_score,

                    raw_text=topic.raw_text,

                    status=topic.status,

                    content_hash=content_hash,
                )

                self.db.add(db_topic)

                self.db.flush()

            topic_map[id(topic)] = db_topic.id

            self.db.add(
                TopicSnapshot(
                    topic_id=db_topic.id,
                    snapshot_id=snapshot.id,
                )
            )

        story_map = {}

        for story in result.clusters.values():

            db_story = StoryDB(

                snapshot_id=snapshot.id,

                title=story.representative.title,

                summary=story.representative.summary,

                keywords=story.representative.keywords,

                category=story.representative.category,

                editorial_score=story.score,

                topic_count=len(story.topics),
            )

            self.db.add(db_story)

            self.db.flush()

            story_map[story.cluster_id] = db_story.id

        # for story, opportunity in zip(
        #     result.clusters.values(),
        #     result.opportunities,
        # ):
            
        #     story_id = story_map.get(story.cluster_id)
        #     if story_id is None:
        #         continue

        #     db_opportunity = OpportunityDB(

        #         story_id=story_map[story.cluster_id],

        #         # headline=opportunity.headline,

        #         explanation=opportunity.explanation,

        #         # score=opportunity.score,
        #     )

        #     self.db.add(db_opportunity)
        for opportunity in result.opportunities:
            cluster_id = opportunity["cluster_id"]

            if cluster_id not in story_map:
                continue
            db_opportunity = OpportunityDB(
                story_id = story_map[cluster_id],
                headline = opportunity["title"],
                explanation={
                    "summary":opportunity.get("summary",""),
                    "strengths":opportunity.get("strengths",[]),
                    "weaknesses":opportunity.get("weaknesses",[]),
                    "recommended_formats":opportunity.get("recommended_fromats",[]),
                    "sources":opportunity.get("sources",[]),
                    "scores":opportunity.get("scores",{}),
                    "keywords":opportunity.get("keywords",[]),
                    "entities":opportunity.get("entities",[]),

                },
                score = opportunity["editorial_score"],
                )
            self.db.add(db_opportunity)

        snapshot.pipeline_time = (
            time.perf_counter() - start
        )

        self.db.commit()
        cache.update(
            snapshot_id=snapshot.id,
            result=result,
        )

        return snapshot