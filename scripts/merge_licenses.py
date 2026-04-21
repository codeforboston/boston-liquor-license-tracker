"""
Merges transform pipeline JSON output into licenses.json.

Maps from the scraper/transform pipeline's output format to the licenses.json
schema, filters to applicant entries only, deduplicates by license_number,
updates status on existing records, and appends new ones.
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


def dedup_existing(existing: list) -> tuple:
    """Remove duplicate license_number entries, keeping the first occurrence.
    Returns (deduped list, count of removed duplicates).
    """
    seen: dict = {}
    deduped = []
    removed = 0
    for record in existing:
        ln = record.get("license_number")
        if ln and ln in seen:
            removed += 1
        else:
            if ln:
                seen[ln] = True
            deduped.append(record)
    return deduped, removed


def merge_licenses(transform_json_path: str, licenses_json_path: str) -> int:
    with open(transform_json_path, "r", encoding="utf-8") as f:
        new_records: list[dict] = json.load(f)

    existing: list[dict] = []
    if os.path.exists(licenses_json_path):
        with open(licenses_json_path, "r", encoding="utf-8") as f:
            content = f.read().strip()
            if content:
                existing = json.loads(content)

    # Dedup existing records by license_number (keep first occurrence)
    existing, dupes_removed = dedup_existing(existing)
    if dupes_removed:
        print(f"Removed {dupes_removed} duplicate records from existing data")

    # Build lookup for match-and-update
    existing_by_license = {
        r["license_number"]: i
        for i, r in enumerate(existing)
        if r.get("license_number")
    }

    new_entries = []
    updated = 0
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

        ln = record.get("license_number") or ""
        new_status = map_status(record.get("status"))

        if ln and ln in existing_by_license:
            # Update status on existing record if it changed
            idx = existing_by_license[ln]
            old_status = existing[idx]["status"]
            if old_status != new_status:
                existing[idx]["status"] = new_status
                print(
                    f"Updated {ln} ({existing[idx]['business_name']}): "
                    f"{old_status} -> {new_status}"
                )
                updated += 1
        else:
            minutes_date = record.get("minutes_date")
            entry = {
                "index": None,  # assigned below
                "entity_number": record.get("entity_number") or "",
                "business_name": record.get("business_name") or "",
                "dba_name": record.get("dba_name"),
                "address": record.get("address") or "",
                "zipcode": record.get("zipcode") or "",
                "license_number": ln,
                "status": new_status,
                "alcohol_type": alcohol_type,
                "minutes_date": minutes_date or "",
                "application_expiration_date": compute_expiration(minutes_date),
                "file_name": record.get("file_name") or "",
            }
            if not ln:
                print(
                    f"WARNING: No license_number for '{record.get('business_name')}' "
                    "— appending without match key"
                )
            new_entries.append(entry)

    existing.extend(new_entries)

    # Re-assign sequential indexes across the full list
    for i, record in enumerate(existing, start=1):
        record["index"] = i

    with open(licenses_json_path, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=4)

    print(f"Skipped {skipped} records (non-applicant or wrong alcohol type)")
    print(f"Updated {updated} existing records")
    print(f"Added {len(new_entries)} new licenses. Total: {len(existing)}")
    return len(new_entries) + updated


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
        print("WARNING: No records were added or updated")


if __name__ == "__main__":
    main()
