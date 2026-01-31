import logging
import re

from app import constants as const
from app.pipeline.run_result import RunResult
from app.state.kv_store import KVStore

logger = logging.getLogger(__name__)


# Regex Patterns
LICENSE_NUMBER_RE = re.compile(r"(?:LB|L|LICENSE)\s*[-:#\s]*\s*(\d+)", re.IGNORECASE)
DBA_RE = re.compile(r"(?:D/B/A|Doing business as|DBA)\s*:\s*(.*)", re.IGNORECASE)
CATEGORY_RE = re.compile(r"(Holder of|Has applied for)", re.IGNORECASE)
MANAGER_RE = re.compile(r"(?:Manager\s*[:\.]\s*|,\s*Manager\.)\s*(.*)", re.IGNORECASE)
ATTORNEY_RE = re.compile(r"Attorney\s*:\s*(.*)", re.IGNORECASE)
# Improved hours regex to handle missing colons and partial words
HOURS_RE = re.compile(
    r"(?:Hours of Operation|Closing Time|Operational hours|Hours of operations?|Closing hour)\s*[:\s]\s*(.*)",
    re.IGNORECASE,
)
STATUS_KEYWORDS = [
    "Granted",
    "Deferred",
    "RE-SCHEDULED",
    "RESCHEDULED",
    "Continued",
    "Withdrawn",
    "No Violation",
    "Failed to Appear",
    "Dismissed",
    "No Action Taken",
    "Defer",
    "Dismiss",
    "Revised",
    "Corrected",
    "Rejected",
    "Denied",
]


class TextJsonExtractorStep:
    """Extracts text from downloaded PDFs."""

    def __init__(self, kv_store: KVStore):
        self.kv_store = kv_store

    def run(self):
        # logger.info("Starting text extraction process...")
        file_path = self.kv_store.get(const.PDF_FILE_PATH)
        license_text_data = self.kv_store.get(const.LICENSE_TEXT_DATA)

        if not file_path:
            return RunResult(
                proceed=False, reason="PDF file path not provided in KVStore"
            )
        if not license_text_data:
            return RunResult(
                proceed=False, reason="License text data not provided in KVStore"
            )

        licenses = []
        for key, value in license_text_data.items():
            # logger.info(f"Extracting data for {key}")
            json_data = self._extract_data(key, value)
            licenses.append(json_data)
        self.kv_store.set(const.LICENSE_JSON_DATA, licenses)
        return RunResult()

    def _entity_number(self, store_key: str) -> str:
        # Split by underscore
        parts = store_key.rsplit("_", 1)  # split only at the last underscore
        if len(parts) == 2:
            return parts[1]
        else:
            # no underscore found
            return ""

    def _sourceFileName(self, store_key: str) -> str:
        # Remove the last underscore followed by digits
        new_base = re.sub(r"_(\d+)$", "", store_key)
        return new_base

    def _initialize_data_dict(self, store_key: str) -> dict:
        return {
            "minutes_date": None,
            "license_number": None,
            "business_name": None,
            "dba_name": None,
            "address": None,
            "zipcode": None,
            "alcohol_type": None,
            "manager": None,
            "attorney": None,
            "status": None,
            "status_detail": None,
            "hours": None,
            "details": None,
            "entity_number": self._entity_number(store_key),
            "file_name": self._sourceFileName(store_key),
        }

    def _extract_header_info(self, lines: list, data: dict):
        """Extracts minutes_date and business_name (often the first lines)."""
        if not lines:
            return

        if lines[0].startswith("Date:"):
            date_line = lines.pop(0)
            data["minutes_date"] = date_line.replace("Date:", "").strip()
            if data["minutes_date"] == "null":
                data["minutes_date"] = None

        if lines:
            # Legal Name: First line after date (strip leading numbers and bullets)
            first_line = lines[0]
            data["business_name"] = re.sub(
                r"^\s*[\d\.\-\)]+\s*", "", first_line
            ).strip()

    def _extract_regex_fields(self, lines: list, data: dict, anchors: dict):
        """Standard regex-based field extraction."""
        for idx, line in enumerate(lines):
            # License Number
            lic_match = LICENSE_NUMBER_RE.search(line)
            if lic_match and not data["license_number"]:
                digits = lic_match.group(1)
                data["license_number"] = f"LB-{digits}"
                anchors["license_idx"] = idx

            # DBA
            dba_match = DBA_RE.search(line)
            if dba_match and not data["dba_name"]:
                data["dba_name"] = dba_match.group(1).strip()
                anchors["dba_idx"] = idx

            # Category / Alcohol Type
            cat_match = CATEGORY_RE.search(line)
            if cat_match and not data["alcohol_type"]:
                line_lower = (
                    line.lower().replace("-", " ").replace("_", " ").replace("&", "and")
                )
                if any(
                    kw in line_lower
                    for kw in [
                        "all alcoholic",
                        "common victualler",
                        "all alcohol",
                        "allalcohol",
                    ]
                ):
                    data["alcohol_type"] = "all alcoholic beverages"
                if any(kw in line_lower for kw in ["malt", "malts", "wine", "wines"]):
                    data["alcohol_type"] = "wines and malt beverages"

                anchors["category_idx"] = idx

            # Manager
            mgr_match_rev = re.search(
                r"([^,\.\n]+?)\s*,\s*Manager\.", line, re.IGNORECASE
            )
            if mgr_match_rev and not data["manager"]:
                data["manager"] = mgr_match_rev.group(1).strip()

            if not data["manager"]:
                mgr_match = re.search(r"Manager\s*:\s*(.*)", line, re.IGNORECASE)
                if mgr_match:
                    data["manager"] = mgr_match.group(1).split(".")[0].strip()

            # Attorney
            att_match = ATTORNEY_RE.search(line)
            if att_match and not data["attorney"]:
                data["attorney"] = att_match.group(1).strip()

            # Hours
            hrs_match = HOURS_RE.search(line)
            if hrs_match and not data["hours"]:
                data["hours"] = hrs_match.group(1).strip()

    def _extract_address(self, lines: list, data: dict, anchors: dict):
        """Extracts address from lines preceding the license number."""
        license_idx = anchors.get("license_idx", -1)
        if license_idx == -1:
            return

        address_lines = []
        # Address usually sits between business_name (idx 0) and license number
        # Skip lines already identified as landmarks by their index
        skip_indices = {anchors.get("dba_idx"), anchors.get("category_idx")}

        for idx in range(1, license_idx):
            if idx in skip_indices:
                continue
            address_lines.append(lines[idx])

        if address_lines:
            raw_address = ", ".join(address_lines)
            data["address"] = raw_address
            # Extract zipcode
            zip_match = re.search(r"\b(\d{5})\b", raw_address)
            if zip_match:
                data["zipcode"] = zip_match.group(1)

    def _extract_status(self, lines: list, data: dict):
        """Scans the end of the chunk for status keywords."""
        # Check last 7 non-empty lines in reverse
        for line in reversed(lines[-7:]):
            for keyword in STATUS_KEYWORDS:
                if re.search(rf"\b{keyword}\b", line, re.IGNORECASE):
                    status_detail = line.strip()
                    data["status_detail"] = status_detail

                    sd_lower = status_detail.lower()
                    if "granted" in sd_lower:
                        data["status"] = "granted"
                    elif "rejected" in sd_lower:
                        data["status"] = "rejected"
                    elif any(kw in sd_lower for kw in ["rescheduled", "re-scheduled"]):
                        data["status"] = "rescheduled"
                    elif "withdrawn" in sd_lower:
                        data["status"] = "withdrawn"
                    elif "continued" in sd_lower:
                        data["status"] = "continued"
                    elif any(kw in sd_lower for kw in ["deferred", "defer"]):
                        data["status"] = "deferred"

                    return  # Stop after first status found

    def _extract_details(self, lines: list, data: dict, anchors: dict):
        """Captures narrative between category and closing info."""
        cat_idx = anchors.get("category_idx", -1)
        if cat_idx == -1:
            return

        detail_lines = []
        for idx in range(cat_idx, len(lines)):
            line = lines[idx]
            # Stop if we hit explicit labels or the identified status text
            if (
                line.startswith("Manager:")
                or line.startswith("Attorney:")
                or (data["status_detail"] and data["status_detail"] in line)
            ):
                break
            detail_lines.append(line)

        data["details"] = " ".join(detail_lines)

    def _extract_data(self, store_key, content):
        lines = [line.strip() for line in content.splitlines() if line.strip()]
        if not lines:
            return None

        data = self._initialize_data_dict(store_key)
        anchors = {}

        self._extract_header_info(lines, data)
        self._extract_regex_fields(lines, data, anchors)
        self._extract_address(lines, data, anchors)
        self._extract_status(lines, data)
        self._extract_details(lines, data, anchors)

        return data
