"""Tests for app.pipeline.extraction.sam_index."""

import csv
from pathlib import Path

from app.pipeline.extraction import sam_index
from app.pipeline.extraction.sam_index import (
    SAM_FIELDS,
    _build_index,
    _clean_number,
    _key,
    lookup,
)


def _write_csv(path: Path, rows: list[dict]) -> None:
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=SAM_FIELDS)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def _row(**kwargs) -> dict:
    base = {field: "" for field in SAM_FIELDS}
    base.update(kwargs)
    return base


def test_key_normalizes_case_and_whitespace():
    assert _key(" 604 ", "blue hill ave", " 02121 ") == ("604", "BLUE HILL AVE", "02121")


def test_key_handles_none():
    assert _key(None, None, None) == ("", "", "")


def test_clean_number_strips_trailing_dot_zero():
    assert _clean_number("1463.0") == "1463"
    assert _clean_number("1463") == "1463"
    assert _clean_number(None) == ""


def test_exact_street_number_indexed(tmp_path):
    csv_path = tmp_path / "sam.csv"
    _write_csv(csv_path, [
        _row(SAM_ADDRESS_ID="100", BUILDING_ID="200", STREET_NUMBER="604",
             FULL_STREET_NAME="Blue Hill Ave", ZIP_CODE="02121", IS_RANGE="0"),
    ])
    index = _build_index(csv_path)
    assert index[("604", "BLUE HILL AVE", "02121")] == ("100", "200")


def test_range_indexed_by_range_from(tmp_path):
    csv_path = tmp_path / "sam.csv"
    _write_csv(csv_path, [
        _row(SAM_ADDRESS_ID="300", BUILDING_ID="400", STREET_NUMBER="1463-1467",
             FULL_STREET_NAME="Dorchester Ave", ZIP_CODE="02122",
             IS_RANGE="1", RANGE_FROM="1463", RANGE_TO="1467"),
    ])
    index = _build_index(csv_path)
    # Reachable both by the raw STREET_NUMBER and by the range low end.
    assert index[("1463-1467", "DORCHESTER AVE", "02122")] == ("300", "400")
    assert index[("1463", "DORCHESTER AVE", "02122")] == ("300", "400")


def test_non_range_row_gets_no_range_key(tmp_path):
    csv_path = tmp_path / "sam.csv"
    _write_csv(csv_path, [
        _row(SAM_ADDRESS_ID="1", BUILDING_ID="2", STREET_NUMBER="10",
             FULL_STREET_NAME="A St", ZIP_CODE="02127",
             IS_RANGE="0", RANGE_FROM="99"),  # RANGE_FROM ignored when not a range
    ])
    index = _build_index(csv_path)
    assert ("99", "A ST", "02127") not in index


def test_first_row_wins_on_duplicate_key(tmp_path):
    csv_path = tmp_path / "sam.csv"
    _write_csv(csv_path, [
        _row(SAM_ADDRESS_ID="1", BUILDING_ID="1", STREET_NUMBER="5",
             FULL_STREET_NAME="A St", ZIP_CODE="02127", IS_RANGE="0"),
        _row(SAM_ADDRESS_ID="2", BUILDING_ID="2", STREET_NUMBER="5",
             FULL_STREET_NAME="A St", ZIP_CODE="02127", IS_RANGE="0"),
    ])
    index = _build_index(csv_path)
    assert index[("5", "A ST", "02127")] == ("1", "1")


def test_missing_snapshot_returns_empty_index(tmp_path):
    index = _build_index(tmp_path / "does_not_exist.csv")
    assert index == {}


def test_lookup_hit_and_miss(tmp_path):
    csv_path = tmp_path / "sam.csv"
    _write_csv(csv_path, [
        _row(SAM_ADDRESS_ID="100", BUILDING_ID="200", STREET_NUMBER="604",
             FULL_STREET_NAME="Blue Hill Ave", ZIP_CODE="02121", IS_RANGE="0"),
    ])
    sam_index._index = _build_index(csv_path)  # inject so lookup skips file load
    try:
        assert lookup("604", "Blue Hill Ave", "02121") == ("100", "200")
        assert lookup("999", "Nowhere St", "00000") == (None, None)
        # lookup is case-insensitive on the street name
        assert lookup("604", "BLUE HILL AVE", "02121") == ("100", "200")
    finally:
        sam_index._index = None
