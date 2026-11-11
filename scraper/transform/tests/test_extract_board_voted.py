"""Tests for app.pipeline.extract_board_voted.parse_approvals."""

from app.pipeline.extract_board_voted import parse_approvals

BATCH_2025 = """
2. The Board deferred deliberation on the following applications for new alcoholic beverages licenses,
which were complete and submitted prior to the December 6, 2024 deadline:
02118
Crystal Spoons, LLC

1950 Washington St.

Roxbury, MA 02118
Common Victualler 7-Day All Alcoholic Beverages License
Manager: Srinivas Desaneedi
Closing Time: 2:00 AM
Hearing Date: November 20, 2024

The Board voted to approve a Zip Code restricted All Alcoholic Beverages License

Siraj Corporation
Doing business as: El Centro
474 Shawmut Ave.
Roxbury, MA 02118
Common Victualler 7-Day All Alcoholic Beverages License
Manager: Rabiul Islam
Closing Time: 11:00 PM
Hearing Date: January 15, 2025

The Board voted to approve a Zip Code restricted All Alcoholic Beverages License on the
condition that the Licensee surrenders the existing Wines and Malt Beverages with Liqueurs
License
02119
Dominican Kitchen, Inc.
Doing business as: La Parada Dominican Kitchen
3094 Washington St.
Roxbury, MA 02119
Common Victualler 7-Day Wines and Malt Beverages with Liqueurs License
Manager: Yonatan Pena
Closing Time: 11:00 PM
Hearing Date: October 30, 2024
The Board voted to approve a Zip Code restricted Wines and Malt Beverages with Liqueurs
License
02121
Commonwealth Zoological Corporation
Doing business as: Zoo New England
1 Franklin Park Rd.
Boston, MA 02121
Common Victualler 7-Day All Alcoholic Beverages License
Hearing Date: October 30, 2024
The Board voted to approve a Community Space All Alcoholic Beverages License
"""

BATCH_2026 = """
The Board voted to approve to the following restricted (non-transferable licenses)
Safari African Restaurant, Inc.
Doing business as: Safari African Restaurant
950 American Legion Hwy, Roslindale, MA 02131
License #: LB-615310
Manager: Amie N. Sillah
Closing Time: 12:00 AM
Hearing Date: March 4, 2026
The Board voted to approve an 02131 Zip Code restricted All Alcoholic Beverages License
pursuant to Chapter 2024 of the Acts of 2024
"""

INLINE_2026 = """
41. Pena Bani Restaurant Inc
Doing business as: Pena Bani Restaurant
4541 Washington St, Roslindale, MA
License #: LB-628157
Has applied for a Common Victualler 7 Day Wines and Malt Beverages License to be exercised on the
above - 1500 SF restaurant space on 2 floors.
Manager: Fleming Pena Franco
Closing Time: 10:00 PM
Granted an 02131 Zip Code Restricted License pursuant to the authority contained in Chapter
202 of the Acts of 2024
"""


def test_2025_batch_without_license_numbers():
    records = parse_approvals(BATCH_2025, "2025-02-13", "voting_minutes_2025-02-13.pdf")
    assert [r["dba_name"] or r["business_name"] for r in records] == [
        "Crystal Spoons, LLC",
        "El Centro",
        "La Parada Dominican Kitchen",
    ]
    crystal, el_centro, la_parada = records
    assert crystal["license_number"] is None
    assert crystal["zipcode"] == "02118"
    assert crystal["hearing_date"] == "2024-11-20"
    assert crystal["address"] == "1950 Washington St., Roxbury, MA 02118"
    assert crystal["alcohol_type"] == "all alcoholic beverages"
    assert crystal["source"] == "board_vote"
    assert not crystal["conditional"]
    assert el_centro["business_name"] == "Siraj Corporation"
    assert el_centro["conditional"]
    assert la_parada["alcohol_type"] == "wines and malt beverages"
    assert not la_parada["conditional"]


def test_community_space_approval_is_ignored():
    records = parse_approvals(BATCH_2025, "2025-02-13", "f.pdf")
    assert all("Zoo" not in (r["dba_name"] or "") for r in records)


def test_2026_batch_with_license_number_and_zip_in_vote():
    (record,) = parse_approvals(BATCH_2026, "2026-03-05", "f.pdf")
    assert record["license_number"] == "LB-615310"
    assert record["zipcode"] == "02131"
    assert record["business_name"] == "Safari African Restaurant, Inc."
    assert record["hearing_date"] == "2026-03-04"


def test_inline_grant_without_type_takes_zip_from_vote_and_type_from_application():
    (record,) = parse_approvals(INLINE_2026, "2026-06-25", "f.pdf")
    assert record["license_number"] == "LB-628157"
    assert record["zipcode"] == "02131"
    assert record["alcohol_type"] == "wines and malt beverages"
    assert record["business_name"] == "Pena Bani Restaurant Inc"


def test_typo_restricuted_is_recognized():
    text = (
        "Uptown Social LLC\n604 Columbus Ave, Roxbury, MA 02118\nLicense #: LB-621425\n"
        "Granted an 02118 Zip Code Restricuted All-Alcoholic Beverages License pursuant to"
    )
    (record,) = parse_approvals(text, "2026-03-26", "f.pdf")
    assert record["license_number"] == "LB-621425"
    assert record["alcohol_type"] == "all alcoholic beverages"
