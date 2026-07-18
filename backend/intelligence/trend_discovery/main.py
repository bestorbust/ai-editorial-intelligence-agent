from backend.core.database import SessionLocal
from backend.core.init_db import init_db

from .collector_engine import CollectorEngine
from .storage import TopicStorage
from .collectors.rss import RSSCollector
from .collectors.google_news import GoogleNewsCollector
from .collectors.github import GitHubCollector
from .collectors.hackernews import HackerNewsCollector
from .collectors.youtube import YouTubeCollector



def main():
    init_db()
    db=SessionLocal()

    engine= CollectorEngine()


    engine.register(RSSCollector())
    engine.register(GoogleNewsCollector())
    engine.register(GitHubCollector())
    engine.register(HackerNewsCollector())
    engine.register(YouTubeCollector())


    result=engine.collect()
    topics=result.topics
    storage=TopicStorage(db)
    inserted=storage.save_topics(topics)

    print("="*60)
    print("Trend Discovery Agent")
    print("="*60)

    print("-"*60)
    print(f"Raw Collected      : {result.raw_collected}")
    print(f"Semantic Unique    : {result.semantic_unique}")
    print(f"Inserted           : {inserted}")
    print(f"DB Duplicates      : {result.semantic_unique - inserted}")

    opportunities = result.opportunities
    for opportunity in opportunities:
        print("=" * 80)
        print(
            f'#{opportunity["rank"]} {opportunity["title"]}'
        )
        print(
            f'Score : {opportunity["editorial_score"]}'
        )
        print(
            f'Sources : {", ".join(opportunity["sources"])}'
        )
        print(
            f'Cluster : {opportunity["cluster_size"]}'
        )
        print()
        print("Strengths")
        for s in opportunity["strengths"]:
            print(f"✓ {s}")
        print()
        print("Recommended")
        for s in opportunity["recommended_formats"]:
            print(f"→ {s}")
    db.close()

if __name__=="__main__":
    main()

