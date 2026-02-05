# violation_plugins/base.py

from abc import ABC, abstractmethod


class Plugin(ABC):
    priority = 100  # lower runs first

    @abstractmethod
    def query(self, store: dict) -> bool:
        """Return True if this plugin should run"""
        pass

    @abstractmethod
    def run(self, store: dict) -> None:
        """Perform the plugin action"""
        pass
