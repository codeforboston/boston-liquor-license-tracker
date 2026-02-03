from typing import Protocol

from .context import ExtractionContext


class Extractor(Protocol):
    priority: int

    def run(self, ctx: ExtractionContext) -> None:
        """Mutates ctx in place. Never raises for missing data."""
        ...
