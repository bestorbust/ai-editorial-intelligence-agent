from backend.intelligence.trend_discovery.collector_engine import CollectorEngine

from backend.intelligence.trend_discovery.collectors.rss import RSSCollector
from backend.intelligence.trend_discovery.collectors.google_news import GoogleNewsCollector
from backend.intelligence.trend_discovery.collectors.github import GitHubCollector
from backend.intelligence.trend_discovery.collectors.hackernews import HackerNewsCollector
from backend.intelligence.trend_discovery.collectors.youtube import YouTubeCollector
from .snapshot_service import SnapshotService


class IntelligenceService:
    def __init__(self):
        self.engine = CollectorEngine()

        self.engine.register(RSSCollector())
        self.engine.register(GoogleNewsCollector())
        self.engine.register(GitHubCollector())
        self.engine.register(HackerNewsCollector())
        self.engine.register(YouTubeCollector())

    def discover(self, db):
        result = self.engine.collect()
        snapshot = SnapshotService(db).save(result)
        return snapshot
