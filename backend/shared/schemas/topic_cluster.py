from pydantic import BaseModel,Field
from .topic import TopicData

class TopicCluster(BaseModel):
    cluster_id:int
    representative_title:str
    topics:list[TopicData]=Field(default_factory=list)
    keywords:list[str]=Field(default_factory=list)
    category:str=""
    score:float=0.0
    