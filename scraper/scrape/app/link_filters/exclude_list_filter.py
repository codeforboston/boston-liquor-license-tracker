import json
from pathlib import Path


class ExcludeListFilter:
    """Filters out links present in an exclude list."""

    def __init__(self, exclude_file_path: Path):
        self.exclude_file_path = exclude_file_path
        self.exclude_items = self._load()

    def _load(self) -> set:
        if not self.exclude_file_path.exists():
            return set()

        try:
            with open(self.exclude_file_path, encoding="utf-8") as f:
                data = json.load(f)
                return set(data) if isinstance(data, list) else set()
        except json.JSONDecodeError:
            return set()

    def process(self, links: list[dict]) -> list[dict]:
        return [
            link for link in links if link.get("href", "") not in self.exclude_items
        ]

    def add_url(self, url: str):
        """Adds a URL to the exclude list and saves it."""
        if url not in self.exclude_items:
            self.exclude_items.add(url)
            self._save()

    def _save(self):
        self.exclude_file_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.exclude_file_path, "w", encoding="utf-8") as f:
            json.dump(list(self.exclude_items), f, indent=4)
