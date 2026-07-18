from sqlalchemy.orm import Session

from backend.core.models.snapshot import Snapshot


class SnapshotRepository:

    def __init__(self, db: Session):
        self.db = db

    def create(self, snapshot: Snapshot):

        self.db.add(snapshot)
        self.db.flush()

        return snapshot

    def latest(self):

        return (
            self.db.query(Snapshot)
            .order_by(Snapshot.id.desc())
            .first()
        )