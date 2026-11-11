"""Tests for app.pipeline.coverage_check and minutes-date parsing."""

from app.pipeline.coverage_check import find_missing_applications
from app.pipeline.extract_board_voted import minutes_date_from_filename

MINUTES = """
30. Tracked Cafe LLC
Doing business as: Tracked Cafe
1 Centre St, Jamaica Plain, MA 02130
License #:  LB-100001
Has applied for a Common Victualler 7 Day All-Alcoholic Beverages License to be exercised on the
above.
Deferred
31. RRG Eastie, LLC
Doing business as: Blackbird Doughnuts
25 Lewis St, East Boston, MA 02128
Has applied for a Common Victualler 7 Day Wines and Malt Beverages License to be exercised on the
above.
Deferred to review all East Boston applications
32. Downtown Bistro LLC
10 Federal St, Boston, MA 02110
License #:  LB-100003
Has applied for a Common Victualler 7 Day All-Alcoholic Beverages License to be exercised on the
above.
Granted
33. Logan Bar LLC
1 Harborside Dr, East Boston, MA 02128
License #:  LB-100004
Has applied for an (Airport) Common Victualler 7 Day All-Alcoholic Beverages License.
Granted
34. Pena Bani Restaurant Inc
4541 Washington St, Roslindale, MA
License #: LB-100005
Has applied for a Common Victualler 7 Day Wines and Malt Beverages License to be exercised on the
above.
Granted an 02131 Zip Code Restricted License pursuant to Chapter 202 of the Acts of 2024
"""


def test_reports_only_eligible_applications_missing_from_output():
    records = [{"license_number": "LB-100001", "business_name": "Tracked Cafe LLC"}]
    missing = find_missing_applications(MINUTES, records)
    assert [
        (m["business_name"], m["license_number"], m["zipcode"]) for m in missing
    ] == [
        ("RRG Eastie, LLC", None, "02128"),
        ("Pena Bani Restaurant Inc", "LB-100005", "02131"),
    ]


def test_nothing_missing_when_everything_extracted():
    records = [
        {"license_number": "LB-100001"},
        {"license_number": None, "business_name": "RRG Eastie, LLC"},
        {"license_number": "LB-100005"},
    ]
    assert find_missing_applications(MINUTES, records) == []


def test_minutes_date_from_pipeline_filename():
    assert minutes_date_from_filename("voting_minutes_2026-10-29.pdf") == "2026-10-29"


def test_minutes_date_from_city_filename():
    assert (
        minutes_date_from_filename("/tmp/Voting%20Minutes%2010-29-26.docx.pdf")
        == "2026-10-29"
    )
    assert minutes_date_from_filename("Voting Minutes 6-4-26.pdf") == "2026-06-04"


def test_minutes_date_unknown():
    assert minutes_date_from_filename("agenda.pdf") is None
