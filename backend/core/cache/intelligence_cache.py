from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from threading import RLock
from typing import Any


@dataclass
class DashboardCache:

    snapshot_id: int | None = None

    last_updated: datetime | None = None

    raw_articles: int = 0

    semantic_unique: int = 0

    stories: int = 0

    opportunities: int = 0

    topics: list[Any] = field(default_factory=list)

    clusters: dict[int, Any] = field(default_factory=dict)

    opportunities_data: list[Any] = field(default_factory=list)

    refreshing: bool = False


class IntelligenceCache:

    def __init__(self):

        self._lock = RLock()

        self._cache = DashboardCache()

    def get(self) -> DashboardCache:
        return self._cache

    def start_refresh(self):

        with self._lock:
            self._cache.refreshing = True

    def update(
        self,
        snapshot_id,
        result,
    ):

        with self._lock:

            self._cache.snapshot_id = snapshot_id

            self._cache.last_updated = datetime.utcnow()

            self._cache.raw_articles = result.raw_collected

            self._cache.semantic_unique = result.semantic_unique

            self._cache.stories = len(result.clusters)

            self._cache.opportunities = len(result.opportunities)

            self._cache.topics = result.topics

            self._cache.clusters = result.clusters

            self._cache.opportunities_data = result.opportunities

            self._cache.refreshing = False

    def fail(self):

        with self._lock:

            self._cache.refreshing = False


cache = IntelligenceCache()