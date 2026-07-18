from typing import List
from backend.core.models.topic import Topic

class MergeProcessor:
    @staticmethod
    def process(*topic_list:List[Topic])->List[Topic]:
        merged:List[Topic]=[]

        for topics in topic_list:
            merged.extend(topics)

        return merged