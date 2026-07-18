"""Runs all Collector and merges"""
import time

from typing import List
from backend.core.models.topic import Topic
from .collectors.base import BaseCollector
from .models import TrendDiscoveryResult
from .processors.merge import MergeProcessor
from .processors.normalize import NormalizeProcessor
from .processors.deduplication import DeduplicateProcessor
# from .processors.topic_clustering import TopicClusteringProcessor
from .processors.keyword_extractor import KeywordExtractor
from .processors.entity_extractor import EntityExtractor
from .processors.story_cluster import StoryClusterProcessor
from .processors.story_representative import StoryRepresentativeProcessor
from .processors.editorial_score import EditorialScoreProcessor
from .processors.opportunity_explainer import OpportunityExplainerProcessor
from .processors.opportunity_export import OpportunityExportProcessor
from concurrent.futures import ThreadPoolExecutor, as_completed
class CollectorEngine:

    def __init__(self):
        print("CollectorEngine initalized")
        self.collectors:List[BaseCollector]=[]
        self.deduplicator = DeduplicateProcessor()
        self.keyword_extractor=KeywordExtractor()
        self.entity_extractor=EntityExtractor()
        self.story_cluster=StoryClusterProcessor()
        self.story_representative=StoryRepresentativeProcessor()
        self.editorial_score= EditorialScoreProcessor()
        self.opportunity_explainer=OpportunityExplainerProcessor()
        self.opportunity_export=OpportunityExportProcessor()

    def register(self,collector:BaseCollector)->None:

        self.collectors.append(collector)

    def _collect_single(self,collector:BaseCollector):
        start=time.perf_counter()
        result=collector.collect()
        elapsed = time.perf_counter()-start
        return result,elapsed


    def collect(self) -> TrendDiscoveryResult:
        results = []

        print("\n========== COLLECTION ==========\n")

        # ---------------- Collectors ---------------- #

        with ThreadPoolExecutor(max_workers=len(self.collectors)) as executor:
            future_map ={
                executor.submit(self._collect_single,collector):collector
                for collector in self.collectors
            }
            for future in as_completed(future_map):
                collector = future_map[future]
                try:
                    result,elapsed = future.result()

                    print(
                        f"✓ {result.source}: "
                        f"{result.collected} topics "
                        f"({elapsed:.2f}s)"
                    )

                    results.append(result)

                except Exception as e:
                    print(
                        f"✗ {collector.source_name} failed: {e}"
                            )

        # for collector in self.collectors:
        #     print(f"Collecting from {collector.source_name}...")

        #     start = time.perf_counter()

        #     result = collector.collect()

        #     elapsed = time.perf_counter() - start

        #     print(
        #         f"✓ {result.source}: "
        #         f"{result.collected} topics "
        #         f"({elapsed:.2f}s)"
        #     )

        #     results.append(result)

        raw_count = sum(result.collected for result in results)

        print(f"\nTotal Raw Topics: {raw_count}")

    # ---------------- Pipeline ---------------- #

        def run_stage(name, func, *args):
            print(f"\n[{name}]")
            start = time.perf_counter()

            output = func(*args)

            elapsed = time.perf_counter() - start

            print(f"✓ {name} completed in {elapsed:.2f}s")

            return output

        merged_topics = run_stage(
            "MergeProcessor",
            MergeProcessor.process,
            *[result.topics for result in results]
        )

        print(f"Topics after merge: {len(merged_topics)}")

        merged_topics = run_stage(
            "NormalizeProcessor",
            NormalizeProcessor.process,
            merged_topics
        )

        print(f"Topics after normalize: {len(merged_topics)}")

        merged_topics = run_stage(
            "DeduplicateProcessor",
            self.deduplicator.process,
            merged_topics
        )

        print(f"Semantic unique topics: {len(merged_topics)}")

        merged_topics = run_stage(
            "KeywordExtractor",
            self.keyword_extractor.process,
            merged_topics
        )

        merged_topics = run_stage(
            "EntityExtractor",
            self.entity_extractor.process,
            merged_topics
        )

        clusters = run_stage(
            "StoryClusterProcessor",
            self.story_cluster.process,
            merged_topics
        )

        print(f"Clusters: {len(clusters)}")

        clusters = run_stage(
            "StoryRepresentativeProcessor",
            self.story_representative.process,
            clusters
        )

        clusters = run_stage(
            "EditorialScoreProcessor",
            self.editorial_score.process,
            clusters
        )

        clusters = run_stage(
            "OpportunityExplainerProcessor",
            self.opportunity_explainer.process,
            clusters
        )

        opportunities = run_stage(
            "OpportunityExportProcessor",
            self.opportunity_export.process,
            clusters
        )

        print(f"Exported Opportunities: {len(opportunities)}")

        print("\n========== PIPELINE COMPLETE ==========\n")

        return TrendDiscoveryResult(
            raw_collected=raw_count,
            semantic_unique=len(merged_topics),
            topics=merged_topics,
            clusters=clusters,
            opportunities=opportunities
        )
