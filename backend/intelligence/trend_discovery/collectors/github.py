import os,time
from github import Github
from backend.core.models.topic import Topic
from .base import BaseCollector
from backend.intelligence.trend_discovery.models import CollectorResult
from backend.core.config import GITHUB_CONFIG

class GitHubCollector(BaseCollector):
    def __init__(self):
        token=os.getenv("GITHUB_TOKEN")

        self.github = Github(token)

    @property
    def source_name(self):
        return "GitHub"
    
    def collect(self):
        start = time.perf_counter()

        repositories = self.github.search_repositories(
            query="stars:>100",
            sort=GITHUB_CONFIG["sort"],
            order="desc",
        )
        topics=[]

        

        for repo in repositories[:GITHUB_CONFIG["limit"]]:
            topic = Topic(
                    title=repo.full_name,
                    summary=repo.description,
                    source="GitHub",
                    source_url=repo.html_url,
                    raw_text=repo.description,
                )

            topics.append(topic)
        duration=round(time.perf_counter()-start,2)

        return CollectorResult(
            self.source_name,
            topics,
            len(topics),
            duration
        )
    