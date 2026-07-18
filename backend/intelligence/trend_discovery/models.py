from dataclasses import dataclass, field
from typing import List

from backend.core.models.topic import Topic

@dataclass
class CollectorResult:
    """Results from every collector"""
    source:str
    topics:List[Topic]= field(default_factory=list)
    collected:int=0
    semantic_unique:int=0
    failed:int=0
    duration:float=0.0
    success:bool=True
    error:str|None=None

@dataclass
class ClusterResult:
    cluster_id:int
    topics:list[Topic]=field(default_factory=list)

@dataclass
class TopicCluster:
    cluster_id:int
    topics:list[Topic]=field(default_factory=list)
    centroid_title:str=""
    keywords:list[str]=field(default_factory=list)
    category:str=""
    score:float=0.0

@dataclass
class TrendDiscoveryResult:
    raw_collected:int
    semantic_unique:int
    inserted:int=0
    topics:list[Topic]=field(default_factory=list)
    clusters:dict=field(default_factory=dict)
    opportunities:list=field(default_factory=list)

@dataclass
class Story:
    cluster_id: int

    topics: list[Topic] = field(default_factory=list)

    probabilities: list[float] = field(
        default_factory=list
    )

    representative: Topic | None = None

    title: str = ""
    summary: str = ""

    keywords: list[str] = field(
        default_factory=list
    )

    category: str = ""

    score: float = 0.0
    trend_score: float = 0.0
    authority_score: float = 0.0
    recency_score: float = 0.0
    source_diversity_score: float = 0.0
    keyword_score: float = 0.0
    entity_score: float = 0.0

    explanation: dict = field(
        default_factory=dict
    )

    opportunity: str = ""