from collections import defaultdict
from sklearn.cluster import AgglomerativeClustering
from backend.core.models.topic import Topic
from sentence_transformers import SentenceTransformer

class TopicClusteringProcessor:
    def __init__(self,distance_threshold:float=0.35,):
        self.model=SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        self.cluster_model = AgglomerativeClustering(
            n_clusters=None,
            metric="cosine",
            linkage="average",
            distance_threshold=distance_threshold,
        )
    def process(self,topics:list[Topic],)->dict[int,list[Topic]]:
        if len(topics)<=1:
            return {0:topics}
        
        texts = [f"{topic.title}. {topic.summary or ''}" for topic in topics]
        
        embeddings = self.model.encode(texts,normalize_embeddings=True,show_progress_bar=True)

        labels=self.cluster_model.fit_predict(embeddings)

        clusters=defaultdict(list)

        for label,topic in zip(labels,topics):
            clusters[int(label)].append(topic)

        return dict(clusters)

