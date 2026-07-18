import re
from backend.core.models.topic import Topic

class NormalizeProcessor:
    @staticmethod
    def process(topics:list[Topic])->list[Topic]:
        for topic in topics:
            title=topic.title.strip()
            title=re.sub(r"\s+"," ",title)
            topic.title=title

            if topic.summary:
                topic.summary=topic.summary.strip()

            if topic.raw_text:
                topic.raw_text = topic.raw_text.strip()
                
        return topics
