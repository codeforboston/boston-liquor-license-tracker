import logging

from app import constants as const
from app.pipeline.run_result import RunResult
from app.state.kv_store import KVStore

logger = logging.getLogger(__name__)

START_MARKERS = [
    "Transactional Hearings,",
    "The Board held a transactional hearing on",
    "Transactional Hearings:",
    "Transactional Hearing",
    "Transactional Hearing:",
    "Transactional Hearing Agenda",
    "Hearing Date:",
]

STOP_MARKERS = [
    "Old & New Business",
    "OLD AND NEW BUSINESS",
    "Old and New Business",
    "Non Hearing Common Victualler Transactions",
    "Non-Hearing Common Transactions",
    "Non-Hearing Transactions",
    "Non-Hearing Transactional:",
    "Non-Hearing Transactional Items:",
    "The following are applying for a new Common Victualler License",
    "***FORCE STOP***",
]


class HearingTextExtractorStep:
    """Extracts hearings from KVStore PDF text."""

    def __init__(self, kv_store: KVStore):
        self.kv_store = kv_store

    def run(self):
        # logger.info("Starting hearings extraction process...")
        pdf_text = self.kv_store.get(const.PDF_TEXT)
        pdf_file_path = self.kv_store.get(const.PDF_FILE_PATH)

        if not pdf_text:
            return RunResult(proceed=False, reason="PDF text not provided in KVStore")
        if not pdf_file_path:
            return RunResult(
                proceed=False, reason="PDF file path not provided in KVStore"
            )
        pdf_lines = pdf_text.splitlines()
        hearings = self._extract_section(pdf_lines)
        if hearings:
            self.kv_store.set(const.HEARING_SECTION, hearings)
        else:
            logger.warning("No hearings extracted.")

        # logger.info("Text extraction process completed.")
        return RunResult()

    def _extract_section(self, pdf_text):
        extracted_lines = []
        in_section = False

        for line in pdf_text:
            stripped_line = line.strip()
            lower_line = stripped_line.lower()

            # Check for start marker if not already in section
            if not in_section:
                for marker in START_MARKERS:
                    if marker.lower() in lower_line:
                        in_section = True
                        extracted_lines.append(line)
                        break
            else:
                # Check for stop marker if already in section
                stop_found = False
                for marker in STOP_MARKERS:
                    if marker.lower() in lower_line:
                        stop_found = True
                        break

                if stop_found:
                    break

                extracted_lines.append(line)

        if extracted_lines:
            return "\n".join(extracted_lines)
        else:
            pdf_file_path = self.kv_store.get(const.PDF_FILE_PATH)
            logger.warning(f"No Transactional Hearing section found in {pdf_file_path}")
            return None
