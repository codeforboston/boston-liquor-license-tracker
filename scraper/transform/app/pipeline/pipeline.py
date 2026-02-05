import logging
from typing import Any

from app import constants as const
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

    pipeline = Pipeline(
        store,
        [
            PDFTextExtractorStep(store),
            InvariantPluginStep(store, "POST_TEXT"),
            HearingTextExtractorStep(store),
            InvariantPluginStep(store, "POST_HEARING"),
            LicenseTextExtractorStep(store),
            InvariantPluginStep(store, "POST_LICENSE"),
            TextJsonExtractorStep(store),
        ],
    )

    result = pipeline.run()

    if result.proceed:
        return store.get(const.LICENSE_JSON_DATA, [])
    else:
        logger.error(f"Pipeline failed for {pdf_file_path}: {result.reason}")
        return []
