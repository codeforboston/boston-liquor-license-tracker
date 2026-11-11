"""
Extracts zip-code-restricted license approvals from PDF text, appending
Granted records to LICENSE_JSON_DATA.

The Licensing Board records Chapter 202 (zip-code-restricted) approvals in
several formats, and the merge script relies on all of them:

  * 2025 batch votes (e.g. 2025-02-13, 2025-06-26, 2025-10-23):
        "The Board voted to approve a Zip Code restricted All Alcoholic Beverages License"
        "The Board voted to grant a Zip Code restricted ... License on the condition
         that the Licensee surrenders the existing Wines and Malt Beverages ... License"
    These entries list name / address / hearing date but usually NO license number.

  * 2026 batch votes (e.g. 2026-03-05):
        "The Board voted to approve an 02118 Zip Code restricted ... License"
    These entries include a License #.

  * Inline / Old and New Business grants (late 2025 onward):
        "Granted a ZIP Code Restricted All Alcoholic Beverages License"
        "Granted an 02128 Zip Code Restricted License pursuant to ... Chapter 202"

Each emitted record carries ``source: "board_vote"`` plus enough identifying
information (license number when present, otherwise business name, dba,
address, zip and hearing date) for the merge script to match it to an existing
application.
"""

import logging
import os
import re
from datetime import datetime
from urllib.parse import unquote

from app import constants as const
from app.pipeline.run_result import RunResult
from app.state.kv_store import KVStore

logger = logging.getLogger(__name__)

# One approval line. Captures optional zip code and optional license type.
#  - "The Board voted to approve a Zip Code restricted All Alcoholic Beverages License"
#  - "The Board voted to grant an 02118 Zip Code restricted Wines and Malt Beverages License"
#  - "Granted a ZIP Code Restricted All Alcoholic Beverages License"
#  - "Granted an 02128 Zip Code Restricted License"
#  - "Granted an 02118 Zip Code Restricuted All-Alcoholic Beverages License" (typo in source)
VOTED_LINE_RE = re.compile(
    r"(?:The\s+Board\s+voted\s+to\s+(?:approve|grant)|Granted)\s+an?\s+"
    r"(?:(\d{5})\s+)?Zip\s*Code\s+restric\w*\s+"
    r"(?:(All[\s-]+Alcoholic\s+Beverages|Wines?\s+and\s+Malt\s+Beverages(?:\s+with\s+Liqueurs)?)\s+)?"
    r"License",
    re.IGNORECASE,
)

CONDITIONAL_RE = re.compile(r"^\s*on\s+the\s+condition", re.IGNORECASE)

LICENSE_NUMBER_RE = re.compile(r"License\s*#\s*:\s*LB\s*[-‑]?\s*(\d+)", re.IGNORECASE)
DBA_RE = re.compile(r"^Doing business as:\s*(.+)", re.IGNORECASE)
CITY_ZIP_RE = re.compile(r".+,\s*MA\.?\s+(\d{5})\b", re.IGNORECASE)
HEARING_DATE_RE = re.compile(r"^Hearing Date:\s*(.+)$", re.IGNORECASE)
LICENSE_TYPE_LINE_RE = re.compile(
    r"Common Victualler|Club|Innholder|General On", re.IGNORECASE
)
ITEM_START_RE = re.compile(r"^\d{1,2}\.\s+(.+)$")
STARTS_WITH_DIGIT_RE = re.compile(r"^\d")
ZIPCODE_ONLY_RE = re.compile(r"^\d{5}$")

# Max lines to look back from an approval line for the entry's details.
LOOKBACK_LINES = 30


def _clean(line: str) -> str:
    """Strip zero-width spaces, normalize hyphens, and trim whitespace."""
    return line.replace("​", "").replace("‑", "-").replace("‐", "-").strip()


def _parse_date(text: str) -> str | None:
    cleaned = text.strip().rstrip(".")
    for fmt in ("%B %d, %Y", "%B %d %Y"):
        try:
            return datetime.strptime(cleaned, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None


def _normalize_alcohol_type(raw: str | None) -> str | None:
    if not raw:
        return None
    lower = raw.lower()
    if "all" in lower and "alcoholic" in lower:
        return "all alcoholic beverages"
    if "malt" in lower or "wine" in lower:
        return "wines and malt beverages"
    return None


class BoardVotedExtractorStep:
    """Appends Granted records for zip-code-restricted approvals to LICENSE_JSON_DATA."""

    def __init__(self, kv_store: KVStore):
        self.kv_store = kv_store

    def run(self) -> RunResult:
        pdf_text = self.kv_store.get(const.PDF_TEXT)
        pdf_file_path = self.kv_store.get(const.PDF_FILE_PATH)

        if not pdf_text or not pdf_file_path:
            return RunResult()

        minutes_date = self._get_minutes_date(pdf_file_path)
        file_name = os.path.basename(pdf_file_path)

        records = parse_approvals(pdf_text, minutes_date, file_name)
        if not records:
            return RunResult()

        existing = self.kv_store.get(const.LICENSE_JSON_DATA) or []
        self.kv_store.set(const.LICENSE_JSON_DATA, existing + records)
        logger.info(
            f"BoardVotedExtractor: appended {len(records)} zip-restricted approvals from {file_name}"
        )
        return RunResult()

    def _get_minutes_date(self, pdf_file_path: str) -> str | None:
        return minutes_date_from_filename(pdf_file_path)


def minutes_date_from_filename(pdf_file_path: str) -> str | None:
    """Read the meeting date from a minutes file name.

    Handles the pipeline's ``voting_minutes_2026-10-29.pdf`` and the City's
    ``Voting%20Minutes%2010-29-26.docx.pdf`` / ``Voting Minutes 6-4-26.pdf``.
    """
    name = unquote(os.path.basename(str(pdf_file_path)))
    iso = re.search(r"(\d{4}-\d{2}-\d{2})", name)
    if iso:
        return iso.group(1)
    mdy = re.search(r"(?<!\d)(\d{1,2})-(\d{1,2})-(\d{2}|\d{4})(?!\d)", name)
    if mdy:
        month, day, year = (int(g) for g in mdy.groups())
        year = year + 2000 if year < 100 else year
        try:
            return datetime(year, month, day).strftime("%Y-%m-%d")
        except ValueError:
            return None
    return None


def parse_approvals(text: str, minutes_date: str | None, file_name: str) -> list[dict]:
    """Return one record per zip-code-restricted approval found in ``text``."""
    results: list[dict] = []
    matches = list(VOTED_LINE_RE.finditer(text))

    for i, m in enumerate(matches):
        prev_end = matches[i - 1].end() if i > 0 else 0
        chunk_lines = [_clean(ln) for ln in text[prev_end : m.start()].splitlines()]
        chunk_lines = [ln for ln in chunk_lines if ln][-LOOKBACK_LINES:]
        entry_lines = _trim_to_entry(chunk_lines)

        tail = text[m.end() : m.end() + 120]
        conditional = bool(CONDITIONAL_RE.search(tail))

        info = _parse_entry(entry_lines)
        alcohol_type = _normalize_alcohol_type(m.group(2)) or info["alcohol_type"]
        zipcode = m.group(1) or info["zipcode"]

        results.append(
            {
                "source": "board_vote",
                "minutes_date": minutes_date,
                "hearing_date": info["hearing_date"],
                "license_number": info["license_number"],
                "business_name": info["business_name"] or "",
                "dba_name": info["dba_name"],
                "address": info["address"] or "",
                "zipcode": zipcode or "",
                "alcohol_type": alcohol_type,
                "status": "granted",
                "conditional": conditional,
                "details": re.sub(
                    r"\s+", " ", m.group(0) + (tail if conditional else "")
                ).strip(),
                "entity_number": "",
                "file_name": file_name,
            }
        )

    return results


def _trim_to_entry(lines: list[str]) -> list[str]:
    """Keep only the lines that belong to the entry immediately before the vote.

    Walks backwards and stops at a horizontal rule, a numbered item start
    (keeping that line), or the previous entry's "Hearing Date" line.
    """
    kept: list[str] = []
    seen_hearing = False
    for line in reversed(lines):
        if line.startswith("___"):
            break
        if HEARING_DATE_RE.match(line):
            if seen_hearing:
                break
            seen_hearing = True
        kept.insert(0, line)
        if ITEM_START_RE.match(line):
            break
    return kept


def _parse_entry(lines: list[str]) -> dict:
    info: dict = {
        "license_number": None,
        "business_name": None,
        "dba_name": None,
        "address": None,
        "zipcode": None,
        "hearing_date": None,
        "alcohol_type": None,
    }

    for line in lines:
        if info["license_number"] is None:
            lm = LICENSE_NUMBER_RE.search(line)
            if lm:
                info["license_number"] = f"LB-{lm.group(1)}"
        hm = HEARING_DATE_RE.match(line)
        if hm:
            info["hearing_date"] = _parse_date(hm.group(1))
        if info["alcohol_type"] is None and LICENSE_TYPE_LINE_RE.search(line):
            info["alcohol_type"] = _normalize_alcohol_type(line)

    # Locate the "City, MA 02xxx" line, then walk backwards for street / dba / name.
    addr_idx, city_match = next(
        ((k, cm) for k, ln in enumerate(lines) if (cm := CITY_ZIP_RE.match(ln))),
        (None, None),
    )
    if addr_idx is not None and city_match is not None:
        city_line = lines[addr_idx]
        info["zipcode"] = city_match.group(1)
        k = addr_idx - 1
        if STARTS_WITH_DIGIT_RE.match(city_line) or k < 0:
            info["address"] = city_line
        elif STARTS_WITH_DIGIT_RE.match(lines[k]):
            info["address"] = f"{lines[k].rstrip(',')}, {city_line}"
            k -= 1
        else:
            info["address"] = city_line
        if k >= 0:
            dm = DBA_RE.match(lines[k])
            if dm:
                info["dba_name"] = dm.group(1).strip()
                k -= 1
        if k >= 0 and not ZIPCODE_ONLY_RE.match(lines[k]):
            name = lines[k]
            im = ITEM_START_RE.match(name)
            info["business_name"] = (im.group(1) if im else name).strip()
    else:
        # No "City, MA 02xxx" line (e.g. "4541 Washington St, Roslindale, MA"):
        # take the dba line and the name line just above it / the numbered item.
        dba_idx, dba_match = next(
            ((k, dm) for k, ln in enumerate(lines) if (dm := DBA_RE.match(ln))),
            (None, None),
        )
        if dba_match is not None:
            info["dba_name"] = dba_match.group(1).strip()
        name_line = (
            lines[dba_idx - 1]
            if dba_idx
            else next((ln for ln in lines if ITEM_START_RE.match(ln)), None)
        )
        if name_line:
            im = ITEM_START_RE.match(name_line)
            info["business_name"] = (im.group(1) if im else name_line).strip()
        street = next((ln for ln in lines if re.match(r"^\d+.*,\s*MA\.?$", ln)), None)
        if street:
            info["address"] = street

    return info
