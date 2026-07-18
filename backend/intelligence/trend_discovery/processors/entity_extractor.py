from backend.shared.schemas.topic import TopicData
from gliner import GLiNER
import torch


class EntityExtractor:

    def __init__(self, batch_size: int = 32):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        self.model = GLiNER.from_pretrained(
            "urchade/gliner_medium-v2.1"
        ).to(self.device)

        # Ensure the model is in inference mode (disables dropout etc.)
        # This costs nothing and is correct regardless of how the
        # weights were loaded.
        self.model.eval()

        self.labels = [
            "Company",
            "Person",
            "Technology",
            "Programming Language",
            "Framework",
            "Library",
            "Research Paper",
            "Product",
            "Organization",
        ]

        self.batch_size = batch_size

    def process(
        self,
        topics: list[TopicData],
    ) -> list[TopicData]:

        texts = [
            f"{topic.title}. {topic.summary or ''}"
            for topic in topics
        ]

        # torch.inference_mode() skips autograd bookkeeping (no gradients
        # are needed here since we're only running forward passes). This
        # is a small but free win on both CPU and GPU.
        with torch.inference_mode():
            if hasattr(self.model, "run"):
                predictions = self.model.run(
                    texts,
                    self.labels,
                    threshold=0.5,
                    batch_size=self.batch_size,
                )
            else:
                predictions = self.model.batch_predict_entities(
                    texts,
                    labels=self.labels,
                )

        for topic, entities in zip(topics, predictions):

            topic.entities = sorted(
                {
                    entity["text"]
                    for entity in entities
                }
            )

        return topics