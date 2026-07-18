import time
import requests

from .base import BaseCollector
from backend.core.models.topic import Topic
from backend.intelligence.trend_discovery.models import CollectorResult
from backend.core.config import GNEWS_CONFIG


class GoogleNewsCollector(BaseCollector):

    def __init__(self):
        self.session = requests.Session()

    @property
    def source_name(self):
        return "GNews"

    def collect(self):

        start = time.perf_counter()

        topics = []

        try:

            response = self.session.get(
                GNEWS_CONFIG["base_url"],
                params={
                    "apikey": GNEWS_CONFIG["api_key"],
                    "country": GNEWS_CONFIG["country"],
                    "lang": GNEWS_CONFIG["language"],
                    "category": GNEWS_CONFIG["category"],
                    "max": GNEWS_CONFIG["max_results"],
                },
                timeout=GNEWS_CONFIG["timeout"],
            )

            response.raise_for_status()

            data = response.json()

        except Exception as e:

            print(f"[GNews] {e}")

            return CollectorResult(
                source=self.source_name,
                topics=[],
                collected=0,
                duration=round(time.perf_counter() - start, 2),
            )

        seen = set()

        for article in data.get("articles", []):

            url = article.get("url", "")

            if not url:
                continue

            if url in seen:
                continue

            seen.add(url)

            title = article.get("title", "")

            description = article.get("description", "")

            content = article.get("content", "")

            source = article.get("source", {}).get("name", "GNews")

            topic = Topic(

                title=title,

                summary=description,

                source=source,

                source_url=url,

                raw_text=f"""
{title}

{description}

{content}
""",

            )

            topics.append(topic)

        duration = round(time.perf_counter() - start, 2)

        return CollectorResult(
            source=self.source_name,
            topics=topics,
            collected=len(topics),
            duration=duration,
        )