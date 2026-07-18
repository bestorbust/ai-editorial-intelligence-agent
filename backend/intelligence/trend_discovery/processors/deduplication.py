import re
import torch
from sentence_transformers import SentenceTransformer
from sentence_transformers.util import cos_sim

from backend.core.models.topic import Topic
from backend.shared.models import EMBEDDING_MODEL
from backend.shared.schemas.model_manager import ModelManager


class DeduplicateProcessor:
    def __init__(self):
        self.model = EMBEDDING_MODEL
        self.threshold = 0.85

    def _normalize(self, text: str) -> str:
        """Normalize text before semantic comparison."""
        text = text.lower()

        # Remove URLs
        text = re.sub(r"http\S+", "", text)

        # Remove punctuation
        text = re.sub(r"[^\w\s]", " ", text)

        # Collapse multiple spaces
        text = re.sub(r"\s+", " ", text)

        return text.strip()

    def process(self, topics: list[Topic]) -> list[Topic]:

        if not topics:
            return []

        # ---------------------------------------------------
        # Stage 1: Remove exact duplicates
        # ---------------------------------------------------

        filtered_topics = []
        seen_titles = set()

        for topic in topics:

            normalized_title = self._normalize(topic.title)

            if normalized_title in seen_titles:
                continue

            seen_titles.add(normalized_title)
            filtered_topics.append(topic)

        if not filtered_topics:
            return []

        # ---------------------------------------------------
        # Stage 2: Semantic embeddings
        # ---------------------------------------------------

        texts = [
            self._normalize(
                f"{topic.title} {topic.summary or ''}"
            )
            for topic in filtered_topics
        ]

        embeddings = self.model.encode(
            texts,
            convert_to_tensor=True,
            show_progress_bar=True,
        )

        # Previously: cos_sim() was called once per topic against a
        # growing `unique_embeddings` tensor, and every accepted topic
        # triggered a torch.cat() that reallocates and copies the whole
        # tensor. That's N separate matmuls plus up to N tensor
        # reallocations.
        #
        # Fix: compute the full pairwise similarity matrix in a single
        # matmul up front, then the greedy dedup loop just does cheap
        # index lookups into that matrix instead of new tensor ops.
        similarity_matrix = cos_sim(embeddings, embeddings)

        unique_indices: list[int] = []

        for idx in range(len(filtered_topics)):

            if not unique_indices:
                unique_indices.append(idx)
                continue

            max_similarity = similarity_matrix[idx, unique_indices].max().item()

            if max_similarity < self.threshold:
                unique_indices.append(idx)

        return [filtered_topics[i] for i in unique_indices]