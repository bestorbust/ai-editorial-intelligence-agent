from pydantic import BaseModel
from backend.shared.schemas.topic import TopicData

class Story(BaseModel):
    id: int
    representative: TopicData
    topics: list[TopicData]
    score: float = 0.0
    trend_score: float = 0.0
    authority_score: float = 0.0
    recency_score: float = 0.0
    source_diversity_score: float = 0.0
    keyword_score: float = 0.0
    entity_score: float = 0.0