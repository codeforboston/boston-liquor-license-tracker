"""Golden-output tests for the transform pipeline.

Runs the full pipeline on representative voting-minutes PDFs and compares the
result with saved reference output in tests/golden/. This catches changes in
extracted data from dependency updates (PyMuPDF, pikepdf, ...) or code
changes, which unit tests would not notice.

The PDFs live in Git LFS (scraper/scrape/data/voting_minutes_pdfs/). CI
downloads just the ones listed here; locally run `git lfs pull` if they are
pointer files.

If a change to the output is intended, regenerate the references and review
the diff before committing:

    UPDATE_GOLDEN=1 uv run --frozen --extra dev pytest tests/test_transform_golden.py
"""

import json
import os
from pathlib import Path

import pytest

from app.pipeline.pipeline import run_pipeline
from app.state.kv_store import KVStore

GOLDEN_DIR = Path(__file__).parent / "golden"
PDF_DIR = (
    Path(__file__).resolve().parents[2] / "scrape" / "data" / "voting_minutes_pdfs"
)

# One PDF per format or edge case the pipeline handles.
CASES = {
    "voting_minutes_2024-02-01": "'Granted, pending the availability of a license' (pre-Chapter 202)",
    "voting_minutes_2024-10-31": "batch of deferred zip-code applications",
    "voting_minutes_2025-02-13": "2025 batch board votes without license numbers, conditional approvals",
    "voting_minutes_2025-06-26": "2025 'voted to grant' batch votes",
    "voting_minutes_2025-10-01": "inline 'Granted a ZIP Code Restricted' grant",
    "voting_minutes_2026-03-05": "2026 batch votes with license numbers",
    "voting_minutes_2026-06-25": "inline grant whose address has no zip code",
    "voting_minutes_2026-07-16": "grants under Old and New Business",
    "voting_minutes_2026-08-18": "no transactional hearing (fallback scans only)",
    "voting_minutes_2026-09-24": "coverage warning for an application with no license number",
}


def _is_lfs_pointer(path: Path) -> bool:
    with path.open("rb") as f:
        return f.read(64).startswith(b"version https://git-lfs")


def _first_difference(expected: list, actual: list) -> str:
    if len(expected) != len(actual):
        return f"record count changed: {len(expected)} -> {len(actual)}"
    for i, (e, a) in enumerate(zip(expected, actual, strict=True)):
        if e != a:
            fields = sorted(k for k in set(e) | set(a) if e.get(k) != a.get(k))
            changes = "; ".join(
                f"{k}: {e.get(k)!r} -> {a.get(k)!r}" for k in fields[:4]
            )
            return f"record {i} ({e.get('license_number')}) changed: {changes}"
    return "outputs differ"


@pytest.mark.parametrize(
    "name", sorted(CASES), ids=lambda n: n.removeprefix("voting_minutes_")
)
def test_transform_output_matches_golden(name: str) -> None:
    pdf = PDF_DIR / f"{name}.pdf"
    if not pdf.exists() or _is_lfs_pointer(pdf):
        message = f"{pdf.name} is missing or an LFS pointer (run `git lfs pull`)"
        if os.environ.get("CI"):
            pytest.fail(message)
        pytest.skip(message)

    # Round-trip through JSON so the comparison matches what the CLI writes.
    actual = json.loads(json.dumps(run_pipeline(str(pdf), kv_store=KVStore())))
    golden = GOLDEN_DIR / f"{name}.json"

    if os.environ.get("UPDATE_GOLDEN"):
        GOLDEN_DIR.mkdir(exist_ok=True)
        golden.write_text(json.dumps(actual, indent=2, ensure_ascii=False) + "\n")
        pytest.skip(f"updated {golden.name}")

    expected = json.loads(golden.read_text())
    assert actual == expected, (
        f"{name} ({CASES[name]}): {_first_difference(expected, actual)}. "
        "If this change is intended, regenerate with UPDATE_GOLDEN=1 and review the diff."
    )
