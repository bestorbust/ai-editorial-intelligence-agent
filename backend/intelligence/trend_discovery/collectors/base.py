from abc import ABC,abstractmethod

from backend.intelligence.trend_discovery.models import CollectorResult

class BaseCollector(ABC):
    @property
    @abstractmethod
    def source_name(self)->str:
        """
        Name of the source ex:reddit,github.."""
        pass

    @abstractmethod
    def collect(self)->CollectorResult:
        """ Collect topics from the sources and returns list of Topics"""
        pass

