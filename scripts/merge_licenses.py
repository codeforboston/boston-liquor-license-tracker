"""
Merges transform pipeline JSON output into licenses.json.

Maps from the scraper/transform pipeline's output format to the licenses.json
schema, filters to Chapter 202 (zip-code-restricted) applicants, deduplicates by
license_number, updates status on existing records, and appends new ones.

Status rules
------------
* A new application is recorded as Granted only when the grant text says it is a
  Zip Code Restricted license. A plain "Granted" (or "Granted, pending the
  availability of a license") on a new application is a general-quota or other
  special-legislation license and is skipped.
* Rejected / withdrawn / denied applications are skipped.
* Board approvals (``source == "board_vote"`` records from the transform
  pipeline) move a Deferred/Expired application to Granted. They are matched by
  license number, or — because batch votes usually omit it — by zip code,
  business name and hearing date.
* Approvals "on the condition that the Licensee surrenders the existing ...
  license" are NOT counted as Granted; a note is added instead.
* Deferred applications past their application_expiration_date become Expired.

Manual corrections
------------------
``scripts/data/license_corrections.json`` is applied on every run, after the
merge, so hand fixes survive future pipeline runs:

* ``exclude``   – license numbers that are not Chapter 202 licenses (or were
                  surrendered/cancelled); removed and never re-added.
* ``overrides`` – field values forced onto a record (e.g. status, alcohol_type,
                  notes).
* ``add``       – records the pipeline missed; inserted if not present.
"""

import argparse
import difflib
import json
import os
import re
import sys
from datetime import date
from pathlib import Path

from dateutil.relativedelta import relativedelta
from dotenv import load_dotenv

load_dotenv()

LICENSES_JSON = os.getenv("LICENSES_JSON")
DEFAULT_CORRECTIONS = (
    Path(__file__).resolve().parent / "data" / "license_corrections.json"
)

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

ZIP_RESTRICTED_RE = re.compile(r"zip\s*code\s+restric", re.IGNORECASE)
ZIP_FROM_GRANT_RE = re.compile(r"(\d{5})\s+zip\s*code\s+restric", re.IGNORECASE)

# Board-vote name matching (used only when the vote has no license number)
NAME_MATCH_THRESHOLD = 0.85
NAME_MATCH_WITH_EVIDENCE = 0.6
HEARING_DATE_WINDOW_DAYS = 45

CONDITIONAL_NOTE = (
    "Board approved a zip-code-restricted license on {date} on the condition that "
    "the licensee surrender its existing license; not counted as Granted unless "
    "the restricted license is confirmed issued."
)

FIELD_ORDER = [
    "index",
    "entity_number",
    "business_name",
    "dba_name",
    "address",
    "zipcode",
    "license_number",
    "status",
    "alcohol_type",
    "minutes_date",
    "application_expiration_date",
    "file_name",
    "granted_date",
    "granted_file",
    "notes",
]


CV7_RE = re.compile(r"common victualler 7[\s-]day", re.IGNORECASE)
DUPLICATE_NAME_THRESHOLD = 0.9


def new_stats() -> dict:
    return {
        "added": 0,
        "updated": 0,
        "skipped": 0,
        "expired": 0,
        "changes": [],  # human-readable list of data changes
        "review": [],  # items a person should look at
    }


def _change(stats: dict, message: str) -> None:
    print(message)
    stats["changes"].append(message)


def _review(stats: dict, message: str) -> None:
    print(f"REVIEW: {message}")
    stats["review"].append(message)


def compute_expiration(minutes_date: str | None) -> str | None:
    if not minutes_date:
        return None
    try:
        d = date.fromisoformat(minutes_date)
        return (d + relativedelta(years=2)).isoformat()
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


def application_status(record: dict) -> str | None:
    """Map a transform-pipeline application record to Granted / Deferred / None (skip)."""
    status = (record.get("status") or "").lower()
    detail = record.get("status_detail") or ""
    detail_lower = detail.lower()

    if status in {"rejected", "withdrawn"} or "denied" in detail_lower:
        return None
    if status == "granted":
        return "Granted" if ZIP_RESTRICTED_RE.search(detail) else None
    return "Deferred"


def infer_zipcode(record: dict) -> str:
    zipcode = record.get("zipcode") or ""
    if zipcode:
        return zipcode
    for field in ("status_detail", "details"):
        m = ZIP_FROM_GRANT_RE.search(record.get(field) or "")
        if m:
            return m.group(1)
    return ""


# --------------------------------------------------------------------------- #
# Board-vote matching
# --------------------------------------------------------------------------- #

_NAME_SUFFIXES = re.compile(
    r"\b(llc|inc|corp|corporation|co|company|ltd|the|dba)\b", re.IGNORECASE
)


def _norm_name(value: str | None) -> str:
    if not value:
        return ""
    value = value.replace("’", "'").lower()
    value = _NAME_SUFFIXES.sub(" ", value)
    return re.sub(r"[^a-z0-9]", "", value)


def _name_similarity(vote: dict, record: dict) -> float:
    best = 0.0
    for a in (vote.get("dba_name"), vote.get("business_name")):
        for b in (record.get("dba_name"), record.get("business_name")):
            na, nb = _norm_name(a), _norm_name(b)
            if na and nb:
                best = max(best, difflib.SequenceMatcher(None, na, nb).ratio())
    return best


def _street_number(address: str | None) -> str | None:
    m = re.match(r"\s*(\d+[A-Za-z]?)", address or "")
    return m.group(1) if m else None


def _days_apart(a: str | None, b: str | None) -> int | None:
    try:
        return abs((date.fromisoformat(a) - date.fromisoformat(b)).days)
    except (TypeError, ValueError):
        return None


def find_vote_match(
    vote: dict, records: list[dict], stats: dict | None = None
) -> dict | None:
    """Find the application a license-number-less vote refers to."""
    hearing = vote.get("hearing_date")
    vote_street = _street_number(vote.get("address"))

    def candidates(same_zip_only: bool) -> list[tuple[float, dict]]:
        scored = []
        for r in records:
            if same_zip_only and r.get("zipcode") != vote.get("zipcode"):
                continue
            gap = _days_apart(hearing, r.get("minutes_date"))
            if hearing and (gap is None or gap > HEARING_DATE_WINDOW_DAYS):
                continue
            sim = _name_similarity(vote, r)
            street_match = vote_street and vote_street == _street_number(
                r.get("address")
            )
            date_match = gap is not None and gap <= 3
            if sim >= NAME_MATCH_THRESHOLD or (
                sim >= NAME_MATCH_WITH_EVIDENCE and (street_match or date_match)
            ):
                scored.append(
                    (sim + (0.1 if street_match else 0) + (0.1 if date_match else 0), r)
                )
        return sorted(scored, key=lambda x: -x[0])

    # Vote zip codes are occasionally wrong in the minutes, so fall back to all zips.
    for same_zip in (True, False):
        found = candidates(same_zip)
        if found:
            if len(found) > 1 and found[0][0] == found[1][0]:
                label = vote.get("dba_name") or vote.get("business_name")
                if stats is not None:
                    _review(
                        stats,
                        f"Ambiguous board-vote match for '{label}' "
                        f"({vote.get('file_name')}); not applied.",
                    )
                return None
            return found[0][1]
    return None


def grant(record: dict, minutes_date: str | None, file_name: str | None) -> None:
    record["status"] = "Granted"
    record["application_expiration_date"] = None
    record["granted_date"] = minutes_date
    record["granted_file"] = file_name


# --------------------------------------------------------------------------- #
# Corrections
# --------------------------------------------------------------------------- #


def load_corrections(path: str | Path | None) -> dict:
    if not path or not os.path.exists(path):
        return {"exclude": {}, "overrides": {}, "add": []}
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    return {
        "exclude": data.get("exclude", {}),
        "overrides": data.get("overrides", {}),
        "add": data.get("add", []),
    }


def apply_corrections(records: list[dict], corrections: dict) -> list[dict]:
    excluded = corrections["exclude"]
    records = [r for r in records if r.get("license_number") not in excluded]

    present = {r.get("license_number") for r in records}
    for addition in corrections["add"]:
        if (
            addition.get("license_number") not in present
            and addition.get("license_number") not in excluded
        ):
            records.append(dict(addition))
            present.add(addition.get("license_number"))

    for r in records:
        override = corrections["overrides"].get(r.get("license_number"))
        if override:
            r.update({k: v for k, v in override.items() if not k.startswith("_")})
    return records


def expire_stale(records: list[dict], today: date, stats: dict) -> int:
    expired = 0
    for r in records:
        exp = r.get("application_expiration_date")
        if r.get("status") == "Deferred" and exp and exp < today.isoformat():
            r["status"] = "Expired"
            expired += 1
            _change(
                stats,
                f"Expired {r.get('license_number')} "
                f"({r.get('dba_name') or r.get('business_name')}): application "
                f"expired {exp}",
            )
    return expired


def flag_possible_duplicates(records: list[dict], stats: dict) -> None:
    """Flag the same business holding more than one active record in a zip code."""
    active = [r for r in records if r.get("status") in {"Deferred", "Granted"}]
    for i, a in enumerate(active):
        for b in active[i + 1 :]:
            if a.get("zipcode") != b.get("zipcode"):
                continue
            if _name_similarity(a, b) >= DUPLICATE_NAME_THRESHOLD:
                _review(
                    stats,
                    f"Possible duplicate: {a.get('license_number')} and "
                    f"{b.get('license_number')} "
                    f"({a.get('dba_name') or a.get('business_name')}, "
                    f"{a.get('zipcode')}) are both {a.get('status')}/"
                    f"{b.get('status')}. If one replaces the other, exclude it "
                    "in license_corrections.json.",
                )


def _ordered(record: dict) -> dict:
    """Return the record with a stable key order; drop empty notes."""
    out = {k: record[k] for k in FIELD_ORDER if k in record}
    if not out.get("notes"):
        out.pop("notes", None)
    return out


# --------------------------------------------------------------------------- #
# Merge
# --------------------------------------------------------------------------- #


def merge_records(
    new_records: list[dict],
    existing: list[dict],
    corrections: dict | None = None,
    today: date | None = None,
    expire: bool = True,
) -> tuple[list[dict], dict]:
    corrections = corrections or {"exclude": {}, "overrides": {}, "add": []}
    today = today or date.today()
    stats = new_stats()

    existing, dupes_removed = dedup_existing(existing)
    if dupes_removed:
        _change(stats, f"Removed {dupes_removed} duplicate records from existing data")

    excluded = corrections["exclude"]
    records = [r for r in existing if r.get("license_number") not in excluded]
    records_by_license = {
        r["license_number"]: r for r in records if r.get("license_number")
    }

    for record in new_records:
        ln = record.get("license_number") or ""
        if ln in excluded:
            stats["skipped"] += 1
            continue

        alcohol_type = ALCOHOL_TYPE_MAP.get(record.get("alcohol_type") or "")
        zipcode = infer_zipcode(record)

        if record.get("source") == "coverage_warning":
            # Already tracked (or deliberately excluded) licenses need no review.
            if not (ln and ln in records_by_license):
                _review(stats, record.get("details") or "Coverage warning")
            continue

        if record.get("source") == "board_vote":
            _apply_board_vote(
                record, records, records_by_license, zipcode, alcohol_type, stats
            )
            continue

        if not alcohol_type or zipcode not in ELIGIBLE_ZIPCODES:
            stats["skipped"] += 1
            continue

        details_lower = (record.get("details") or "").lower()

        # Chapter 202 took effect in 2024; earlier records are regular licenses
        minutes_date = record.get("minutes_date") or ""
        if minutes_date < "2024-01-01":
            stats["skipped"] += 1
            continue

        # Airport licenses are not zip-code-restricted
        if "(airport)" in details_lower:
            stats["skipped"] += 1
            continue

        # Only Common Victualler 7-Day licenses are zip-code-restricted under Chapter 202
        if not CV7_RE.search(details_lower):
            stats["skipped"] += 1
            continue

        # Only include new applications, not modifications to existing licenses.
        # New applicants have "applied" in their details; modifications say "Holder of ... petitioned".
        if "applied" not in details_lower:
            stats["skipped"] += 1
            continue

        new_status = application_status(record)
        if new_status is None:
            stats["skipped"] += 1
            continue

        if ln and ln in records_by_license:
            # Only advance status forward (Deferred/Expired -> Granted), never backwards.
            existing_record = records_by_license[ln]
            if new_status == "Granted" and existing_record["status"] in {
                "Deferred",
                "Expired",
            }:
                grant(existing_record, minutes_date, record.get("file_name"))
                _change(stats, f"Granted {ln} ({existing_record['business_name']})")
                stats["updated"] += 1
            continue

        if not ln:
            # licenses.json is keyed by license number; a person must add these.
            _review(
                stats,
                f"Application with no license number in the minutes: "
                f"'{record.get('dba_name') or record.get('business_name')}' "
                f"({zipcode}, {record.get('file_name')}, status {new_status}). "
                "Add it via license_corrections.json once the number is known.",
            )
            stats["skipped"] += 1
            continue

        file_name = record.get("file_name") or ""
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
            "minutes_date": minutes_date,
            "application_expiration_date": None
            if already_granted
            else compute_expiration(minutes_date),
            "file_name": file_name,
            "granted_date": minutes_date if already_granted else None,
            "granted_file": file_name if already_granted else None,
        }
        records_by_license[ln] = entry
        records.append(entry)
        stats["added"] += 1
        _change(
            stats,
            f"Added {ln} ({entry['dba_name'] or entry['business_name']}, "
            f"{zipcode}): {new_status}",
        )

    records = apply_corrections(records, corrections)
    if expire:
        stats["expired"] = expire_stale(records, today, stats)
    flag_possible_duplicates(records, stats)

    for i, record in enumerate(records, start=1):
        record["index"] = i
    return [_ordered(r) for r in records], stats


def _apply_board_vote(
    vote: dict,
    records: list[dict],
    records_by_license: dict,
    zipcode: str,
    alcohol_type: str | None,
    stats: dict,
) -> None:
    ln = vote.get("license_number") or ""
    label = vote.get("dba_name") or vote.get("business_name") or ln
    target = records_by_license.get(ln) if ln else find_vote_match(vote, records, stats)

    if (
        target is None
        and ln
        and zipcode in ELIGIBLE_ZIPCODES
        and alcohol_type
        and not vote.get("conditional")
    ):
        # An explicit zip-code-restricted approval for a license we never saw applied for.
        minutes_date = vote.get("hearing_date") or vote.get("minutes_date") or ""
        entry = {
            "index": None,
            "entity_number": "",
            "business_name": vote.get("business_name") or "",
            "dba_name": vote.get("dba_name"),
            "address": vote.get("address") or "",
            "zipcode": zipcode,
            "license_number": ln,
            "status": "Granted",
            "alcohol_type": alcohol_type,
            "minutes_date": minutes_date,
            "application_expiration_date": None,
            "file_name": vote.get("file_name") or "",
            "granted_date": vote.get("minutes_date"),
            "granted_file": vote.get("file_name"),
        }
        records.append(entry)
        records_by_license[ln] = entry
        _change(stats, f"Added {ln} ({label}, {zipcode}) from board vote: Granted")
        stats["added"] += 1
        return

    if target is None:
        _review(
            stats,
            f"Board vote for '{label}' ({zipcode}, {vote.get('file_name')}) did not "
            "match any tracked application. If it is a new zip-restricted license, "
            "add it via license_corrections.json.",
        )
        stats["skipped"] += 1
        return

    if vote.get("conditional"):
        note = CONDITIONAL_NOTE.format(date=vote.get("minutes_date"))
        if target.get("status") != "Granted" and target.get("notes") != note:
            target["notes"] = note
            _review(
                stats,
                f"Conditional approval for {target['license_number']} ({label}): "
                "approved on condition of surrendering an existing license. Left as "
                f"{target.get('status')}; set Granted via overrides if it is issued.",
            )
        stats["skipped"] += 1
        return

    if target.get("status") in {"Deferred", "Expired"}:
        grant(target, vote.get("minutes_date"), vote.get("file_name"))
        _change(stats, f"Granted {target['license_number']} ({label}) by board vote")
        stats["updated"] += 1


def write_report(
    path: str | Path, stats: dict, records: list[dict], source: str
) -> None:
    """Write a Markdown summary used as the pull-request body."""
    granted = sum(1 for r in records if r.get("status") == "Granted")
    lines = [
        "This PR updates the liquor license applicant data.",
        "",
        f"- Source: {source}",
        f"- Added: {stats['added']} · Updated: {stats['updated']} · "
        f"Expired: {stats['expired']}",
        f"- Zip-code-restricted licenses granted (total): {granted}",
        "",
    ]
    if stats["review"]:
        lines += ["## Needs review", ""]
        lines += [f"- [ ] {m}" for m in stats["review"]]
        lines.append("")
    lines += ["## Changes", ""]
    lines += [f"- {m}" for m in stats["changes"]] or ["- No data changes"]
    lines += [
        "",
        "Auto-generated by the Liquor License Data GitHub Action. Manual fixes go in "
        "`scripts/data/license_corrections.json`.",
    ]
    Path(path).write_text("\n".join(lines) + "\n", encoding="utf-8")


def merge_licenses(
    transform_json_path: str | None,
    licenses_json_path: str,
    corrections_path: str | Path | None = DEFAULT_CORRECTIONS,
    report_path: str | Path | None = None,
    expire: bool = True,
) -> int:
    new_records: list[dict] = []
    if transform_json_path:
        with open(transform_json_path, encoding="utf-8") as f:
            new_records = json.load(f)

    existing: list[dict] = []
    if os.path.exists(licenses_json_path):
        with open(licenses_json_path, encoding="utf-8") as f:
            content = f.read().strip()
            if content:
                existing = json.loads(content)

    records, stats = merge_records(
        new_records, existing, load_corrections(corrections_path), expire=expire
    )

    with open(licenses_json_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=4)

    if report_path:
        pdfs = sorted({r.get("file_name") for r in new_records if r.get("file_name")})
        source = (
            ", ".join(pdfs) if pdfs else "corrections and expirations only (no new PDF)"
        )
        write_report(report_path, stats, records, source)

    print(
        f"Skipped {stats['skipped']} records (non-applicant, not zip-restricted, or unmatched)"
    )
    print(f"Updated {stats['updated']} existing records")
    print(f"Expired {stats['expired']} deferred applications")
    print(f"Added {stats['added']} new licenses. Total: {len(records)}")
    print(f"Items needing review: {len(stats['review'])}")
    return stats["added"] + stats["updated"] + stats["expired"]


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Merge transform pipeline JSON output into licenses.json"
    )
    parser.add_argument(
        "--input",
        help="Path to transform pipeline JSON output (omit to only apply corrections and expirations)",
    )
    parser.add_argument(
        "--licenses",
        help="Path to licenses.json (defaults to LICENSES_JSON env var relative to repo root)",
    )
    parser.add_argument(
        "--corrections",
        default=str(DEFAULT_CORRECTIONS),
        help="Path to manual corrections JSON (default: scripts/data/license_corrections.json)",
    )
    parser.add_argument(
        "--no-expire",
        action="store_true",
        help="Do not mark overdue Deferred applications as Expired (used by CI checks)",
    )
    parser.add_argument(
        "--report",
        help="Write a Markdown summary of changes and review items to this path",
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

    count = merge_licenses(
        args.input,
        licenses_path,
        args.corrections,
        args.report,
        expire=not args.no_expire,
    )
    if count == 0:
        print("WARNING: No records were added or updated")


if __name__ == "__main__":
    main()
