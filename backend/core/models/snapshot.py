from sqlalchemy import Column, Integer, Float, DateTime, func

from backend.core.database import Base


class Snapshot(Base):
    __tablename__ = "snapshots"

    id = Column(Integer, primary_key=True)

    raw_collected = Column(Integer, nullable=False)

    semantic_unique = Column(Integer, nullable=False)

    stories = Column(Integer, nullable=False)

    opportunities = Column(Integer, nullable=False)

    pipeline_time = Column(Float, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )