from sqlalchemy.orm import Session

from backend.core.models.story import Story


class StoryRepository:

    def __init__(self, db: Session):
        self.db = db

    def create(self, story: Story):

        self.db.add(story)
        self.db.flush()

        return story