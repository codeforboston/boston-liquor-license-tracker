import json
from datetime import date

from find_new_minutes import find_new_minutes, main, read_last_processed


def make_pdfs(tmp_path, *names):
    for name in names:
        (tmp_path / name).write_bytes(b"%PDF-")
    return tmp_path


def names(paths):
    return [p.name for p in paths]


def test_selects_only_meetings_after_last_processed_oldest_first(tmp_path):
    pdf_dir = make_pdfs(
        tmp_path,
        "voting_minutes_2026-11-12.pdf",
        "voting_minutes_2026-10-29.pdf",
        "voting_minutes_2026-10-15.pdf",
        "voting_minutes_2026-11-05.pdf",
    )
    assert names(find_new_minutes(pdf_dir, date(2026, 10, 29))) == [
        "voting_minutes_2026-11-05.pdf",
        "voting_minutes_2026-11-12.pdf",
    ]


def test_uses_newest_version_of_a_meeting(tmp_path):
    pdf_dir = make_pdfs(
        tmp_path,
        "voting_minutes_2026-11-05.pdf",
        "voting_minutes_2026-11-05_v3.pdf",
        "voting_minutes_2026-11-05_v2.pdf",
    )
    assert names(find_new_minutes(pdf_dir, date(2026, 10, 29))) == [
        "voting_minutes_2026-11-05_v3.pdf"
    ]


def test_ignores_files_that_are_not_dated_minutes(tmp_path):
    pdf_dir = make_pdfs(
        tmp_path,
        "voting_minutes_yyyy-11-05.pdf",
        "notes.pdf",
        "voting_minutes_2026-11-05.txt",
        "voting_minutes_2026-11-05.pdf",
    )
    assert names(find_new_minutes(pdf_dir, date(2026, 10, 29))) == [
        "voting_minutes_2026-11-05.pdf"
    ]


def test_nothing_new(tmp_path):
    pdf_dir = make_pdfs(tmp_path, "voting_minutes_2026-10-29.pdf")
    assert find_new_minutes(pdf_dir, date(2026, 10, 29)) == []


def test_reads_last_processed_date_format(tmp_path):
    path = tmp_path / "last_processed_date.json"
    path.write_text('{"date":"2026-10-29T00:00:00.000Z"}')
    assert read_last_processed(path) == date(2026, 10, 29)


def test_cli_writes_list_and_outputs(tmp_path, monkeypatch, capsys):
    pdf_dir = tmp_path / "pdfs"
    pdf_dir.mkdir()
    make_pdfs(
        pdf_dir,
        "voting_minutes_2026-11-05.pdf",
        "voting_minutes_2026-11-12.pdf",
    )
    last = tmp_path / "last.json"
    last.write_text(json.dumps({"date": "2026-10-29T00:00:00.000Z"}))
    list_file = tmp_path / "list.txt"
    monkeypatch.setattr(
        "sys.argv",
        [
            "x",
            "--pdf-dir",
            str(pdf_dir),
            "--last-processed",
            str(last),
            "--list-file",
            str(list_file),
        ],
    )
    main()
    out = capsys.readouterr().out.splitlines()
    assert out == ["count=2", "latest-date=2026-11-12T00:00:00.000Z"]
    assert [line.rsplit("/", 1)[-1] for line in list_file.read_text().splitlines()] == [
        "voting_minutes_2026-11-05.pdf",
        "voting_minutes_2026-11-12.pdf",
    ]
