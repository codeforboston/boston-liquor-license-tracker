import logging
from typing import Any

from app import constants as const
from app.pipeline.extract_board_voted import BoardVotedExtractorStep
from app.pipeline.extract_hearing import HearingTextExtractorStep
from app.pipeline.extract_license_text import LicenseTextExtractorStep
from app.pipeline.extract_pdf_text import PDFTextExtractorStep
from app.pipeline.invariant_plugins import InvariantPluginStep
from app.pipeline.json_extractor import TextJsonExtractorStep
from app.pipeline.run_result import RunResult
from app.state.kv_store import KVStore
from app.utils.logger import setup_logging

logger = logging.getLogger(__name__)


class Pipeline:
    """
    Manages a sequence of processing steps.
    Each step is expected to have a 'run' method that returns a RunResult.
    If a step's RunResult.proceed is False, the pipeline stops.
    """

    def __init__(self, kv_store: KVStore, steps: list[Any]):
        self.kv_store = kv_store
        self.steps = steps

    def run(self) -> RunResult:
        """Runs all steps in sequence."""
        for step in self.steps:
            step_name = step.__class__.__name__
            # logger.info(f"Running pipeline step: {step_name}...")

            try:
                result = step.run()
                if not result.proceed:
                    logger.warning(
                        f"Pipeline stopped after {step_name}: {result.reason}"
                    )
                    return result
            except Exception as e:
                logger.error(f"Pipeline failed at step {step_name}: {e}")
                return RunResult(proceed=False, reason=str(e))

        return RunResult()


def run_pipeline(pdf_file_path: str, kv_store: KVStore | None = None):
    logger = setup_logging(__name__)
    if not pdf_file_path:
        raise ValueError("PDF file path is required")

    store = kv_store or KVStore()
    store.set(const.PDF_FILE_PATH, pdf_file_path)

    # These steps are run for each PDF in the store
    pipeline = Pipeline(
        store,
        [
            # Extracts all text from the downloaded PDF
            PDFTextExtractorStep(store),
            # Runs fixes from ../violation_plugins/post_text/ on the extracted PDF text
            InvariantPluginStep(store, "POST_TEXT"),
            # Extracts hearings from the PDF text
            HearingTextExtractorStep(store),
            # Runs fixes from ../violation_plugins/post_hearing/ after hearing text extraction
            InvariantPluginStep(store, "POST_HEARING"),
            # Extracts license-related text from the hearing text
            LicenseTextExtractorStep(store),
            # Runs fixes from ../violation_plugins/post_license/ after license text extraction
            # TODO: uncomment this line when post_license plugins are implemented
            # InvariantPluginStep(store, "POST_LICENSE"),
            # Extracts structured JSON data from the hearing and license text and stores it in the KVStore.
            TextJsonExtractorStep(store),
            # Appends Granted records from the "Board voted to approve" section (does not stop pipeline).
            BoardVotedExtractorStep(store),
        ],
    )

    result = pipeline.run()

    if result.proceed:
        return store.get(const.LICENSE_JSON_DATA, [])
    else:
        logger.error(f"Pipeline failed for {pdf_file_path}: {result.reason}")
        return []
