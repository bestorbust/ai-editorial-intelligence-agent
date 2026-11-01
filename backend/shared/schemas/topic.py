from pydantic import BaseModel,Field
from typing import List, Optional

class TopicData(BaseModel):
    title:str
    summary:str=""
    source:str
    source_url:str
    raw_text:str=""
    category:Optional[str]=None
    keywords:List[str]=Field(default_factory=list)
    entities:List[str]=Field(default_factory=list)
    trend_score:float=0.0
    confidence_score:float=0.0