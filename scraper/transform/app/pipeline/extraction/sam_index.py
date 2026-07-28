import csv
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Local snapshot of Boston's Live SAM address data, produced by
# `refresh_sam_data.py`. Reading it locally keeps the extraction pipeline
# fully offline and deterministic; the snapshot is refreshed out-of-band
# (SAM addresses change infrequently).
SAM_DATA_PATH = Path(__file__).resolve().parents[3] / "data" / "sam_addresses.csv"

# Columns stored in the snapshot. Also the query `outFields` used by the
# refresh script, so the two stay in sync. RANGE_* / IS_RANGE are carried for
# a future range-matching improvement; only the first five are used today.
SAM_FIELDS = [
    "SAM_ADDRESS_ID",
    "BUILDING_ID",
    "STREET_NUMBER",
    "FULL_STREET_NAME",
    "ZIP_CODE",
    "IS_RANGE",
    "RANGE_FROM",
    "RANGE_TO",
]

# Memoized index, keyed by (street_number, FULL_STREET_NAME upper, zip).
_index: dict[tuple[str, str, str], tuple[str | None, str | None]] | None = None


def _key(
    street_number: str | None, full_street_name: str | None, zipcode: str | None
) -> tuple[str, str, str]:
    return (
        (street_number or "").strip(),
        (full_street_name or "").strip().upper(),
        (zipcode or "").strip(),
    )


def _build_index(path: Path = SAM_DATA_PATH) -> dict:
    index: dict[tuple[str, str, str], tuple[str | None, str | None]] = {}
    if not path.exists():
        logger.warning(
            "SAM snapshot not found at %s; address enrichment disabled. "
            "Run `uv run python refresh_sam_data.py` to create it.",
            path,
        )
        return index

    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            key = _key(
                row.get("STREET_NUMBER"),
                row.get("FULL_STREET_NAME"),
                row.get("ZIP_CODE"),
            )
            if key in index:
                continue  # first row wins (parity with the old take-first behavior)
            sam_id = (row.get("SAM_ADDRESS_ID") or "").strip() or None
            building_id = (row.get("BUILDING_ID") or "").strip() or None
            index[key] = (sam_id, building_id)

    logger.info("Loaded %d SAM addresses from %s", len(index), path)
    return index


def get_index() -> dict:
    """Return the SAM index, building it once on first use."""
    global _index
    if _index is None:
        _index = _build_index()
    return _index


def lookup(
    street_number: str, full_street_name: str, zipcode: str
) -> tuple[str | None, str | None]:
    """Exact-match lookup. Returns (sam_address_id, building_id), or
    (None, None) if there is no matching SAM address."""
    return get_index().get(_key(street_number, full_street_name, zipcode), (None, None))