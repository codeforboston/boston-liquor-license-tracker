import logging

import fitz  # PyMuPDF

from app import constants as const

logger = logging.getLogger(__name__)


class TextExtractorService:
    """Orchestrates text extraction from downloaded PDFs."""

    def __init__(self):
        self.pdf_dir = const.DOWNLOAD_DIR
        self.output_dir = const.TEXT_OUTPUT_DIR
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def run(self):
        logger.info("Starting text extraction process...")
        if not self.pdf_dir.exists():
            logger.error(f"PDF directory not found: {self.pdf_dir}")
            return

        pdf_files = sorted(self.pdf_dir.glob("*.pdf"))
        if not pdf_files:
            logger.warning(f"No PDF files found in {self.pdf_dir}")
            return

        logger.info(f"Found {len(pdf_files)} PDF files to process.")

        for pdf_file in pdf_files:
            self._process_file(pdf_file)

        logger.info("Text extraction process completed.")

    def _process_file(self, pdf_file):
        output_file = self.output_dir / f"{pdf_file.stem}.txt"

        # Simple check to avoid re-extraction if desired,
        # but technically we might want to overwrite if PDF changed.
        # For now, we overwrite to ensure consistency.

        text = self._extract_text(pdf_file)
        text = self._strip_non_ascii(text)
        if text:
            try:
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(text)
                logger.info(f"Extracted {pdf_file.name} -> {output_file.name}")
            except OSError as e:
                logger.error(f"Failed to write text file {output_file}: {e}")
        else:
            logger.warning(f"No text extracted from {pdf_file.name}")

    def _extract_text(self, pdf_path) -> str:
        try:
            doc = fitz.open(pdf_path)
            all_text = []
            for page in doc:
                text = page.get_text()
                if text.strip():
                    all_text.append(text.strip())
                    #all_text.append("\n-------------------------\n")
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