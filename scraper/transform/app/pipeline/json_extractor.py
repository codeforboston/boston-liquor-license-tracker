import logging
import re

from app import constants as const
from app.pipeline.extraction.context import ExtractionContext
from app.pipeline.extraction.json_pipeline import EXTRACTORS
from app.pipeline.run_result import RunResult

logger = logging.getLogger(__name__)


class TextJsonExtractorStep:
    """Extracts JSON data from license text using a pipeline of extractors."""

    def __init__(self, kv_store):
        self.kv_store = kv_store

    def run(self):
        file_path = self.kv_store.get(const.PDF_FILE_PATH)
        license_text_data = self.kv_store.get(const.LICENSE_TEXT_DATA)

        if not file_path:
            return RunResult(
                proceed=False, reason="PDF file path not provided in KVStore"
            )
        if not license_text_data:
            return RunResult(
                proceed=False, reason="License text data not provided in KVStore"
            )

        results = []

        for store_key, content in license_text_data.items():
            lines = [line.strip() for line in content.splitlines() if line.strip()]
            if not lines:
                continue

            data = self._initialize_data_dict(store_key)
            ctx = ExtractionContext(lines=lines, data=data)

            # Chain of responsibility pattern
            for extractor in EXTRACTORS:
                try:
                    extractor.run(ctx)
                except Exception as e:
                    logger.error(
                        f"Extractor {extractor.__class__.__name__} failed for {store_key}: {e}",
                        exc_info=True,
                    )
                    # Pipeline continues for other extractors

            results.append(ctx.data)

        self.kv_store.set(const.LICENSE_JSON_DATA, results)
        return RunResult()

    def _entity_number(self, store_key: str) -> str:
        parts = store_key.rsplit("_", 1)
        return parts[1] if len(parts) == 2 else ""

    def _sourceFileName(self, store_key: str) -> str:
        return re.sub(r"_(\d+)$", "", store_key)

    def _initialize_data_dict(self, store_key: str) -> dict:
        return {
            "minutes_date": None,
            "license_number": None,
            "business_name": None,
            "dba_name": None,
            "address": None,
            "street_number": None,
            "street_name": None,
            "city": None,
            "state": None,
            "zipcode": None,
            "alcohol_type": None,
            "manager": None,
            "attorney": None,
            "status": None,
            "status_detail": None,
            "details": None,
            "entity_number": self._entity_number(store_key),
            "file_name": self._sourceFileName(store_key),
        }
