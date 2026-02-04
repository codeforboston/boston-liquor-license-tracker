import logging
from io import BytesIO
from urllib.parse import urljoin
from pathlib import Path
import shutil
import pikepdf
import requests

from app import constants as const
from app.link_filters.exclude_list_filter import ExcludeListFilter
from app.storage.json_store import JsonStore
from app.storage.pdf_store import PdfStore

logger = logging.getLogger(__name__)


class DownloaderService:
    """Orchestrates the downloading of voting minute PDFs."""

    def __init__(self):
        self.storage = JsonStore()
        self.pdf_repo = PdfStore(const.DOWNLOAD_DIR)
        # We use the exclude filter here primarily to ADD bad URLs
        self.exclude_filter = ExcludeListFilter(const.URL_EXCLUDE_LIST_FILE)

    def run(self):
        logger.info("Starting download process...")
        links = self.storage.load(const.MINUTES_LINKS_FILE)

        if not links:
            logger.warning(f"No links found in {const.MINUTES_LINKS_FILE}")
            return

        for item in links:
            href = item.get("href")
            date_str = item.get("date")

            if not href or not date_str:
                logger.warning(f"Skipping malformed item: {item}")
                continue

            if href in self.exclude_filter.exclude_items:
                continue

            content = self._download_pdf(href)
            if content:
                self.pdf_repo.save_pdf(content, date_str)

        self._copy_exception_pdfs(const.EXCEPTION_PDFS, const.DOWNLOAD_DIR)
    
        logger.info("Download process completed.")

    def _download_pdf(self, href: str) -> bytes | None:
        url = self._prepare_url(href)
        try:
            resp = requests.get(url, timeout=const.DEFAULT_TIMEOUT)
            resp.raise_for_status()
            content = resp.content

            if self._is_valid_pdf(content):
                return content
            else:
                logger.warning(f"Invalid PDF at {url}. Adding to exclude list.")
                self.exclude_filter.add_url(href)
                return None

        except requests.RequestException as e:
            logger.error(f"Failed to download {url}: {e}")
            return None

    def _prepare_url(self, href: str) -> str:
        if "drive.google.com" in href and "/file/d/" in href:
            file_id = href.split("/file/d/", 1)[1].split("/", 1)[0]
            return f"https://drive.google.com/uc?export=download&id={file_id}"
        return urljoin(const.BASE_URL, href)

    def _is_valid_pdf(self, content: bytes) -> bool:
        try:
            with pikepdf.open(BytesIO(content)):
                return True
        except pikepdf.PdfError:
            return False


    def _copy_exception_pdfs(self, source_dir: str, destination_dir: str) -> int:
        """
        Copy all *.pdf files from source_dir to destination_dir.

        Args:
            source_dir (str): Directory containing PDF files to copy
            destination_dir (str): Directory to copy PDFs into

        Returns:
            int: Number of PDF files copied
        """
        src = Path(source_dir)
        dst = Path(destination_dir)

        if not src.exists() or not src.is_dir():
            raise ValueError(f"Source directory does not exist or is not a directory: {src}")

        dst.mkdir(parents=True, exist_ok=True)

        pdf_files = list(src.glob("*.pdf"))

        for pdf in pdf_files:
            shutil.copy2(pdf, dst / pdf.name)

        return len(pdf_files)
