"""
Merges transform pipeline JSON output into licenses.json.

Maps from the scraper/transform pipeline's output format to the licenses.json
schema, filters to applicant entries only, and appends with sequential indexes.
"""

import argparse
import json
import os
import sys
from datetime import date
from pathlib import Path
from typing import Optional

from dateutil.relativedelta import relativedelta
from dotenv import load_dotenv

load_dotenv()

LICENSES_JSON = os.getenv("LICENSES_JSON")
ALCOHOL_TYPE_MAP = {
    "all alcoholic beverages": "All Alcoholic Beverages",
    "wines and malt beverages": "Wines and Malt Beverages",
    # title-case pass-through (in case pipeline output changes)
    "All Alcoholic Beverages": "All Alcoholic Beverages",
    "Wines and Malt Beverages": "Wines and Malt Beverages",
}
VALID_STATUSES = {"Deferred", "Granted"}


def map_status(status: Optional[str]) -> str:
    if status and status.lower() == "granted":
        return "Granted"
    return "Deferred"


def compute_expiration(minutes_date: Optional[str]) -> Optional[str]:
    if not minutes_date:
        return None
    try:
        d = date.fromisoformat(minutes_date)
        return (d + relativedelta(years=1)).isoformat()
    except ValueError:
        return None


def merge_licenses(transform_json_path: str, licenses_json_path: str) -> int:
    with open(transform_json_path, "r", encoding="utf-8") as f:
        new_records: list[dict] = json.load(f)

    existing: list[dict] = []
    if os.path.exists(licenses_json_path):
        with open(licenses_json_path, "r", encoding="utf-8") as f:
            content = f.read().strip()
            if content:
                existing = json.loads(content)

    last_index: int = existing[-1]["index"] if existing else 0

    new_entries = []
    skipped = 0
    for record in new_records:
        raw_alcohol_type = record.get("alcohol_type")
        alcohol_type = ALCOHOL_TYPE_MAP.get(raw_alcohol_type or "")
        if not alcohol_type:
            skipped += 1
            continue

        # Only include new applications, not modifications to existing licenses.
        # New applicants have "applied" in their details; modifications say "Holder of ... petitioned".
        details = record.get("details") or ""
        if "applied" not in details.lower():
            skipped += 1
            continue

        minutes_date = record.get("minutes_date")
        entry = {
            "index": None,  # assigned below
            "entity_number": record.get("entity_number") or "",
            "business_name": record.get("business_name") or "",
            "dba_name": record.get("dba_name"),
            "address": record.get("address") or "",
            "zipcode": record.get("zipcode") or "",
            "license_number": record.get("license_number") or "",
            "status": map_status(record.get("status")),
            "alcohol_type": alcohol_type,
            "minutes_date": minutes_date or "",
            "application_expiration_date": compute_expiration(minutes_date),
            "file_name": record.get("file_name") or "",
        }
        new_entries.append(entry)

    for i, entry in enumerate(new_entries, start=last_index + 1):
        entry["index"] = i

    existing.extend(new_entries)

    with open(licenses_json_path, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=4)

    print(f"Skipped {skipped} records (non-applicant alcohol type)")
    print(f"Added {len(new_entries)} new licenses. Total: {len(existing)}")
    return len(new_entries)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Merge transform pipeline JSON output into licenses.json"
    )
    parser.add_argument(
        "--input", required=True, help="Path to transform pipeline JSON output"
    )
    parser.add_argument(
        "--licenses",
        help="Path to licenses.json (defaults to LICENSES_JSON env var relative to repo root)",
    )
    args = parser.parse_args()

    if args.licenses:
        licenses_path = args.licenses
    elif LICENSES_JSON:
        # Resolve relative to repo root (one level up from scripts/)
        licenses_path = str(Path(__file__).resolve().parent.parent / LICENSES_JSON)
    else:
        print(
            "ERROR: No licenses path provided. Set LICENSES_JSON env var or use --licenses"
        )
        sys.exit(1)

    count = merge_licenses(args.input, licenses_path)
    if count == 0:
        print(
            "WARNING: No new licenses were added — check that alcohol_type is populated"
        )


if __name__ == "__main__":
    main()
