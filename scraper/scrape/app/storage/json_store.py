import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class JsonStore:
    """Handles JSON file I/O."""

    def save(self, data: list | dict, path: Path):
        """Saves data to a JSON file."""
        path.parent.mkdir(parents=True, exist_ok=True)
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4)
            logger.info(f"Saved data to {path}")
        except OSError as e:
            logger.error(f"Failed to save {path}: {e}")

    def load(self, path: Path) -> list:
        """Loads data from a JSON file. Returns empty list if missing."""
        if not path.exists():
            return []
        try:
            with open(path, encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError) as e:
            logger.error(f"Failed to load {path}: {e}")
            return []
