from abc import ABC, abstractmethod

class BaseProvider(ABC):

    @abstractmethod
    async def stream_chat(self, messages):
        pass