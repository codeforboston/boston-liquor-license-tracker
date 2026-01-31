import logging

import fitz  # PyMuPDF

from app import constants as const
from app.pipeline.run_result import RunResult
from app.state.kv_store import KVStore

logger = logging.getLogger(__name__)


class PDFTextExtractorStep:
    """Extracts text from downloaded PDFs."""

    def __init__(self, kv_store: KVStore):
        self.kv_store = kv_store
        self.file_path = self.kv_store.get(const.PDF_FILE_PATH)

    def run(self):
        # logger.info("Starting text extraction process...")
        if not self.file_path:
            return RunResult(
                proceed=False, reason="PDF file path not provided in KVStore"
            )
        text = self._extract_text(self.file_path)
        text = self._remove_underscore_lines(text)
        text = self._strip_non_ascii(text)
        if text:
            self.kv_store.set(const.PDF_TEXT, text)
        else:
            logger.warning(f"No text extracted from {self.file_path}")

        # logger.info("Text extraction process completed.")
        return RunResult()

    def _extract_text(self, pdf_path) -> str:
        try:
            doc = fitz.open(pdf_path)
            all_text = []
            for page in doc:
                text = page.get_text()
                if text.strip():
                    all_text.append(text.strip())
                    # all_text.append("\n-------------------------\n")
            doc.close()
            return "\n".join(all_text)
        except Exception as e:
            logger.error(f"Error extracting text from {pdf_path}: {e}")
            return ""

    def _strip_non_ascii(self, text: str) -> str:
        """
        Remove all non-ASCII characters from text.
        Keeps characters in the range 0–127.
        """
        return text.encode("ascii", errors="ignore").decode("ascii")

    def _remove_underscore_lines(self, text: str) -> str:
        lines = text.split("\n")
        cleaned = []

        for line in lines:
            stripped = line.strip()

            # If the line is made only of underscores, skip it
            if stripped and all(ch == "_" for ch in stripped):
                continue

            cleaned.append(line)

        return "\n".join(cleaned)
