"""Unit tests for boston_address_parser.py."""

import pytest

from boston_address_parser import BostonAddressParser


@pytest.fixture
def parser() -> BostonAddressParser:
    return BostonAddressParser()


class DescribeExtractStreetNumber:
    """Tests for BostonAddressParser.extract_street_number."""

    def it_extracts_a_simple_street_number(self, parser: BostonAddressParser) -> None:
        result = parser.extract_street_number("123 Main St, Boston, MA 02118")

        assert result == "123"

    def and_it_handles_a_numeric_range(self, parser: BostonAddressParser) -> None:
        result = parser.extract_street_number("605-607 Tremont St, Boston, MA 02118")

        assert result == "605-607"

    def and_it_handles_a_letter_suffix(self, parser: BostonAddressParser) -> None:
        result = parser.extract_street_number("605A Washington St, Boston, MA 02118")

        assert result == "605A"

    def but_it_returns_none_for_a_non_string(self, parser: BostonAddressParser) -> None:
        result = parser.extract_neighborhood(None)  # type: ignore[arg-type]

        assert result is None
        result = parser.extract_street_number(None)  # type: ignore[arg-type]

        assert result is None

    def but_it_returns_none_for_an_empty_string(self, parser: BostonAddressParser) -> None:
        result = parser.extract_street_number("")

        assert result is None


class DescribeExtractState:
    """Tests for BostonAddressParser.extract_state."""

    def it_extracts_the_state_from_a_standard_address(self, parser: BostonAddressParser) -> None:
        result = parser.extract_state("123 Main St, Boston, MA 02118")

        assert result == "MA"

    def and_it_uppercases_a_lowercase_state(self, parser: BostonAddressParser) -> None:
        result = parser.extract_state("123 Main St, Boston, ma 02118")

        assert result == "MA"

    def but_it_returns_none_for_a_non_string(self, parser: BostonAddressParser) -> None:
        result = parser.extract_state(None)  # type: ignore[arg-type]

        assert result is None


class DescribeExtractZipcode:
    """Tests for BostonAddressParser.extract_zipcode."""

    def it_extracts_a_five_digit_zip(self, parser: BostonAddressParser) -> None:
        result = parser.extract_zipcode("123 Main St, Boston, MA 02118")

        assert result == "02118"

    def and_it_extracts_a_nine_digit_zip(self, parser: BostonAddressParser) -> None:
        result = parser.extract_zipcode("123 Main St, Boston, MA 02118-1234")

        assert result == "02118-1234"

    def but_it_returns_none_when_no_zip_is_present(self, parser: BostonAddressParser) -> None:
        result = parser.extract_zipcode("123 Main St, Boston, MA")

        assert result is None

    def but_it_returns_none_for_a_non_string(self, parser: BostonAddressParser) -> None:
        result = parser.extract_zipcode(None)  # type: ignore[arg-type]

        assert result is None


class DescribeNormalizeStreetSuffix:
    """Tests for BostonAddressParser.normalize_street_suffix."""

    def it_abbreviates_a_full_suffix(self, parser: BostonAddressParser) -> None:
        result = parser.normalize_street_suffix("Washington Street")

        assert result == "Washington St"

    def and_it_preserves_an_already_abbreviated_suffix(self, parser: BostonAddressParser) -> None:
        result = parser.normalize_street_suffix("Washington St")

        assert result == "Washington St"

    def and_it_returns_the_name_unchanged_when_no_suffix_is_recognized(
        self, parser: BostonAddressParser
    ) -> None:
        result = parser.normalize_street_suffix("Washington")

        assert result == "Washington"

    def and_it_strips_trailing_punctuation_before_normalizing(
        self, parser: BostonAddressParser
    ) -> None:
        result = parser.normalize_street_suffix("Washington Street,")

        assert result == "Washington St"


class DescribeExtractNeighborhood:
    """Tests for BostonAddressParser.extract_neighborhood."""

    def it_extracts_compound_neighborhoods(self, parser: BostonAddressParser) -> None:
        result = parser.extract_neighborhood("West Roxbury")

        assert result == "West Roxbury"

    def and_it_extracts_simple_neighborhoods(self, parser: BostonAddressParser) -> None:
        result = parser.extract_neighborhood("Roxbury")

        assert result == "Roxbury"

    def and_it_prefers_south_boston_over_boston(
        self, parser: BostonAddressParser
    ) -> None:
        result = parser.extract_neighborhood("123 Main St, South Boston, MA 02127")

        assert result == "South Boston"

    def but_it_returns_none_for_empty_neighborhoods(
        self, parser: BostonAddressParser
    ) -> None:
        result = parser.extract_neighborhood("")

        assert result is None

    def but_it_returns_none_for_unrecognized_neighborhoods(
        self, parser: BostonAddressParser
    ) -> None:
        result = parser.extract_neighborhood("New York")

        assert result is None

    def but_it_returns_none_for_a_non_string(self, parser: BostonAddressParser) -> None:
        result = parser.extract_neighborhood(123)  # type: ignore

        assert result is None
