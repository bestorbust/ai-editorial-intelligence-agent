import time
import feedparser

from backend.core.models.topic import Topic
from backend.intelligence.trend_discovery.collectors.base import BaseCollector
from backend.intelligence.trend_discovery.models import CollectorResult
from backend.core.config import YOUTUBE_CHANNELS


RSS_URL = "https://www.youtube.com/feeds/videos.xml?channel_id={}"


class YouTubeCollector(BaseCollector):

    @property
    def source_name(self):
        return "YouTube"

    def collect(self):

        start = time.perf_counter()
        topics = []
        for channel_name, config in YOUTUBE_CHANNELS.items():

            feed = feedparser.parse(
                RSS_URL.format(config["channel_id"])
            )

            for entry in feed.entries[: config["limit"]]:

                topic = Topic(
                    title=entry.get("title", ""),
                    summary="",
                    source=f"YouTube/{channel_name}",
                    source_url=entry.get("link", ""),
                    raw_text=entry.get("title", ""),
                )

                topics.append(topic)

        duration = round(time.perf_counter() - start, 2)

        return CollectorResult(
            source=self.source_name,
            topics=topics,
            collected=len(topics),
            duration=duration,
        )