from datetime import date

from merge_licenses import merge_records

TODAY = date(2026, 11, 10)


def app(
    ln,
    status,
    detail,
    zipcode="02130",
    name="Test Cafe",
    minutes_date="2025-06-03",
    details="Has applied for a Common Victualler 7 Day All-Alcoholic Beverages License",
):
    return {
        "license_number": ln,
        "business_name": name,
        "dba_name": name,
        "address": f"1 Main St, Boston, MA {zipcode}",
        "zipcode": zipcode,
        "alcohol_type": "all alcoholic beverages",
        "status": status,
        "status_detail": detail,
        "details": details,
        "minutes_date": minutes_date,
        "entity_number": "1",
        "file_name": "voting_minutes_x.pdf",
    }


def existing(
    ln,
    status="Deferred",
    zipcode="02130",
    name="Test Cafe",
    minutes_date="2025-06-03",
    expiration="2027-06-03",
):
    return {
        "index": 1,
        "entity_number": "1",
        "business_name": name,
        "dba_name": name,
        "address": f"1 Main St, Boston, MA {zipcode}",
        "zipcode": zipcode,
        "license_number": ln,
        "status": status,
        "alcohol_type": "All Alcoholic Beverages",
        "minutes_date": minutes_date,
        "application_expiration_date": expiration,
        "file_name": "voting_minutes_x.pdf",
        "granted_date": None,
        "granted_file": None,
    }


def vote(
    ln=None, name="Test Cafe", zipcode="02130", hearing="2025-06-04", conditional=False
):
    return {
        "source": "board_vote",
        "minutes_date": "2025-06-26",
        "hearing_date": hearing,
        "license_number": ln,
        "business_name": name,
        "dba_name": name,
        "address": f"1 Main St., Boston, MA {zipcode}",
        "zipcode": zipcode,
        "alcohol_type": "all alcoholic beverages",
        "status": "granted",
        "conditional": conditional,
        "details": "The Board voted to grant a Zip Code restricted All Alcoholic Beverages License",
        "file_name": "voting_minutes_2025-06-26.pdf",
    }


def by_ln(records):
    return {r["license_number"]: r for r in records}


class TestApplicationStatus:
    def test_zip_restricted_grant_is_granted(self):
        out, _ = merge_records(
            [
                app(
                    "LB-1",
                    "granted",
                    "Granted an 02130 Zip Code Restricted License pursuant to",
                )
            ],
            [],
            today=TODAY,
        )
        assert by_ln(out)["LB-1"]["status"] == "Granted"

    def test_plain_grant_on_new_application_is_skipped(self):
        out, stats = merge_records([app("LB-1", "granted", "Granted")], [], today=TODAY)
        assert out == []
        assert stats["skipped"] == 1

    def test_pending_availability_grant_is_skipped(self):
        detail = "Granted, pending the availability of a license for which the applicant qualifies"
        out, _ = merge_records([app("LB-1", "granted", detail)], [], today=TODAY)
        assert out == []

    def test_rejected_is_skipped(self):
        out, _ = merge_records(
            [app("LB-1", "rejected", "Rejected without prejudice")], [], today=TODAY
        )
        assert out == []

    def test_deferred_is_added_with_expiration(self):
        out, _ = merge_records([app("LB-1", "deferred", "Deferred")], [], today=TODAY)
        rec = by_ln(out)["LB-1"]
        assert rec["status"] == "Deferred"
        assert rec["application_expiration_date"] == "2027-06-03"

    def test_zip_inferred_from_grant_text_when_address_has_none(self):
        record = app(
            "LB-1",
            "granted",
            "Granted an 02131 Zip Code Restricted License pursuant to the",
        )
        record["zipcode"] = None
        out, _ = merge_records([record], [], today=TODAY)
        assert by_ln(out)["LB-1"]["zipcode"] == "02131"


class TestBoardVotes:
    def test_vote_without_license_number_matches_by_name_zip_and_hearing(self):
        out, _ = merge_records([vote()], [existing("LB-1")], today=TODAY)
        rec = by_ln(out)["LB-1"]
        assert rec["status"] == "Granted"
        assert rec["granted_date"] == "2025-06-26"
        assert rec["application_expiration_date"] is None

    def test_vote_matches_across_zip_when_minutes_zip_is_wrong(self):
        out, _ = merge_records(
            [vote(zipcode="02128")], [existing("LB-1", zipcode="02126")], today=TODAY
        )
        assert by_ln(out)["LB-1"]["status"] == "Granted"

    def test_vote_does_not_match_when_hearing_date_far_from_application(self):
        out, _ = merge_records(
            [vote(hearing="2025-01-15")], [existing("LB-1")], today=TODAY
        )
        assert by_ln(out)["LB-1"]["status"] == "Deferred"

    def test_vote_does_not_match_different_business(self):
        out, _ = merge_records(
            [vote(name="Other Place")], [existing("LB-1")], today=TODAY
        )
        assert by_ln(out)["LB-1"]["status"] == "Deferred"

    def test_conditional_vote_is_not_granted_but_noted(self):
        out, _ = merge_records(
            [vote(conditional=True)], [existing("LB-1")], today=TODAY
        )
        rec = by_ln(out)["LB-1"]
        assert rec["status"] == "Deferred"
        assert "condition" in rec["notes"]

    def test_vote_with_untracked_license_number_adds_granted_record(self):
        out, _ = merge_records([vote(ln="LB-9")], [], today=TODAY)
        rec = by_ln(out)["LB-9"]
        assert rec["status"] == "Granted"
        assert rec["zipcode"] == "02130"

    def test_vote_with_ineligible_zip_is_not_added(self):
        out, _ = merge_records([vote(ln="LB-9", zipcode="02135")], [], today=TODAY)
        assert out == []


class TestCorrectionsAndExpiry:
    def test_excluded_license_is_removed_and_not_readded(self):
        corrections = {
            "exclude": {"LB-1": "not chapter 202"},
            "overrides": {},
            "add": [],
        }
        out, _ = merge_records(
            [app("LB-1", "deferred", "Deferred")],
            [existing("LB-1")],
            corrections,
            TODAY,
        )
        assert out == []

    def test_override_sets_fields_and_ignores_private_keys(self):
        corrections = {
            "exclude": {},
            "overrides": {
                "LB-1": {"alcohol_type": "Wines and Malt Beverages", "_reason": "x"}
            },
            "add": [],
        }
        out, _ = merge_records([], [existing("LB-1")], corrections, TODAY)
        rec = by_ln(out)["LB-1"]
        assert rec["alcohol_type"] == "Wines and Malt Beverages"
        assert "_reason" not in rec

    def test_add_inserts_missing_record_once(self):
        corrections = {
            "exclude": {},
            "overrides": {},
            "add": [existing("LB-7", status="Granted")],
        }
        out, _ = merge_records([], [], corrections, TODAY)
        out, _ = merge_records([], out, corrections, TODAY)
        assert [r["license_number"] for r in out] == ["LB-7"]

    def test_deferred_past_expiration_becomes_expired(self):
        out, stats = merge_records(
            [], [existing("LB-1", expiration="2026-10-30")], today=TODAY
        )
        assert by_ln(out)["LB-1"]["status"] == "Expired"
        assert stats["expired"] == 1

    def test_expired_application_can_still_be_granted_by_vote(self):
        rec = existing("LB-1", status="Expired")
        out, _ = merge_records([vote(ln="LB-1")], [rec], today=TODAY)
        assert by_ln(out)["LB-1"]["status"] == "Granted"

    def test_indexes_are_sequential(self):
        out, _ = merge_records([], [existing("LB-1"), existing("LB-2")], today=TODAY)
        assert [r["index"] for r in out] == [1, 2]


class TestReview:
    def test_application_without_license_number_is_flagged_not_added(self):
        record = app(None, "deferred", "Deferred")
        out, stats = merge_records([record], [], today=TODAY)
        assert out == []
        assert any("no license number" in m for m in stats["review"])

    def test_coverage_warning_for_untracked_license_is_flagged(self):
        warning = {
            "source": "coverage_warning",
            "license_number": "LB-5",
            "details": "missed",
        }
        _, stats = merge_records([warning], [], today=TODAY)
        assert stats["review"] == ["missed"]

    def test_coverage_warning_for_tracked_license_is_ignored(self):
        warning = {
            "source": "coverage_warning",
            "license_number": "LB-1",
            "details": "missed",
        }
        _, stats = merge_records([warning], [existing("LB-1")], today=TODAY)
        assert stats["review"] == []

    def test_unmatched_board_vote_is_flagged(self):
        _, stats = merge_records(
            [vote(name="Nobody Here")], [existing("LB-1")], today=TODAY
        )
        assert any("did not match" in m for m in stats["review"])

    def test_possible_duplicate_is_flagged(self):
        a = existing("LB-1")
        b = existing("LB-2")
        _, stats = merge_records([], [a, b], today=TODAY)
        assert any("Possible duplicate" in m for m in stats["review"])

    def test_no_expire_flag_leaves_deferred(self):
        out, _ = merge_records(
            [], [existing("LB-1", expiration="2026-10-30")], today=TODAY, expire=False
        )
        assert out[0]["status"] == "Deferred"

    def test_report_lists_review_items_first(self, tmp_path):
        from merge_licenses import write_report

        _, stats = merge_records(
            [vote(name="Nobody Here")], [existing("LB-1")], today=TODAY
        )
        path = tmp_path / "body.md"
        write_report(path, stats, [], "voting_minutes_2026-10-29.pdf")
        body = path.read_text()
        assert body.index("## Needs review") < body.index("## Changes")
        assert "voting_minutes_2026-10-29.pdf" in body
