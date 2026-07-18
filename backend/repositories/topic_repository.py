from sqlalchemy.orm import Session

from backend.core.models.topic import Topic


class TopicRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_by_hash(self, content_hash: str):

        return (
            self.db.query(Topic)
            .filter(Topic.content_hash == content_hash)
            .first()
        )

    def create(self, topic: Topic):

        self.db.add(topic)
        self.db.flush()

        return topic