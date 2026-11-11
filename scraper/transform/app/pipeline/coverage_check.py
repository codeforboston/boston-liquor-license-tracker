"""
Safety net for the license extractors.

Independently scans the raw PDF text for new Common Victualler 7-Day
applications in the Chapter 202 zip codes, and appends a
``source: "coverage_warning"`` record for every one that the extraction steps
did not output. The merge script surfaces these in the pull-request body so a
person can add the license by hand (scripts/data/license_corrections.json).

Typical causes: an application block with no "License #" line, or a block whose
layout the hearing/license splitters do not recognise.
"""

import logging
import os
import re

from app import constants as const
from app.pipeline.run_result import RunResult
from app.state.kv_store import KVStore

logger = logging.getLogger(__name__)

ELIGIBLE_ZIPCODES = {
    "02118",
    "02119",
    "02121",
    "02122",
    "02124",
    "02125",
    "02126",
    "02128",
    "02129",
    "02130",
    "02131",
    "02132",
    "02136",
}

ITEM_SPLIT_RE = re.compile(r"\n(?=\s*\d{1,2}\.\s)|\n(?=_{5,})")
APPLICATION_RE = re.compile(
    r"applied\s+for\s+an?\s+(?:\(\w+\)\s+)?Common\s+Victualler\s+7[\s-]Day\s+"
    r"(?:All|Wine)",
    re.IGNORECASE,
)
ITEM_NAME_RE = re.compile(r"^\s*\d{1,2}\.\s+(.+)$", re.MULTILINE)
ZIP_RE = re.compile(r",\s*MA\.?\s+(\d{5})\b")
ZIP_FROM_GRANT_RE = re.compile(r"(\d{5})\s+zip\s*code\s+restric", re.IGNORECASE)
LICENSE_RE = re.compile(r"License\s*#\s*:\s*LB\s*[-‑]?\s*(\d+)", re.IGNORECASE)


def _norm(value: str | None) -> str:
    return re.sub(r"[^a-z0-9]", "", (value or "").lower())


def find_missing_applications(text: str, records: list[dict]) -> list[dict]:
    """Return one description per eligible application absent from ``records``."""
    seen_numbers = {r.get("license_number") for r in records if r.get("license_number")}
    seen_names = {
        _norm(n)
        for r in records
        for n in (r.get("business_name"), r.get("dba_name"))
        if n
    }

    missing = []
    for item in ITEM_SPLIT_RE.split(text):
        flat = re.sub(r"\s+", " ", item)
        if not APPLICATION_RE.search(flat) or "(airport)" in flat.lower():
            continue
        zm = ZIP_RE.search(item) or ZIP_FROM_GRANT_RE.search(flat)
        zipcode = zm.group(1) if zm else None
        if zipcode and zipcode not in ELIGIBLE_ZIPCODES:
            continue

        lm = LICENSE_RE.search(flat)
        license_number = f"LB-{lm.group(1)}" if lm else None
        nm = ITEM_NAME_RE.search(item)
        name = nm.group(1).strip() if nm else flat[:60].strip()

        if license_number and license_number in seen_numbers:
            continue
        if not license_number and _norm(name) in seen_names:
            continue

        missing.append(
            {
                "license_number": license_number,
                "business_name": name,
                "zipcode": zipcode,
            }
        )
    return missing


class CoverageCheckStep:
    """Appends coverage_warning records for applications the extractors missed."""

    def __init__(self, kv_store: KVStore):
        self.kv_store = kv_store

    def run(self) -> RunResult:
        text = self.kv_store.get(const.PDF_TEXT)
        pdf_file_path = self.kv_store.get(const.PDF_FILE_PATH)
        if not text or not pdf_file_path:
            return RunResult()

        records = self.kv_store.get(const.LICENSE_JSON_DATA) or []
        file_name = os.path.basename(pdf_file_path)
        warnings = []
        for m in find_missing_applications(text, records):
            details = (
                f"Possible missed application in {file_name}: '{m['business_name']}' "
                f"(license {m['license_number'] or 'not listed'}, "
                f"zip {m['zipcode'] or 'not listed'}). The extractor did not output "
                "it; check the minutes and add it via license_corrections.json if it "
                "is a zip-code-restricted applicant."
            )
            logger.warning(details)
            warnings.append(
                {
                    "source": "coverage_warning",
                    "license_number": m["license_number"],
                    "business_name": m["business_name"],
                    "zipcode": m["zipcode"] or "",
                    "details": details,
                    "file_name": file_name,
                }
            )

        if warnings:
            self.kv_store.set(const.LICENSE_JSON_DATA, records + warnings)
        return RunResult()
