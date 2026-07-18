from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    JSON,
    ForeignKey,
)

from backend.core.database import Base


class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True)

    snapshot_id = Column(
        Integer,
        ForeignKey("snapshots.id"),
        nullable=False,
    )

    title = Column(String(500))

    summary = Column(Text)

    keywords = Column(JSON)

    category = Column(String(100))

    editorial_score = Column(Float)

    topic_count = Column(Integer)