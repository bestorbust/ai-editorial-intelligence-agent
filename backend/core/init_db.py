""" importing all ORM models and creating db tables"""
from .database import Base,engine
from .models.topic import Topic
from .models.opportunity import Opportunity
from .models.snapshot import Snapshot
from .models.story import Story
from .models.topic_snapshot import TopicSnapshot


def init_db()->None:
    Base.metadata.create_all(bind=engine)
    print("Database Initialized Successfully.")