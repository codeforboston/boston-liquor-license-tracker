import csv
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Local snapshot of Boston's Live SAM address data. The pipeline reads this
# committed file ONLY; it is refreshed out-of-band by the scheduled refresh
# (see refresh_sam_data.py), so extraction stays offline and deterministic.
# https://data.boston.gov/dataset/live-street-address-management-sam-addresses
SAM_DATA_PATH = Path(__file__).resolve().parents[3] / "data" / "sam_addresses.csv"

# Columns stored in the snapshot (also the refresh script's query outFields,
# kept in sync). IS_RANGE / RANGE_FROM / RANGE_TO drive range matching.
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


def _clean_number(value: str | None) -> str:
    """Normalize a numeric-ish field to a plain string ('1463.0' -> '1463')."""
    v = (value or "").strip()
    if v.endswith(".0"):
        v = v[:-2]
    return v


def _build_index(path: Path = SAM_DATA_PATH) -> dict:
    index: dict[tuple[str, str, str], tuple[str | None, str | None]] = {}
    if not path.exists():
        logger.warning(
            "SAM snapshot not found at %s; address enrichment disabled. "
            "Run `uv run python refresh_sam_data.py` to create it.",
            path,
        )
        return index

    def add(
        street_number: str | None,
        name: str | None,
        zipcode: str | None,
        value: tuple[str | None, str | None],
    ) -> None:
        key = _key(street_number, name, zipcode)
        if key not in index:  # first row wins
            index[key] = value

    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            name = row.get("FULL_STREET_NAME")
            zipcode = row.get("ZIP_CODE")
            sam_id = (row.get("SAM_ADDRESS_ID") or "").strip() or None
            building_id = (row.get("BUILDING_ID") or "").strip() or None
            value = (sam_id, building_id)

            # Exact street-number key.
            add(row.get("STREET_NUMBER"), name, zipcode, value)

            # For a range (e.g. 1463-1467), also index by its low end so a
            # parsed range address (reduced to its low end) resolves.
            if (row.get("IS_RANGE") or "").strip() == "1":
                range_from = _clean_number(row.get("RANGE_FROM"))
                if range_from:
                    add(range_from, name, zipcode, value)

    logger.info("Loaded %d SAM index entries from %s", len(index), path)
    return index


def get_index() -> dict:
    """Return the SAM index, built once per process from the local snapshot."""
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
