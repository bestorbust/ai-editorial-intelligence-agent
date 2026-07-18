from collections import Counter
from datetime import datetime, timezone

from backend.intelligence.trend_discovery.models import Story

class EditorialScoreProcessor:

    def process(self, clusters: dict[int, Story]) -> dict[int, Story]:

        for story in clusters.values():

            # -----------------------------------------
            # Calculate individual scores
            # -----------------------------------------

            story.trend_score = self.trend_score(story)

            story.authority_score = self.authority_score(story)

            story.recency_score = self.recency_score(story)

            story.source_diversity_score = self.source_diversity_score(
                story
            )

            story.keyword_score = self.keyword_strength(story)

            story.entity_score = self.entity_strength(story)

            # -----------------------------------------
            # Calculate final editorial score
            # -----------------------------------------

            story.score = round(
                (
                    story.trend_score * 0.30
                    + story.authority_score * 0.15
                    + story.recency_score * 0.15
                    + story.source_diversity_score * 0.20
                    + story.keyword_score * 0.10
                    + story.entity_score * 0.10
                ),
                2,
            )

        return clusters

    # =================================================
    # Trend Score
    # =================================================

    def trend_score(self, story: Story) -> float:

        n = len(story.topics)

        return min(100, n * 10)

    # =================================================
    # Authority Score
    # =================================================

    def authority_score(self, story: Story) -> float:

        weights = {
            "OpenAI": 100,
            "Google AI": 95,
            "GitHub": 90,
            "Hacker News": 80,
            "GNews": 80,
            "YouTube": 70,
            "RSS": 70,
        }

        scores = []

        for topic in story.topics:

            source = topic.source.split("/")[0]

            scores.append(
                weights.get(source, 60)
            )

        if not scores:
            return 0.0

        return sum(scores) / len(scores)

    # =================================================
    # Recency Score
    # =================================================

    def recency_score(self, story: Story) -> float:

        now = datetime.now(timezone.utc)

        scores = []

        for topic in story.topics:

            discovered_at = getattr(
                topic,
                "discovered_at",
                None,
            )

            # If timestamp is unavailable,
            # use neutral fallback instead of treating
            # the article as brand new.
            if discovered_at is None:
                scores.append(80.0)
                continue

            # Handle timezone-naive datetime
            if discovered_at.tzinfo is None:
                discovered_at = discovered_at.replace(
                    tzinfo=timezone.utc
                )

            age_hours = (
                now - discovered_at
            ).total_seconds() / 3600

            # Future timestamps should not produce >100
            age_hours = max(0, age_hours)

            score = max(
                0,
                100 - age_hours,
            )

            scores.append(score)

        if not scores:
            return 0.0

        return sum(scores) / len(scores)

    # =================================================
    # Source Diversity Score
    # =================================================

    def source_diversity_score(
        self,
        story: Story,
    ) -> float:

        sources = {
            topic.source.split("/")[0]
            for topic in story.topics
        }

        return min(
            len(sources) * 20,
            100,
        )

    # =================================================
    # Keyword Strength
    # =================================================

    def keyword_strength(
        self,
        story: Story,
    ) -> float:

        counter = Counter()

        for topic in story.topics:

            counter.update(
                topic.keywords or []
            )

        if not counter:
            return 0.0

        return min(
            len(counter) * 8,
            100,
        )

    # =================================================
    # Entity Strength
    # =================================================

    def entity_strength(
        self,
        story: Story,
    ) -> float:

        counter = Counter()

        for topic in story.topics:

            counter.update(
                topic.entities or []
            )

        if not counter:
            return 0.0

        return min(
            len(counter) * 10,
            100,
        )