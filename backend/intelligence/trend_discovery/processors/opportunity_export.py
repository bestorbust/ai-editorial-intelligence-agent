from datetime import datetime, timezone

from backend.intelligence.trend_discovery.models import Story


class OpportunityExportProcessor:

    def process(
        self,
        clusters: dict[int, Story],
    ) -> list[dict]:

        opportunities = []

        # =================================================
        # Sort Stories by Editorial Score
        # =================================================

        stories = sorted(
            clusters.values(),
            key=lambda story: story.score,
            reverse=True,
        )

        # =================================================
        # Export Opportunities
        # =================================================

        for rank, story in enumerate(
            stories,
            start=1,
        ):

            representative = story.representative

            # Safety check
            if representative is None:
                continue

            explanation = getattr(
                story,
                "explanation",
                {},
            ) or {}

            strengths = explanation.get(
                "strengths",
                [],
            )

            weaknesses = explanation.get(
                "weaknesses",
                [],
            )

            recommended_formats = explanation.get(
                "recommended_formats",
                [],
            )

            sources = explanation.get(
                "sources",
                {},
            )

            opportunity = {

                "rank": rank,

                "cluster_id":story.cluster_id,

                "story_idx": getattr(
                    representative,
                    "id",
                    None,
                ),

                "title": representative.title,

                "summary": representative.summary,

                "editorial_score": story.score,

                "scores": {
                    "trend": story.trend_score,
                    "authority": story.authority_score,
                    "recency": story.recency_score,
                    "source_diversity": (
                        story.source_diversity_score
                    ),
                    "keyword_strength": (
                        story.keyword_score
                    ),
                    "entity_strength": (
                        story.entity_score
                    ),
                },

                "keywords": (
                    representative.keywords or []
                ),

                "entities": (
                    representative.entities or []
                ),

                "sources": list(
                    sources.keys()
                ),

                "strengths": strengths,

                "weaknesses": weaknesses,

                "recommended_formats": (
                    recommended_formats
                ),

                "cluster_size": len(
                    story.topics
                ),

                "generated_at": (
                    datetime.now(
                        timezone.utc
                    ).isoformat()
                ),
            }

            opportunities.append(
                opportunity
            )
        print(
            f"{opportunity['title'][:40]} -> cluster_size = {opportunity['cluster_size']}"
        )

        return opportunities