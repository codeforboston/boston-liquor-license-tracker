"""Apply a license correction submitted through a GitHub issue form.

The project sponsor corrects license data without editing JSON. They fill in
one of two issue forms (.github/ISSUE_TEMPLATE/correct-license.yml or
add-license.yml). The license-correction workflow passes the issue body to
this script, which:

* parses the form,
* checks every value (license exists, dates are real, zip code is eligible...),
* writes the change to scripts/data/license_corrections.json (and, to show a
  hidden license again, restores its record in licenses.json from git history),
* writes a plain-English reply for the issue to --reply-file.

It prints `ok=true` or `ok=false` in GitHub Actions output format. A rejected
submission is not an error: the reply explains what to fix. The workflow then
runs merge_licenses.py to apply the corrections file to licenses.json.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from collections.abc import Callable
from datetime import date
from pathlib import Path

from dateutil import parser as dateparser

from find_new_minutes import PDF_NAME_RE
from merge_licenses import ELIGIBLE_ZIPCODES, compute_expiration

REPO_ROOT = Path(__file__).resolve().parent.parent
CORRECTIONS_JSON = REPO_ROOT / "scripts" / "data" / "license_corrections.json"
LICENSES_JSON = REPO_ROOT / "client" / "src" / "data" / "licenses.json"
PDF_DIR = REPO_ROOT / "scraper" / "scrape" / "data" / "voting_minutes_pdfs"

LICENSE_RE = re.compile(r"^LB-\d+$")
ZIP_IN_ADDRESS_RE = re.compile(r"\b(\d{5})(?:-\d{4})?\s*$")
NONE_WORDS = {"none", "blank", "clear", "n/a", "na", "-"}
STATUSES = ["Granted", "Deferred", "Expired"]
ALCOHOL_TYPES = ["All Alcoholic Beverages", "Wines and Malt Beverages"]

# "Which detail?" dropdown label -> licenses.json field
FIELDS = {
    "Status": "status",
    "Date granted": "granted_date",
    "Business name": "business_name",
    "Doing business as (DBA) name": "dba_name",
    "Address": "address",
    "Zip code": "zipcode",
    "Alcohol type": "alcohol_type",
    "Hearing date": "minutes_date",
    "Application expiration date": "application_expiration_date",
    "Item number in the voting minutes": "entity_number",
    "Note": "notes",
}
LABELS = {v: k for k, v in FIELDS.items()}


class Rejected(Exception):
    """A submission that cannot be applied; the message is shown to the submitter."""


# --------------------------------------------------------------------------- #
# Parsing
# --------------------------------------------------------------------------- #


def parse_issue_form(body: str) -> dict[str, str | None]:
    """Map each `### Label` heading of an issue-form body to its answer."""
    answers: dict[str, str | None] = {}
    label = None
    lines: list[str] = []
    for line in (body or "").replace("\r\n", "\n").split("\n"):
        if line.startswith("### "):
            if label is not None:
                answers[label] = _answer(lines)
            label, lines = line[4:].strip(), []
        elif label is not None:
            lines.append(line)
    if label is not None:
        answers[label] = _answer(lines)
    return answers


def _answer(lines: list[str]) -> str | None:
    text = "\n".join(lines).strip()
    return None if text in {"", "_No response_"} else text


def _required(form: dict, label: str) -> str:
    value = form.get(label)
    if not value:
        raise Rejected(f'"{label}" is empty. Please fill it in.')
    return value


def _is_none(value: str | None) -> bool:
    return value is None or value.strip().lower() in NONE_WORDS


# --------------------------------------------------------------------------- #
# Value checks
# --------------------------------------------------------------------------- #


def parse_date(value: str, label: str) -> str:
    try:
        parsed = dateparser.parse(value.strip(), default=None)
    except (ValueError, OverflowError, TypeError):
        parsed = None
    if parsed is None:
        raise Rejected(
            f'I couldn\'t read "{value}" as a date for "{label}". '
            "Try a format like 2025-02-13 or Feb 13, 2025."
        )
    if parsed.year < 2024 or parsed.year > date.today().year + 3:
        raise Rejected(f'"{value}" doesn\'t look like a likely date for "{label}".')
    return parsed.date().isoformat()


def parse_license_number(value: str) -> str:
    ln = re.sub(r"\s+", "", value).upper()
    if re.fullmatch(r"\d+", ln):
        ln = f"LB-{ln}"
    ln = ln.replace("LB", "LB-", 1).replace("LB--", "LB-")
    if not LICENSE_RE.match(ln):
        raise Rejected(
            f'"{value}" doesn\'t look like a license number. They look like LB-574154.'
        )
    return ln


def parse_zip(value: str) -> str:
    zipcode = value.strip()
    if not re.fullmatch(r"\d{5}", zipcode):
        raise Rejected(f'"{value}" isn\'t a five-digit zip code.')
    if zipcode not in ELIGIBLE_ZIPCODES:
        raise Rejected(
            f"{zipcode} isn't one of the zip codes eligible for these licenses "
            f"({', '.join(sorted(ELIGIBLE_ZIPCODES))})."
        )
    return zipcode


def parse_choice(value: str, choices: list[str], label: str) -> str:
    wanted = value.strip().lower()
    matches = [c for c in choices if c.lower().startswith(wanted[:3])]
    exact = [c for c in choices if c.lower() == wanted]
    if exact:
        return exact[0]
    if len(matches) == 1 and wanted:
        return matches[0]
    raise Rejected(
        f'"{value}" isn\'t a valid {label}. Use one of: {", ".join(choices)}.'
    )


def minutes_file_for(iso_date: str, pdf_dir: Path) -> str | None:
    """Newest committed voting-minutes PDF for that meeting date, if any."""
    best: tuple[int, str] | None = None
    for path in pdf_dir.glob(f"voting_minutes_{iso_date}*.pdf"):
        match = PDF_NAME_RE.match(path.name)
        if match and match.group(1) == iso_date:
            version = int(match.group(2) or 1)
            if best is None or version > best[0]:
                best = (version, path.name)
    return best[1] if best else None


def _name(record: dict) -> str:
    return record.get("dba_name") or record.get("business_name") or "this license"


def _show(value) -> str:
    return "(blank)" if value in (None, "") else str(value)


# --------------------------------------------------------------------------- #
# Corrections
# --------------------------------------------------------------------------- #


def _reason(form: dict, issue_number: int) -> str:
    reason = " ".join(_required(form, "Why?").split())
    source = " ".join(_required(form, "Source").split())
    return f"{reason} Source: {source}. (issue #{issue_number})"


def change_detail(
    form: dict,
    ln: str,
    corrections: dict,
    records: dict[str, dict],
    issue_number: int,
    pdf_dir: Path,
) -> list[str]:
    record = records.get(ln)
    if record is None:
        raise Rejected(
            f"{ln} isn't on the site."
            + (
                ' It is hidden; choose "Show a hidden license again" first.'
                if ln in corrections["exclude"]
                else ' To add it, use the "Add a missing license" form.'
            )
        )
    label = _required(form, "Which detail?")
    if label not in FIELDS:
        raise Rejected(f'"{label}" isn\'t a detail that can be changed here.')
    field = FIELDS[label]
    raw = form.get("New value")
    nullable = field in {
        "dba_name",
        "notes",
        "granted_date",
        "application_expiration_date",
        "entity_number",
    }
    if raw is None:
        raise Rejected(f'"New value" is empty. What should the {label.lower()} be?')
    if _is_none(raw):
        if not nullable:
            raise Rejected(f"The {label.lower()} can't be cleared.")
        value = "" if field == "entity_number" else None
    elif field in {"granted_date", "minutes_date", "application_expiration_date"}:
        value = parse_date(raw, label)
    elif field == "status":
        value = parse_choice(raw, STATUSES, "status")
    elif field == "alcohol_type":
        value = parse_choice(raw, ALCOHOL_TYPES, "alcohol type")
    elif field == "zipcode":
        value = parse_zip(raw)
    elif field == "entity_number":
        value = raw.strip().lstrip("#")
        if not value.isdigit():
            raise Rejected(f'The item number should be digits only, not "{raw}".')
    else:
        value = " ".join(raw.split())
        if field == "address" and len(value) < 5:
            raise Rejected(f'"{raw}" is too short to be an address.')

    if record.get(field) == value:
        raise Rejected(
            f"The {label.lower()} for {_name(record)} is already {_show(value)}."
        )

    changes = {field: value}
    notes: list[str] = []
    status = changes.get("status", record.get("status"))

    if field == "address":
        match = ZIP_IN_ADDRESS_RE.search(value)
        if match and match.group(1) != record.get("zipcode"):
            changes["zipcode"] = parse_zip(match.group(1))
            notes.append(
                f"Zip code updated to {changes['zipcode']} to match the address."
            )

    if field == "status" and value == "Granted":
        if not record.get("granted_date"):
            raise Rejected(
                f'{_name(record)} has no "Date granted" yet. Submit the date granted '
                "first, then change the status."
            )
        changes["application_expiration_date"] = None
    elif field == "status":
        changes["granted_date"] = None
        changes["granted_file"] = None
        if value == "Deferred":
            changes["application_expiration_date"] = compute_expiration(
                record.get("minutes_date")
            )
        if record.get("granted_date"):
            notes.append(
                "The date granted was cleared because it is no longer Granted."
            )

    if field == "granted_date":
        if value is None and status == "Granted":
            raise Rejected(
                "A Granted license needs a date granted. Change the status first "
                "if it was not actually granted."
            )
        changes["granted_file"] = minutes_file_for(value, pdf_dir) if value else None

    if field == "minutes_date" and status == "Deferred":
        changes["application_expiration_date"] = compute_expiration(value)
        notes.append(
            f"Application expiration date recalculated to "
            f"{changes['application_expiration_date']}."
        )

    override = corrections["overrides"].setdefault(ln, {})
    previous_reason = override.pop("_reason", None)
    override.update(changes)
    reason = _reason(form, issue_number)
    override["_reason"] = (
        f"{previous_reason} Then: {reason}" if previous_reason else reason
    )

    return [
        f"{_name(record)} ({ln}): {label.lower()} changed from "
        f"{_show(record.get(field))} to {_show(value)}.",
        *notes,
    ]


def hide_license(
    form: dict, ln: str, corrections: dict, records: dict[str, dict], issue_number: int
) -> list[str]:
    if ln in corrections["exclude"]:
        raise Rejected(f"{ln} is already hidden.")
    record = records.get(ln)
    if record is None:
        raise Rejected(f"{ln} isn't on the site, so there is nothing to hide.")
    corrections["exclude"][ln] = f"{_name(record)}: {_reason(form, issue_number)}"
    corrections["add"] = [
        a for a in corrections["add"] if a.get("license_number") != ln
    ]
    return [f"{_name(record)} ({ln}) is now hidden from the site."]


def show_license(
    form: dict,
    ln: str,
    corrections: dict,
    licenses: list[dict],
    find_in_history: Callable[[str], dict | None],
) -> list[str]:
    _required(form, "Why?")
    _required(form, "Source")
    if ln not in corrections["exclude"]:
        raise Rejected(f"{ln} isn't hidden.")
    record = find_in_history(ln)
    if record is None:
        raise Rejected(
            f"I couldn't find an earlier copy of {ln} to bring back. Use the "
            '"Add a missing license" form to enter its details instead.'
        )
    del corrections["exclude"][ln]
    licenses.append(record)
    return [f"{_name(record)} ({ln}) is shown on the site again."]


def add_license(
    form: dict,
    corrections: dict,
    records: dict[str, dict],
    issue_number: int,
    pdf_dir: Path,
) -> list[str]:
    ln = parse_license_number(_required(form, "License number"))
    if ln in corrections["exclude"]:
        raise Rejected(
            f'{ln} is hidden. Use the "Correct a license record" form and choose '
            '"Show a hidden license again".'
        )
    if ln in records:
        raise Rejected(
            f"{ln} ({_name(records[ln])}) is already on the site. Use the "
            '"Correct a license record" form to change it.'
        )
    address = " ".join(_required(form, "Address").split())
    match = ZIP_IN_ADDRESS_RE.search(address)
    if not match:
        raise Rejected(
            'The address should end with its zip code, like "Boston, MA 02128".'
        )
    zipcode = parse_zip(match.group(1))
    status = parse_choice(_required(form, "Status"), ["Granted", "Deferred"], "status")
    hearing = parse_date(_required(form, "Hearing date"), "Hearing date")
    label = "Date of the voting minutes they appear in"
    minutes = parse_date(_required(form, label), label)
    file_name = minutes_file_for(minutes, pdf_dir)
    if file_name is None:
        raise Rejected(
            f"There are no voting minutes dated {minutes} in the project. Check the "
            '"Date of the voting minutes they appear in".'
        )
    granted = form.get("Date granted")
    granted_date = granted_file = None
    if status == "Granted":
        if _is_none(granted):
            raise Rejected('A Granted license needs a "Date granted".')
        granted_date = parse_date(granted, "Date granted")
        granted_file = minutes_file_for(granted_date, pdf_dir)
    entity = (form.get("Item number in the voting minutes") or "").strip().lstrip("#")
    if entity and not entity.isdigit():
        raise Rejected(f'The item number should be digits only, not "{entity}".')
    dba = form.get("Doing business as (DBA) name")

    record = {
        "entity_number": entity,
        "business_name": " ".join(_required(form, "Business name").split()),
        "dba_name": None if _is_none(dba) else " ".join(dba.split()),
        "address": address,
        "zipcode": zipcode,
        "license_number": ln,
        "status": status,
        "alcohol_type": parse_choice(
            _required(form, "Alcohol type"), ALCOHOL_TYPES, "alcohol type"
        ),
        "minutes_date": hearing,
        "application_expiration_date": (
            compute_expiration(hearing) if status == "Deferred" else None
        ),
        "file_name": file_name,
        "granted_date": granted_date,
        "granted_file": granted_file,
        "_reason": _reason(form, issue_number),
    }
    corrections["add"].append(record)
    return [f"Added {_name(record)} ({ln}, {zipcode}) as {status}."]


def apply_submission(
    kind: str,
    body: str,
    corrections: dict,
    licenses: list[dict],
    issue_number: int,
    pdf_dir: Path = PDF_DIR,
    find_in_history: Callable[[str], dict | None] = lambda ln: None,
) -> list[str]:
    """Apply one submitted form to `corrections` (and `licenses`, when restoring)."""
    form = parse_issue_form(body)
    records = {r["license_number"]: r for r in licenses if r.get("license_number")}
    if kind == "add":
        return add_license(form, corrections, records, issue_number, pdf_dir)

    ln = parse_license_number(_required(form, "License number"))
    action = _required(form, "What do you want to do?")
    if action == "Change a detail":
        return change_detail(form, ln, corrections, records, issue_number, pdf_dir)
    if action == "Hide this license from the site":
        return hide_license(form, ln, corrections, records, issue_number)
    if action == "Show a hidden license again":
        return show_license(form, ln, corrections, licenses, find_in_history)
    raise Rejected(f'"{action}" isn\'t one of the choices.')


# --------------------------------------------------------------------------- #
# History
# --------------------------------------------------------------------------- #


def git_history_lookup(repo_root: Path, path: Path) -> Callable[[str], dict | None]:
    """Find the most recent committed copy of a license record in licenses.json."""

    def find(ln: str) -> dict | None:
        rel = path.relative_to(repo_root).as_posix()
        commits = subprocess.run(
            ["git", "log", "--format=%H", "-S", f'"{ln}"', "--", rel],
            cwd=repo_root,
            capture_output=True,
            text=True,
            check=True,
        ).stdout.split()
        for commit in commits:
            for rev in (commit, f"{commit}^"):
                shown = subprocess.run(
                    ["git", "show", f"{rev}:{rel}"],
                    cwd=repo_root,
                    capture_output=True,
                    text=True,
                )
                if shown.returncode != 0:
                    continue
                try:
                    data = json.loads(shown.stdout)
                except json.JSONDecodeError:
                    continue
                for record in data if isinstance(data, list) else []:
                    if record.get("license_number") == ln:
                        return record
        return None

    return find


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #


def write_json(path: Path, data) -> None:
    path.write_text(
        json.dumps(data, indent=4, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--kind", choices=["correct", "add"], required=True)
    parser.add_argument("--issue-number", type=int, required=True)
    parser.add_argument("--body-file", type=Path, required=True)
    parser.add_argument("--reply-file", type=Path, required=True)
    parser.add_argument("--corrections", type=Path, default=CORRECTIONS_JSON)
    parser.add_argument("--licenses", type=Path, default=LICENSES_JSON)
    parser.add_argument("--pdf-dir", type=Path, default=PDF_DIR)
    args = parser.parse_args(argv)

    corrections = json.loads(args.corrections.read_text(encoding="utf-8"))
    for key, empty in (("exclude", {}), ("overrides", {}), ("add", [])):
        corrections.setdefault(key, empty)
    licenses = json.loads(args.licenses.read_text(encoding="utf-8"))

    try:
        summary = apply_submission(
            args.kind,
            args.body_file.read_text(encoding="utf-8"),
            corrections,
            licenses,
            args.issue_number,
            args.pdf_dir,
            git_history_lookup(REPO_ROOT, args.licenses.resolve()),
        )
    except Rejected as exc:
        args.reply_file.write_text(
            "I couldn't apply this yet:\n\n"
            f"> {exc}\n\n"
            "Edit this form (the **...** menu at the top right, then **Edit**) to fix "
            "it, and I'll try again.\n",
            encoding="utf-8",
        )
        print("ok=false")
        return 0

    write_json(args.corrections, corrections)
    write_json(args.licenses, licenses)
    args.reply_file.write_text(
        "\n".join(f"- {line}" for line in summary) + "\n", encoding="utf-8"
    )
    print("ok=true")
    return 0


if __name__ == "__main__":
    sys.exit(main())
