from sentence_transformers import SentenceTransformer
from gliner import GLiNER


EMBEDDING_MODEL = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2"
)

GLINER_MODEL =GLiNER.from_pretrained(
    "urchade/gliner_medium-v2.1"
)