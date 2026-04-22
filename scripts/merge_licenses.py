"""
Merges transform pipeline JSON output into licenses.json.

Maps from the scraper/transform pipeline's output format to the licenses.json
schema, filters to applicant entries only, deduplicates by license_number,
updates status on existing records, and appends new ones.
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
        return (d + relativedelta(years=2)).isoformat()
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

    # `records` is the single working list; entries added immediately so board-voted
    # records processed later can find and update them.
    records = existing

    # Build lookup: license_number -> index into `records`
    records_by_license: dict = {
        r["license_number"]: i for i, r in enumerate(records) if r.get("license_number")
    }

    added = 0
    updated = 0
    skipped = 0

    last_index: int = existing[-1]["index"] if existing else 0

    for record in new_records:
        raw_alcohol_type = record.get("alcohol_type")
        alcohol_type = ALCOHOL_TYPE_MAP.get(raw_alcohol_type or "")
        if not alcohol_type:
            skipped += 1
            continue

        # Zip code filter: only include Chapter 202 eligible zip codes
        zipcode = record.get("zipcode") or ""
        if zipcode not in ELIGIBLE_ZIPCODES:
            skipped += 1
            continue

        details = record.get("details") or ""
        is_board_voted = "board voted to approve" in details.lower()

        if not is_board_voted:
            details_lower = details.lower()

            # Chapter 202 took effect in 2024; earlier records are regular licenses
            minutes_date = record.get("minutes_date") or ""
            if minutes_date < "2024-01-01":
                skipped += 1
                continue

            # Airport licenses are not zip-code-restricted
            if "(airport)" in details_lower:
                skipped += 1
                continue

            # Only Common Victualler 7-Day licenses are zip-code-restricted under Chapter 202
            if "common victualler 7 day" not in details_lower:
                skipped += 1
                continue

        ln = record.get("license_number") or ""
        new_status = map_status(record.get("status"))

        if is_board_voted:
            # Board-voted records only update existing entries (Deferred -> Granted).
            # If the license isn't already tracked, skip — we missed the initial application.
            if ln and ln in records_by_license:
                idx = records_by_license[ln]
                old_status = records[idx]["status"]
                if old_status == "Deferred" and new_status == "Granted":
                    records[idx]["status"] = "Granted"
                    records[idx]["application_expiration_date"] = None
                    records[idx]["granted_date"] = record.get("minutes_date")
                    records[idx]["granted_file"] = record.get("file_name")
                    print(
                        f"Updated {ln} ({records[idx]['business_name']}): "
                        f"Deferred -> Granted"
                    )
                    updated += 1
            else:
                skipped += 1
        elif "applied" not in details.lower():
            # Only include new applications, not modifications to existing licenses.
            # New applicants have "applied" in their details; modifications say "Holder of ... petitioned".
            skipped += 1
        elif ln and ln in records_by_license:
            # Only advance status forward (Deferred -> Granted), never backwards.
            # A Granted record seen again as Deferred in an older PDF should not be reverted.
            idx = records_by_license[ln]
            old_status = records[idx]["status"]
            if old_status == "Deferred" and new_status == "Granted":
                records[idx]["status"] = "Granted"
                records[idx]["application_expiration_date"] = None
                records[idx]["granted_date"] = record.get("minutes_date")
                records[idx]["granted_file"] = record.get("file_name")
                print(
                    f"Updated {ln} ({records[idx]['business_name']}): "
                    f"Deferred -> Granted"
                )
                updated += 1
        else:
            minutes_date = record.get("minutes_date")
            file_name = record.get("file_name") or ""
            # If the record arrives already Granted (old hearing format where the board
            # voted during the same hearing), the grant date/file are the same as the
            # application hearing date/file.
            already_granted = new_status == "Granted"
            entry = {
                "index": None,  # assigned below
                "entity_number": record.get("entity_number") or "",
                "business_name": record.get("business_name") or "",
                "dba_name": record.get("dba_name"),
                "address": record.get("address") or "",
                "zipcode": zipcode,
                "license_number": ln,
                "status": new_status,
                "alcohol_type": alcohol_type,
                "minutes_date": minutes_date or "",
                "application_expiration_date": None
                if already_granted
                else compute_expiration(minutes_date),
                "file_name": file_name,
                "granted_date": minutes_date if already_granted else None,
                "granted_file": file_name if already_granted else None,
            }
            if not ln:
                print(
                    f"WARNING: No license_number for '{record.get('business_name')}' "
                    "— appending without match key"
                )
            # Add immediately and track index so later board-voted records can find this entry
            if ln:
                records_by_license[ln] = len(records)
            records.append(entry)
            added += 1

    # Re-assign sequential indexes across the full list
    for i, record in enumerate(records, start=1):
        record["index"] = i

    with open(licenses_json_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=4)

    print(f"Skipped {skipped} records (non-applicant or wrong alcohol type)")
    print(f"Updated {updated} existing records")
    print(f"Added {added} new licenses. Total: {len(records)}")
    return added + updated



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
        print(
            "WARNING: No new licenses were added — check that alcohol_type is populated"
        )


if __name__ == "__main__":
    main()
