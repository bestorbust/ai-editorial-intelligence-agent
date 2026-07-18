from sqlalchemy.orm import Session
from backend.core.models.topic import Topic

class TopicStorage:

    def __init__(self,db:Session):
        self.db=db

    def save_topics(self,topics:list[Topic])->list:

        count=0


        existing_urls={
            url for (url,) in self.db.query(Topic.source_url).all()
        }

        for topic in topics:
            if topic.source_url in existing_urls:
                continue

            self.db.add(topic)
            count+=1
        self.db.commit()
        

        return count