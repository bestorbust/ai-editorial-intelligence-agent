from bertopic import BERTopic
from hdbscan import HDBSCAN
from umap import UMAP
from sklearn.feature_extraction.text import CountVectorizer
import os

os.makedirs("artifacts", exist_ok=True)

from backend.shared.models import EMBEDDING_MODEL
from backend.shared.schemas.topic import TopicData
from backend.intelligence.trend_discovery.models import Story


class StoryClusterProcessor:
    def __init__(self):
        self.umap_model = UMAP(
            n_neighbors=8,
            n_components=5,
            min_dist=0.0,
            metric="cosine",
            random_state=42,
        )
        self.hdbscan_model = HDBSCAN(
            min_cluster_size=3,
            min_samples=1,
            metric="euclidean",
            prediction_data=True,
        )
        self.vectorizer = CountVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
        )
        self.topic_model = BERTopic(
            embedding_model=EMBEDDING_MODEL,
            umap_model=self.umap_model,
            hdbscan_model=self.hdbscan_model,
            vectorizer_model=self.vectorizer,
            calculate_probabilities=True,
            verbose=False,
        )

    def process(self,topics:list[TopicData]):
        documents=[]
        for topic in topics:
            document = f"""
                Title:
                {topic.title}
                Summary:
                {topic.summary}
                Keywords:
                {' | '.join(topic.keywords)}
                Entities:
                {' | '.join(topic.entities)}
                Source:
                {topic.source}
                """

            documents.append(document)
        labels,probabilities = self.topic_model.fit_transform(documents)

        clusters={}

        for label,probability, topic in zip(labels,probabilities,topics):
            if label == -1:
                continue
            
            if label not in clusters:
                clusters[label]=Story(cluster_id=label)
                

            story = clusters[label]
            story.topics.append(topic)
            story.probabilities.append(float(probability.max()))

        
        self.topic_model.save("artifacts/story_cluster_model")
        topic_info = self.topic_model.get_topic_info()

        for _, row in topic_info.iterrows():

            if row.Topic == -1:
                continue

            print(
                f"\nStory {row.Topic}"
            )

            print(
                f"Name : {row.Name}"
            )

            print(
                f"Documents : {row.Count}"
            )

        return clusters