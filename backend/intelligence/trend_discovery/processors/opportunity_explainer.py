from collections import Counter

from backend.intelligence.trend_discovery.models import Story


class OpportunityExplainerProcessor:

    def process(
        self,
        clusters: dict[int, Story],
    ) -> dict[int, Story]:

        for story in clusters.values():

            explanation = {
                "strengths": [],
                "weaknesses": [],
                "recommended_formats": [],
                "sources": {},
            }

            # =================================================
            # Trend Strength
            # =================================================

            if story.trend_score >= 80:

                explanation["strengths"].append(
                    "Large story cluster with multiple related articles."
                )

            elif story.trend_score <= 30:

                explanation["weaknesses"].append(
                    "Very few related articles found."
                )

            # =================================================
            # Source Diversity
            # =================================================

            if story.source_diversity_score >= 60:

                explanation["strengths"].append(
                    "Validated across multiple independent sources."
                )

            else:

                explanation["weaknesses"].append(
                    "Limited source diversity."
                )

            # =================================================
            # Authority
            # =================================================

            if story.authority_score >= 85:

                explanation["strengths"].append(
                    "Information comes from highly trusted sources."
                )

            elif story.authority_score < 60:

                explanation["weaknesses"].append(
                    "Story relies on lower-authority sources."
                )

            # =================================================
            # Keyword Strength
            # =================================================

            if story.keyword_score >= 80:

                explanation["strengths"].append(
                    "Contains strong searchable keywords."
                )

            elif story.keyword_score < 40:

                explanation["weaknesses"].append(
                    "Limited keyword strength may reduce discoverability."
                )

            # =================================================
            # Entity Strength
            # =================================================

            if story.entity_score >= 80:

                explanation["strengths"].append(
                    "Rich named entities improve discoverability."
                )

            elif story.entity_score < 40:

                explanation["weaknesses"].append(
                    "Few identifiable entities were detected."
                )

            # =================================================
            # Recommended Content Formats
            # =================================================

            if story.trend_score >= 70:

                explanation["recommended_formats"].append(
                    "Blog"
                )

            if story.entity_score >= 70:

                explanation["recommended_formats"].append(
                    "LinkedIn Post"
                )

            if story.source_diversity_score >= 60:

                explanation["recommended_formats"].append(
                    "Newsletter"
                )

            if story.keyword_score >= 80:

                explanation["recommended_formats"].append(
                    "Youtube Script"
                )

            # =================================================
            # Source Distribution
            # =================================================

            sources = Counter()

            for topic in story.topics:

                sources.update(
                    [topic.source]
                )

            explanation["sources"] = dict(sources)

            # =================================================
            # Attach Explanation
            # =================================================

            story.explanation = explanation

        return clusters