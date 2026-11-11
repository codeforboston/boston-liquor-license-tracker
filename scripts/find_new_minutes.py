"""Pick the voting-minutes PDFs the data pipeline has not processed yet.

The scraper (scrape_license_board.yml) commits every minutes PDF to
scraper/scrape/data/voting_minutes_pdfs/ as voting_minutes_YYYY-MM-DD.pdf.
If the city posts a revised file for the same meeting, the scraper saves it
as voting_minutes_YYYY-MM-DD_v2.pdf (v3, ...).

This script lists the PDFs dated after last_processed_date.json, oldest
first, taking the newest version of each meeting. It writes their paths, one
per line, to --list-file, and prints `count=` and `latest-date=` lines in
GitHub Actions output format.
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import date, datetime
from pathlib import Path

PDF_NAME_RE = re.compile(r"^voting_minutes_(\d{4}-\d{2}-\d{2})(?:_v(\d+))?\.pdf$")


def find_new_minutes(pdf_dir: str | Path, last_processed: date) -> list[Path]:
    """PDFs for meetings after last_processed, oldest first, newest version each."""
    newest: dict[date, tuple[int, Path]] = {}
    for path in Path(pdf_dir).iterdir():
        match = PDF_NAME_RE.match(path.name)
        if not match:
            continue
        meeting = date.fromisoformat(match[1])
        if meeting <= last_processed:
            continue
        version = int(match[2] or 1)
        if meeting not in newest or version > newest[meeting][0]:
            newest[meeting] = (version, path)
    return [newest[meeting][1] for meeting in sorted(newest)]


def meeting_date(path: Path) -> date:
    match = PDF_NAME_RE.match(path.name)
    if not match:
        raise ValueError(f"Not a voting minutes PDF name: {path.name}")
    return date.fromisoformat(match[1])


def read_last_processed(path: str | Path) -> date:
    with open(path, encoding="utf-8") as f:
        return datetime.fromisoformat(json.load(f)["date"]).date()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--pdf-dir", required=True, help="Directory of minutes PDFs")
    parser.add_argument(
        "--last-processed", required=True, help="Path to last_processed_date.json"
    )
    parser.add_argument(
        "--list-file", required=True, help="Write the selected PDF paths here"
    )
    args = parser.parse_args()

    pdfs = find_new_minutes(args.pdf_dir, read_last_processed(args.last_processed))
    Path(args.list_file).write_text("".join(f"{pdf}\n" for pdf in pdfs))

    print(f"count={len(pdfs)}")
    if pdfs:
        # Same format updateLastProcessedDate.ts has always written
        print(f"latest-date={meeting_date(pdfs[-1]).isoformat()}T00:00:00.000Z")


if __name__ == "__main__":
    main()
