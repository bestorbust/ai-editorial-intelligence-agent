import sys
import traceback

from backend.core.database import SessionLocal
from backend.services.intelligence_service import IntelligenceService

def main():
    print("\n===============================================")
    print(" AI EDITORIAL INTELLIGENCE REFRESH")
    print("===============================================")

    db= SessionLocal()

    try:
        print("Starting intelligence pipeline..\n")
        service = IntelligenceService()
        snapshot = service.discover(db)

        print("\n===============================================")
        print(" REFRESH COMPLETED SUCCESSFULLY")
        print("===============================================")

        print(f"Snapshot ID: {snapshot.id}")

        if hasattr(snapshot,"raw_collected"):
            print(f"Raw collected: {snapshot.raw_collected}")
        
        if hasattr(snapshot,"semantic_unique"):
            print(f"Semantic unique:{ snapshot.semantic_unique}")

        if hasattr(snapshot,"stories"):
            print(f"Stories: {snapshot.stories}")

        if hasattr(snapshot,"opportunities"):
            print(f"Opportunities: {snapshot.opportunities}")

    except Exception as exc:
        print("\n===============================================")
        print(" Intelligence Refresh Failed")
        print("===============================================")
        print(f"Error:{exc}")

        traceback.print_exc()
        db.rollback()
        sys.exit(1)

    finally:
        db.close()

if __name__=="__main__":
    main()
