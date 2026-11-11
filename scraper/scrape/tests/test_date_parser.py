"""Tests for app.parsers.date_parser.DateParser."""

from app.parsers.date_parser import DateParser

parser = DateParser()


def test_body_with_year():
    assert parser.parse("Voting Minutes: October 29, 2026", "/x.pdf") == "2026-10-29"


def test_href_numeric_date():
    href = "/sites/default/files/file/2025/06/Voting%20Minutes%206-26-25.docx.pdf"
    assert parser.parse("Voting Minutes: Thursday, June 26", href) == "2025-06-26"


def test_href_dotted_date():
    href = "/sites/default/files/file/2021/04/Board%20Voting%20Agenda%204.8.21_0.pdf"
    assert parser.parse("Voting agenda:", href) == "2021-04-08"


def test_google_drive_link_uses_section_year():
    href = "https://drive.google.com/file/d/1UhcS_UqlbNBRe2OO23O2ENwcfs5wz8Wi/view"
    body = "Voting Minutes: Thursday, November 6"
    assert parser.parse(body, href) == "yyyy-11-06"
    assert parser.parse(body, href, fallback_year="2025") == "2025-11-06"


def test_section_year_does_not_override_explicit_year():
    assert (
        parser.parse("Voting Minutes: January 8, 2026", "/x.pdf", fallback_year="2025")
        == "2026-01-08"
    )


def test_section_year_not_used_without_month_and_day():
    assert (
        parser.parse("Public records", "https://example.com/", "2025") == "yyyy-mm-dd"
    )


def test_version_like_numbers_are_not_dates():
    assert parser.parse("Report", "/files/report-v1.2.345.pdf") == "yyyy-mm-dd"


def test_is_valid():
    assert DateParser.is_valid("2025-11-06")
    assert not DateParser.is_valid("yyyy-11-06")
    assert not DateParser.is_valid("yyyy-mm-dd")
    assert not DateParser.is_valid(None)


def test_impossible_month_is_not_a_date():
    assert parser.parse("Report", "/files/13-40-25.pdf") == "yyyy-mm-dd"
