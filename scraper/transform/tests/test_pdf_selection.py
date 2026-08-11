"""Tests for app.utils.pdf_selection.select_latest_versions."""

from app.utils.pdf_selection import select_latest_versions


def test_keeps_highest_version_among_many():
    files = [
        "voting_minutes_2024-01-04_v2.pdf",
        "voting_minutes_2024-01-04_v9.pdf",
        "voting_minutes_2024-01-04_v15.pdf",
    ]
    assert select_latest_versions(files) == ["voting_minutes_2024-01-04_v15.pdf"]


def test_base_file_loses_to_any_version():
    # A file with no _vN suffix should be beaten by any versioned file.
    files = [
        "voting_minutes_2024-02-01.pdf",
        "voting_minutes_2024-02-01_v2.pdf",
    ]
    assert select_latest_versions(files) == ["voting_minutes_2024-02-01_v2.pdf"]


def test_base_file_kept_when_only_option():
    files = ["voting_minutes_2025-10-01.pdf"]
    assert select_latest_versions(files) == ["voting_minutes_2025-10-01.pdf"]


def test_single_versioned_file_kept():
    files = ["voting_minutes_2026-07-16_v2.pdf"]
    assert select_latest_versions(files) == ["voting_minutes_2026-07-16_v2.pdf"]


def test_distinct_meetings_each_kept():
    files = [
        "voting_minutes_2024-01-04_v3.pdf",
        "voting_minutes_2026-03-26_v17.pdf",
    ]
    assert select_latest_versions(files) == [
        "voting_minutes_2024-01-04_v3.pdf",
        "voting_minutes_2026-03-26_v17.pdf",
    ]


def test_malformed_template_names_dropped():
    files = [
        "voting_minutes_yyyy-mm-dd.pdf",
        "voting_minutes_yyyy-mm-dd_v19.pdf",
        "voting_minutes_yyyy-11-06_v13.pdf",
    ]
    assert select_latest_versions(files) == []


def test_invalid_but_numeric_date_dropped():
    # Digits in the right shape but not a real date.
    files = ["voting_minutes_2024-13-45_v3.pdf"]
    assert select_latest_versions(files) == []


def test_unrelated_files_passed_through():
    files = [
        "some_other_document.pdf",
        "voting_minutes_2024-01-04_v2.pdf",
    ]
    assert select_latest_versions(files) == [
        "some_other_document.pdf",
        "voting_minutes_2024-01-04_v2.pdf",
    ]


def test_empty_input():
    assert select_latest_versions([]) == []


def test_output_is_sorted_and_deterministic():
    files = [
        "voting_minutes_2026-03-26_v2.pdf",
        "voting_minutes_2020-04-23_v19.pdf",
        "voting_minutes_2026-03-26_v17.pdf",
    ]
    result = select_latest_versions(files)
    assert result == [
        "voting_minutes_2020-04-23_v19.pdf",
        "voting_minutes_2026-03-26_v17.pdf",
    ]
    assert result == sorted(result)


def test_idempotent():
    files = [
        "voting_minutes_2024-01-04.pdf",
        "voting_minutes_2024-01-04_v15.pdf",
        "voting_minutes_yyyy-mm-dd_v19.pdf",
        "some_other_document.pdf",
    ]
    once = select_latest_versions(files)
    assert select_latest_versions(once) == once


def test_realistic_mixed_directory():
    files = [
        "voting_minutes_2024-01-04.pdf",
        "voting_minutes_2024-01-04_v2.pdf",
        "voting_minutes_2024-01-04_v9.pdf",
        "voting_minutes_2024-01-04_v15.pdf",
        "voting_minutes_2026-03-26_v2.pdf",
        "voting_minutes_2026-03-26_v17.pdf",
        "voting_minutes_2026-07-16.pdf",
        "voting_minutes_yyyy-mm-dd.pdf",
        "voting_minutes_yyyy-mm-dd_v19.pdf",
        "some_other_document.pdf",
    ]
    assert select_latest_versions(files) == [
        "some_other_document.pdf",
        "voting_minutes_2024-01-04_v15.pdf",
        "voting_minutes_2026-03-26_v17.pdf",
        "voting_minutes_2026-07-16.pdf",
    ]
