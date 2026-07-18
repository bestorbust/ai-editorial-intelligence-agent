from sentence_transformers.util import cos_sim
from backend.shared.models import EMBEDDING_MODEL


class StoryRepresentativeProcessor:
    def __init__(self):
        self.model = EMBEDDING_MODEL

    def _build_text(self, topic) -> str:
        return (
            topic.title + " "
            + topic.summary + " "
            + " ".join(topic.keywords) + " "
            + " ".join(topic.entities)
        )

    def process(self, clusters):

       
        multi_topic_keys = []
        all_texts = []
        slices = {}  

        for key, story in clusters.items():
            topics = story.topics

            if len(topics) == 1:
                story.representative = topics[0]
                continue

            start = len(all_texts)

            for topic in topics:
                all_texts.append(self._build_text(topic))

            slices[key] = (start, len(all_texts))
            multi_topic_keys.append(key)

        if not multi_topic_keys:
            return clusters

        embeddings = self.model.encode(
            all_texts,
            normalize_embeddings=True,
            show_progress_bar=True,
        )

        for key in multi_topic_keys:
            start, end = slices[key]
            cluster_embeddings = embeddings[start:end]

            similarity = cos_sim(cluster_embeddings, cluster_embeddings)
            scores = similarity.mean(dim=1)
            best = scores.argmax().item()

            clusters[key].representative = clusters[key].topics[best]

        return clusters