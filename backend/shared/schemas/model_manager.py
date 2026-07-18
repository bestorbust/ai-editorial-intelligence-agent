from backend.shared.models import EMBEDDING_MODEL,GLINER_MODEL
class ModelManager:
    @staticmethod
    def embedding():
        return EMBEDDING_MODEL
    @staticmethod
    def gliner():
        return GLINER_MODEL
