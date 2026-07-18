from sqlalchemy import Column, Integer, ForeignKey

from backend.core.database import Base


class TopicSnapshot(Base):
    __tablename__ = "topic_snapshots"

    topic_id = Column(
        Integer,
        ForeignKey("topics.id"),
        primary_key=True,
    )

    snapshot_id = Column(
        Integer,
        ForeignKey("snapshots.id"),
        primary_key=True,
    )