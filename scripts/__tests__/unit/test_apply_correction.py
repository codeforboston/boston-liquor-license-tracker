import json

import pytest

from apply_correction import Rejected, apply_submission, main, parse_issue_form


def record(**overrides):
    base = {
        "index": 1,
        "entity_number": "22",
        "business_name": "Florenza, Inc.",
        "dba_name": "Florenza",
        "address": "164-170 Sumner St, East Boston, MA 02128",
        "zipcode": "02128",
        "license_number": "LB-574154",
        "status": "Deferred",
        "alcohol_type": "Wines and Malt Beverages",
        "minutes_date": "2024-09-25",
        "application_expiration_date": "2026-09-25",
        "file_name": "voting_minutes_2024-09-26.pdf",
        "granted_date": None,
        "granted_file": None,
    }
    base.update(overrides)
    return base


def corrections():
    return {"_comment": "x", "exclude": {}, "overrides": {}, "add": []}


def form(**answers):
    """Render answers the way GitHub renders an issue-form body."""
    return "\n\n".join(
        f"### {label}\n\n{value if value is not None else '_No response_'}"
        for label, value in answers.items()
    )


def correct(ln="LB-574154", action="Change a detail", field=None, value=None):
    return form(
        **{
            "License number": ln,
            "What do you want to do?": action,
            "Which detail?": field,
            "New value": value,
            "Why?": "The board granted it later.",
            "Source": "Feb 13, 2025 minutes",
        }
    )


@pytest.fixture
def pdf_dir(tmp_path):
    for name in (
        "voting_minutes_2024-09-26.pdf",
        "voting_minutes_2025-02-13.pdf",
        "voting_minutes_2025-02-13_v2.pdf",
    ):
        (tmp_path / name).write_bytes(b"%PDF-")
    return tmp_path


def test_parses_issue_form_body():
    body = "### License number\n\nLB-1\n\n### Which detail?\n\n_No response_\n\n### Why?\n\nTwo\nlines"
    assert parse_issue_form(body) == {
        "License number": "LB-1",
        "Which detail?": None,
        "Why?": "Two\nlines",
    }


def test_changes_a_date_and_records_reason(pdf_dir):
    c = corrections()
    summary = apply_submission(
        "correct",
        correct(field="Date granted", value="Feb 13, 2025"),
        c,
        [record()],
        42,
        pdf_dir,
    )
    override = c["overrides"]["LB-574154"]
    assert override["granted_date"] == "2025-02-13"
    assert override["granted_file"] == "voting_minutes_2025-02-13_v2.pdf"
    assert override["_reason"].endswith("Source: Feb 13, 2025 minutes. (issue #42)")
    assert "date granted changed from (blank) to 2025-02-13" in summary[0]


def test_granting_requires_a_granted_date(pdf_dir):
    with pytest.raises(Rejected, match="Date granted"):
        apply_submission(
            "correct",
            correct(field="Status", value="granted"),
            corrections(),
            [record()],
            1,
            pdf_dir,
        )


def test_granting_clears_expiration(pdf_dir):
    c = corrections()
    apply_submission(
        "correct",
        correct(field="Status", value="granted"),
        c,
        [record(granted_date="2025-02-13")],
        1,
        pdf_dir,
    )
    assert c["overrides"]["LB-574154"]["status"] == "Granted"
    assert c["overrides"]["LB-574154"]["application_expiration_date"] is None


def test_back_to_deferred_clears_grant_and_recomputes_expiration(pdf_dir):
    c = corrections()
    apply_submission(
        "correct",
        correct(field="Status", value="Deferred"),
        c,
        [
            record(
                status="Granted",
                granted_date="2025-02-13",
                application_expiration_date=None,
            )
        ],
        1,
        pdf_dir,
    )
    override = c["overrides"]["LB-574154"]
    assert override["granted_date"] is None
    assert override["application_expiration_date"] == "2026-09-25"


def test_second_correction_keeps_earlier_reason(pdf_dir):
    c = corrections()
    licenses = [record()]
    apply_submission(
        "correct", correct(field="Note", value="First"), c, licenses, 1, pdf_dir
    )
    apply_submission(
        "correct",
        correct(field="Business name", value="Florenza LLC"),
        c,
        licenses,
        2,
        pdf_dir,
    )
    override = c["overrides"]["LB-574154"]
    assert override["notes"] == "First"
    assert "(issue #1) Then:" in override["_reason"]


@pytest.mark.parametrize(
    "field,value,message",
    [
        ("Date granted", "someday", "couldn't read"),
        ("Zip code", "02101", "isn't one of the zip codes"),
        ("Status", "Approved", "isn't a valid status"),
        ("Business name", "none", "can't be cleared"),
        ("Business name", None, "is empty"),
        ("Alcohol type", "Wines and Malt Beverages", "already"),
    ],
)
def test_rejects_bad_values(pdf_dir, field, value, message):
    with pytest.raises(Rejected, match=message):
        apply_submission(
            "correct",
            correct(field=field, value=value),
            corrections(),
            [record()],
            1,
            pdf_dir,
        )


def test_address_change_updates_zip(pdf_dir):
    c = corrections()
    summary = apply_submission(
        "correct",
        correct(field="Address", value="1 Main St, Dorchester, MA 02124"),
        c,
        [record()],
        1,
        pdf_dir,
    )
    assert c["overrides"]["LB-574154"]["zipcode"] == "02124"
    assert "Zip code updated" in summary[1]


def test_unknown_license_is_rejected(pdf_dir):
    with pytest.raises(Rejected, match="isn't on the site"):
        apply_submission(
            "correct",
            correct(ln="574155", field="Note", value="x"),
            corrections(),
            [record()],
            1,
            pdf_dir,
        )


def test_hide_and_show_again(pdf_dir):
    c = corrections()
    licenses = [record()]
    apply_submission(
        "correct", correct(action="Hide this license from the site"), c, licenses, 1
    )
    assert c["exclude"]["LB-574154"].startswith("Florenza: The board granted it later.")

    restored = []
    apply_submission(
        "correct",
        correct(action="Show a hidden license again"),
        c,
        restored,
        2,
        find_in_history=lambda ln: record(),
    )
    assert "LB-574154" not in c["exclude"]
    assert restored == [record()]


def add_form(**changes):
    answers = {
        "License number": "LB-615310",
        "Business name": "Safari African Restaurant LLC",
        "Doing business as (DBA) name": None,
        "Address": "1 Main St, Dorchester, MA 02124",
        "Status": "Granted",
        "Alcohol type": "All Alcoholic Beverages",
        "Hearing date": "Sep 25, 2024",
        "Date of the voting minutes they appear in": "Sep 26, 2024",
        "Date granted": "Feb 13, 2025",
        "Item number in the voting minutes": "25",
        "Why?": "The pipeline missed it.",
        "Source": "Sep 26, 2024 minutes, item 25",
    }
    answers.update(changes)
    return form(**answers)


def test_adds_a_missing_license(pdf_dir):
    c = corrections()
    apply_submission("add", add_form(), c, [record()], 7, pdf_dir)
    added = c["add"][0]
    assert added["license_number"] == "LB-615310"
    assert added["zipcode"] == "02124"
    assert added["dba_name"] is None
    assert added["file_name"] == "voting_minutes_2024-09-26.pdf"
    assert added["granted_file"] == "voting_minutes_2025-02-13_v2.pdf"
    assert added["application_expiration_date"] is None


@pytest.mark.parametrize(
    "changes,message",
    [
        ({"License number": "LB-574154"}, "already on the site"),
        (
            {"Date of the voting minutes they appear in": "Sep 27, 2024"},
            "no voting minutes",
        ),
        ({"Date granted": None}, "needs a"),
        ({"Address": "1 Main St, Boston"}, "end with its zip code"),
    ],
)
def test_rejects_bad_additions(pdf_dir, changes, message):
    with pytest.raises(Rejected, match=message):
        apply_submission(
            "add", add_form(**changes), corrections(), [record()], 1, pdf_dir
        )


def test_cli_writes_files_and_reply(tmp_path, pdf_dir, capsys):
    corrections_path = tmp_path / "corrections.json"
    licenses_path = tmp_path / "licenses.json"
    corrections_path.write_text(json.dumps(corrections()))
    licenses_path.write_text(json.dumps([record()]))
    body = tmp_path / "body.md"
    reply = tmp_path / "reply.md"

    body.write_text(correct(field="Zip code", value="99999"))
    args = [
        "--kind",
        "correct",
        "--issue-number",
        "3",
        "--body-file",
        str(body),
        "--reply-file",
        str(reply),
        "--corrections",
        str(corrections_path),
        "--licenses",
        str(licenses_path),
        "--pdf-dir",
        str(pdf_dir),
    ]
    assert main(args) == 0
    assert "ok=false" in capsys.readouterr().out
    assert "couldn't apply" in reply.read_text()
    assert json.loads(corrections_path.read_text())["overrides"] == {}

    body.write_text(correct(field="Zip code", value="02124"))
    assert main(args) == 0
    assert "ok=true" in capsys.readouterr().out
    assert (
        json.loads(corrections_path.read_text())["overrides"]["LB-574154"]["zipcode"]
        == "02124"
    )


def test_none_clears_an_optional_value(pdf_dir):
    c = corrections()
    apply_submission(
        "correct",
        correct(field="Doing business as (DBA) name", value="None"),
        c,
        [record()],
        1,
        pdf_dir,
    )
    assert c["overrides"]["LB-574154"]["dba_name"] is None
