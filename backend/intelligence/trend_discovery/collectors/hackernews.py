import time
from concurrent.futures import ThreadPoolExecutor
import requests

from backend.core.config import HACKERNEWS_CONFIG
from backend.core.models.topic import Topic
from backend.intelligence.trend_discovery.collectors.base import BaseCollector
from backend.intelligence.trend_discovery.models import CollectorResult

TOP_STORIES_URL = "https://hacker-news.firebaseio.com/v0/topstories.json"
ITEM_URL = "https://hacker-news.firebaseio.com/v0/item/{}.json"


class HackerNewsCollector(BaseCollector):

    def __init__(self):
        self.session = requests.Session()

    @property
    def source_name(self) -> str:
        return "Hacker News"

    def _fetch_story(self, story_id: int):
        """Fetch a single Hacker News story."""
        try:
            response = self.session.get(
                ITEM_URL.format(story_id),
                timeout=5,
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException:
            return None

    def collect(self) -> CollectorResult:
        start = time.perf_counter()
        topics = []

        try:
            response = self.session.get(
                TOP_STORIES_URL,
                timeout=5,
            )
            response.raise_for_status()
            ids = response.json()[: HACKERNEWS_CONFIG["limit"]]

        except requests.RequestException:
            return CollectorResult(
                source=self.source_name,
                topics=[],
                collected=0,
                duration=round(time.perf_counter() - start, 2),
            )

        max_workers = min(10, len(ids))

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            stories = executor.map(self._fetch_story, ids)

            for story in stories:
                if not story:
                    continue

                topic = Topic(
                    title=story.get("title", ""),
                    summary="",
                    source="Hacker News",
                    source_url=story.get(
                        "url",
                        f"https://news.ycombinator.com/item?id={story.get('id')}",
                    ),
                    raw_text=story.get("title", ""),
                )

                topics.append(topic)

        duration = round(time.perf_counter() - start, 2)

        return CollectorResult(
            source=self.source_name,
            topics=topics,
            collected=len(topics),
            duration=duration,
        )