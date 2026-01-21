import hashlib
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class PdfStore:
    """Handles saving PDF content with versioning and deduplication."""

    def __init__(self, download_dir: Path):
        self.download_dir = download_dir
        self.download_dir.mkdir(parents=True, exist_ok=True)

    def save_pdf(self, content: bytes, date_str: str) -> Path:
        """
        Saves PDF content. Creates versioned filename if content differs
        from existing file for that date.
        """
        base_name = f"voting_minutes_{date_str}.pdf"
        base_path = self.download_dir / base_name

        incoming_hash = hashlib.sha256(content).digest()

        # Case 1: base file exists
        if base_path.exists():
            if self._calculate_hash(base_path) == incoming_hash:
                logger.info(f"No change - {base_path.name} is up to date")
                return base_path

        # Case 2: versioning
        index = 1
        while True:
            candidate = (
                base_path
                if index == 1
                else self.download_dir / f"voting_minutes_{date_str}_v{index}.pdf"
            )

            if not candidate.exists():
                self._write_file(candidate, content)
                return candidate

            if self._calculate_hash(candidate) == incoming_hash:
                logger.info(f"Duplicate content - matches {candidate.name}")
                return candidate

            index += 1

    def _write_file(self, path: Path, content: bytes):
        try:
            with path.open("wb") as f:
                f.write(content)
            logger.info(f"Saved {path.name}")
        except OSError as e:
            logger.error(f"Failed to write PDF {path}: {e}")

    def _calculate_hash(self, path: Path) -> bytes:
        h = hashlib.sha256()
        with path.open("rb") as f:
            while chunk := f.read(8192):
                h.update(chunk)
        return h.digest()
