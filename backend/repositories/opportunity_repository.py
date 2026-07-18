from sqlalchemy.orm import Session

from backend.core.models.opportunity import Opportunity


class OpportunityRepository:

    def __init__(self, db: Session):
        self.db = db

    def create(self, opportunity: Opportunity):

        self.db.add(opportunity)
        self.db.flush()

        return opportunity