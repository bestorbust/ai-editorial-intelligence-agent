import re
import spacy

from keybert import KeyBERT

from backend.shared.models import EMBEDDING_MODEL
from backend.shared.schemas.topic import TopicData


class KeywordExtractor:

    def __init__(self):
        self.kw_model = KeyBERT(EMBEDDING_MODEL)
        self.nlp = spacy.load(
            "en_core_web_sm",
            disable=["ner", "lemmatizer"],
        )

        # Skip KeyBERT for very short content
        self.MIN_WORDS_FOR_KEYBERT = 25

        self.MAX_KEYWORDS = 8

    def _normalize(self, text: str) -> str:
        text = text.lower()

        text = re.sub(r"http\S+", "", text)
        text = re.sub(r"[^\w\s]", " ", text)
        text = re.sub(r"\s+", " ", text)

        return text.strip()

    def _remove_overlap(self, phrases: list[str]) -> list[str]:
        

        phrases = sorted(
            set(phrases),
            key=len,
            reverse=True,
        )

        final = []

        for phrase in phrases:

            if any(
                phrase in existing
                for existing in final
            ):
                continue

            final.append(phrase)

        return final

    def process(
        self,
        topics: list[TopicData],
    ) -> list[TopicData]:
        

        texts = [
            f"{topic.title}. {topic.summary or ''}"
            for topic in topics
        ]

        docs = self.nlp.pipe(
            texts,
            batch_size=64,
        )

  
        all_noun_chunks: list[list[str]] = []

        for text, doc in zip(texts, docs):

            noun_chunks = []

            for chunk in doc.noun_chunks:

                phrase = self._normalize(chunk.text)

                if len(phrase.split()) >= 2:
                    noun_chunks.append(phrase)

            all_noun_chunks.append(noun_chunks)

        eligible_indices = [
            i for i, text in enumerate(texts)
            if len(text.split()) >= self.MIN_WORDS_FOR_KEYBERT
        ]

        keybert_results_by_index: dict[int, list[str]] = {}

        if eligible_indices:
            eligible_texts = [texts[i] for i in eligible_indices]

            batched_results = self.kw_model.extract_keywords(
                eligible_texts,
                keyphrase_ngram_range=(1, 2),
                stop_words="english",
                top_n=5,
                use_mmr=True,
                diversity=0.6,
            )

            for idx, doc_keywords in zip(eligible_indices, batched_results):
                keybert_results_by_index[idx] = [
                    self._normalize(keyword)
                    for keyword, _ in doc_keywords
                ]

   
        for i, topic in enumerate(topics):

            merged = all_noun_chunks[i] + keybert_results_by_index.get(i, [])

            merged = self._remove_overlap(merged)

            merged = sorted(
                merged,
                key=lambda x: (
                    len(x.split()),
                    len(x),
                ),
                reverse=True,
            )

            topic.keywords = merged[: self.MAX_KEYWORDS]

        return topics