import pytest
import sys
from pathlib import Path

PARENT = Path(__file__).resolve().parents[1]
if str(PARENT) not in sys.path:
    sys.path.insert(0, str(PARENT))

from result_parser import ADDR2_RE, ADDR1_RE, LIC_RE


@pytest.mark.parametrize(
    "line",
    [
        "1 Franklin Park Rd.",
    ],
)
def test_addr1_regex_matches_city_zip(line):
    assert ADDR1_RE.match(line)

@pytest.mark.parametrize(
    "line",
    [
        "Boston, MA 02118",
        "Hyde Park, MA 02136",
        "West Roxbury, MA 02132",
    ],
)
def test_addr2_regex_matches_city_zip(line):
    assert ADDR2_RE.match(line)


@pytest.mark.parametrize(
    "line",
    [
        "Common Victualler 7-Day All Alcoholic Beverages License",
        "Common Victualler 7-Day Wines and Malt Beverages License",
        "Club All-Alcoholic Beverages License",
        "General On-Premise All Alcoholic Beverages License",
    ],
)
def test_lic_re_regex_matches(line):
    assert LIC_RE.match(line)


@pytest.mark.parametrize(
    "line",
    [
        "Club Alcoholic Beverages License",
        "ksjfksjfkjskfj",
    ],
)
def test_not_lic_re_regex_matches(line):
    assert not LIC_RE.match(line)


# @pytest.mark.parametrize(
#     "line",
#     [
#         "Boston MA 02118",            # missing comma
#         "Hyde Park, MA",              # missing zip
#         "Cambridge, MA 02139",        # not in eligible zip list
#         "Boston, Massachusetts 02118", # wrong state format
#     ],
# )
# def test_addr2_regex_rejects_invalid_city_zip(line):
#         assert not ADDR2_RE.match(line)






