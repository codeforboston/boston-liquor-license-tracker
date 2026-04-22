"""
Extracts "Board voted to approve" section from PDF text, appending
Granted records for zip-code-restricted licenses to LICENSE_JSON_DATA.

This section appears in PDFs that batch-approve multiple restricted licenses.
Each entry ends with a "The Board voted to approve an XXXXX Zip Code restricted
[TYPE] License" line. Only entries with a License #: LB-XXXXXX are actionable
(used to update existing Deferred → Granted in the merge script).
"""

import logging
import os
import re

from app import constants as const
from app.pipeline.run_result import RunResult
from app.state.kv_store import KVStore

logger = logging.getLogger(__name__)

# The section header that introduces the batch-approval block (2026+ PDFs)
SECTION_HEADER_RE = re.compile(
    r"The Board voted to approve to the following restricted",
    re.IGNORECASE,
)

# Each individual approval line; captures optional zip code and license type.
# Handles both "a Zip Code restricted" (2025) and "an 02118 Zip Code restricted" (2026).
VOTED_LINE_RE = re.compile(
    r"The Board voted to approve an?\s+(?:(\d{5})\s+)?Zip Code restricted\s+"
    r"(All Alcoholic Beverages|Wines and Malt Beverages(?:\s+with\s+Liqueurs)?)\s+License",
    re.IGNORECASE,
)

LICENSE_NUMBER_RE = re.compile(r"License\s*#\s*:\s*(LB-\d+)", re.IGNORECASE)
DBA_RE = re.compile(r"Doing business as:\s*(.+)", re.IGNORECASE)
ZIPCODE_IN_ADDRESS_RE = re.compile(r",\s*MA\s+(\d{5})", re.IGNORECASE)
ADDRESS_RE = re.compile(r".+,\s*MA\s+\d{5}", re.IGNORECASE)

# Line prefixes that are labels/metadata, not business names
_SKIP_PREFIXES = re.compile(
    r"^(?:Doing business as:|License\s*#|Manager:|Closing Time:|Hearing Date:|"
    r"Attorney:|Hours of Operation:|pursuant to|The Board|Common Victualler|"
    r"Restaurant|Innholder|\d+\.)",
    re.IGNORECASE,
)
# Standalone 5-digit zip code line
_ZIPCODE_ONLY_RE = re.compile(r"^\d{5}$")


def _clean(line: str) -> str:
    """Strip zero-width spaces and surrounding whitespace."""
    return line.replace("\u200b", "").strip()


def _is_skip_line(line: str) -> bool:
    if not line:
        return True
    if _ZIPCODE_ONLY_RE.match(line):
        return True
    if _SKIP_PREFIXES.match(line):
        return True
    if ADDRESS_RE.match(line):
        return True
    return False


def _extract_business_name(lines: list) -> str | None:
    for line in lines:
        if not _is_skip_line(line):
            return line
    return None


class BoardVotedExtractorStep:
    """Appends Granted records from the 'Board voted to approve' section to LICENSE_JSON_DATA."""

    def __init__(self, kv_store: KVStore):
        self.kv_store = kv_store

    def run(self) -> RunResult:
        pdf_text = self.kv_store.get(const.PDF_TEXT)
        pdf_file_path = self.kv_store.get(const.PDF_FILE_PATH)

        if not pdf_text or not pdf_file_path:
            return RunResult()

        section_match = SECTION_HEADER_RE.search(pdf_text)
        if not section_match:
            return RunResult()

        # Start parsing after the full section header line (skip remainder of matched line)
        header_line_end = pdf_text.find("\n", section_match.end())
        section_start = (
            header_line_end + 1 if header_line_end >= 0 else section_match.end()
        )
        section_text = pdf_text[section_start:]
        minutes_date = self._get_minutes_date(pdf_file_path)
        file_name = os.path.basename(pdf_file_path)

        records = self._parse_entries(section_text, minutes_date, file_name)
        if not records:
            return RunResult()

        existing = self.kv_store.get(const.LICENSE_JSON_DATA) or []
        self.kv_store.set(const.LICENSE_JSON_DATA, existing + records)
        logger.info(
            f"BoardVotedExtractor: appended {len(records)} granted records from {file_name}"
        )
        return RunResult()

    def _get_minutes_date(self, pdf_file_path: str) -> str | None:
        match = re.search(r"(\d{4}-\d{2}-\d{2})", str(pdf_file_path))
        return match.group(1) if match else None

    def _parse_entries(
        self, section_text: str, minutes_date: str | None, file_name: str
    ) -> list:
        results = []
        matches = list(VOTED_LINE_RE.finditer(section_text))
        if not matches:
            return results

        for i, m in enumerate(matches):
            # Business info precedes the voted line that closes each entry.
            # For entry 0, info is between section header end and first match.
            # For entry i>0, info is between previous match end and this match start.
            chunk_start = matches[i - 1].end() if i > 0 else 0
            chunk_text = section_text[chunk_start : m.start()]

            zip_from_line = m.group(1)  # may be None for older-format PDFs
            raw_type = m.group(2)
            voted_text = m.group(0)

            alcohol_type = self._normalize_alcohol_type(raw_type)
            if not alcohol_type:
                continue

            lines = [_clean(ln) for ln in chunk_text.splitlines()]
            lines = [ln for ln in lines if ln]

            license_number = self._extract_license_number(lines)
            dba_name = self._extract_dba(lines)
            address, zipcode = self._extract_address_zip(lines)

            if not zipcode and zip_from_line:
                zipcode = zip_from_line

            business_name = _extract_business_name(lines)

            results.append(
                {
                    "minutes_date": minutes_date,
                    "license_number": license_number,
                    "business_name": business_name or "",
                    "dba_name": dba_name,
                    "address": address or "",
                    "zipcode": zipcode or "",
                    "alcohol_type": alcohol_type,
                    "status": "granted",
                    "details": voted_text,
                    "entity_number": "",
                    "file_name": file_name,
                }
            )

        return results

    def _normalize_alcohol_type(self, raw: str) -> str | None:
        lower = raw.lower()
        if "all alcoholic" in lower:
            return "all alcoholic beverages"
        if "malt" in lower or "wine" in lower:
            return "wines and malt beverages"
        return None

    def _extract_license_number(self, lines: list) -> str | None:
        for line in lines:
            m = LICENSE_NUMBER_RE.search(line)
            if m:
                return m.group(1)
        return None

    def _extract_dba(self, lines: list) -> str | None:
        for line in lines:
            m = DBA_RE.match(line)
            if m:
                return m.group(1).strip()
        return None

    def _extract_address_zip(self, lines: list) -> tuple:
        for line in lines:
            if ADDRESS_RE.match(line):
                zip_match = ZIPCODE_IN_ADDRESS_RE.search(line)
                zipcode = zip_match.group(1) if zip_match else None
                return line, zipcode
        return None, None
