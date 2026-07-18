from sqlalchemy.orm import Session

from backend.core.models.topic_snapshot import TopicSnapshot


class TopicSnapshotRepository:

    def __init__(self, db: Session):
        self.db = db

    def create(self, topic_id: int, snapshot_id: int):

        relation = TopicSnapshot(
            topic_id=topic_id,
            snapshot_id=snapshot_id,
        )

        self.db.add(relation)

        return relation