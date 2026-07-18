from pydantic import BaseModel

class Opportunity(BaseModel):
    title:str
    score:float
    reason:str
    confidence:float
    cluster_id:int