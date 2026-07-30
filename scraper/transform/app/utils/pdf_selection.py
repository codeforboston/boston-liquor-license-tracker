"""Select one voting-minutes PDF per meeting.

The scrape step tracks every revision of a meeting's minutes
(`voting_minutes_YYYY-MM-DD_vN.pdf`), so a directory can contain many
versions of the same meeting. Processing all of them produces duplicate
license records. This filter keeps only the latest version per meeting date
and drops malformed template names (e.g. `voting_minutes_yyyy-mm-dd.pdf`).
"""

import re
from datetime import datetime

# voting_minutes_YYYY-MM-DD  with an optional _vN suffix
_MEETING_PATTERN = re.compile(r"^voting_minutes_(\d{4}-\d{2}-\d{2})(?:_v(\d+))?\.pdf$")
_MEETING_PREFIX = "voting_minutes_"


def _parse(filename: str) -> tuple[str, int] | None:
    """Return (date, version) for a versioned meeting file, else None.

    A file with no `_vN` suffix is treated as version -1 (lowest), so any
    real version wins over it. Names that look like meeting files but carry
    an invalid date (e.g. the `yyyy-mm-dd` template) return None.
    """
    match = _MEETING_PATTERN.match(filename)
    if not match:
        return None
    date_str, version = match.group(1), match.group(2)
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        return None  # digits but not a real date, e.g. 2024-13-45
    return date_str, int(version) if version is not None else -1


def select_latest_versions(filenames: list[str]) -> list[str]:
    """Keep only the highest-versioned PDF per meeting date.

    - Versioned meeting files are grouped by date; only the max `_vN` is kept.
    - Malformed `voting_minutes_*` names (bad/placeholder dates) are dropped.
    - Any other filenames are passed through unchanged.

    Returns a sorted list for deterministic processing order.
    """
    best: dict[str, tuple[int, str]] = {}  # date -> (version, filename)
    passthrough: list[str] = []

    for name in filenames:
        parsed = _parse(name)
        if parsed is None:
            # Malformed meeting template -> drop; unrelated file -> keep.
            if not name.startswith(_MEETING_PREFIX):
                passthrough.append(name)
            continue
        date_str, version = parsed
        if date_str not in best or version > best[date_str][0]:
            best[date_str] = (version, name)

    selected = [filename for _, filename in best.values()] + passthrough
    return sorted(selected)
