from typing import List
import time
import feedparser
from concurrent.futures import ThreadPoolExecutor, as_completed

from backend.core.models.topic import Topic
from .base import BaseCollector
from backend.core.config import RSS_FEEDS
from backend.intelligence.trend_discovery.models import CollectorResult


class RSSCollector(BaseCollector):

    # feedparser.parse() blocks on a network request per feed. Fetching
    # feeds sequentially (the previous behavior) meant total time was the
    # SUM of every feed's latency — a single slow/unresponsive feed could
    # stall the whole collector. Since this is I/O-bound, threads give a
    # real speedup (the GIL is released while waiting on the network).
    MAX_WORKERS = 16

    @property
    def source_name(self):
        return "RSS"

    def _fetch_feed(self, source_name: str, config: dict) -> list[Topic]:
        feed = feedparser.parse(config["url"])

        topics = []

        for entry in feed.entries[:config["limit"]]:
            topics.append(
                Topic(
                    title=entry.get("title", ""),
                    summary=entry.get("summary", ""),
                    source=source_name,
                    source_url=entry.get("link", ""),
                    raw_text=entry.get("summary", ""),
                )
            )

        return topics

    def collect(self) -> List[Topic]:
        start = time.perf_counter()
        topics: list[Topic] = []

        with ThreadPoolExecutor(
            max_workers=min(self.MAX_WORKERS, len(RSS_FEEDS)) or 1
        ) as executor:

            future_map = {
                executor.submit(self._fetch_feed, source_name, config): source_name
                for source_name, config in RSS_FEEDS.items()
            }

            for future in as_completed(future_map):
                source_name = future_map[future]

                try:
                    topics.extend(future.result())
                except Exception as e:
                    # One bad/slow feed shouldn't take down the whole
                    # collector — skip it and keep the rest.
                    print(f"✗ RSS feed '{source_name}' failed: {e}")

        duration = round(time.perf_counter() - start, 2)

        return CollectorResult(
            self.source_name,
            topics,
            len(topics),
            duration,
        )