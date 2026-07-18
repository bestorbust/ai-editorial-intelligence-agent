from sqlalchemy import (  Column,Integer,String,Text, Float, DateTime,JSON,func)

from backend.core.database import Base

class Topic(Base):
    __tablename__="topics"

    id=Column(Integer,primary_key=True,index=True)

    title=Column(String(500),nullable=False)
    summary=Column(Text,nullable=True)

    source=Column(String(500),nullable=False)
    source_url=Column(Text,nullable=False)

    category = Column(String(100),nullable=True)
    language = Column(String(30),default="en")
    country = Column(String(50),nullable=True)

    keywords=Column(JSON,nullable=True)
    entities= Column(JSON,nullable=True)

    trend_score=Column(Float,default=0.0)
    confidence_score=Column(Float,default=0.0)


    raw_text=Column(Text,nullable=True)

    status=Column(String(50),default="discovered")

    discovered_at=Column(DateTime(timezone=True),server_default=func.now())

    updated_at=Column(DateTime(timezone=True),server_default=func.now(),onupdate=func.now())

    content_hash = Column(String(64),unique=True,nullable=False,index=True)