from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    ForeignKey,
    JSON,
)

from backend.core.database import Base


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True)

    story_id = Column(
        Integer,
        ForeignKey("stories.id"),
        nullable=False,
    )

    headline = Column(String(500))

    explanation = Column(JSON)

    score = Column(Float)