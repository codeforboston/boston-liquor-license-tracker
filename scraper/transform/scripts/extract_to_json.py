import json
import os
import re

# Configuration
INPUT_DIR = "data/license_text"
OUTPUT_DIR = "data/license_json"

# Regex Patterns
# LICENSE_NUMBER_RE = re.compile(r"LB\s*[-:#\s]*\s*(\d+)", re.IGNORECASE)
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
    "Approved",
    "Rejected",
    "Denied",
]


def entity_number(filename: str) -> str:
    # Remove extension
    if filename.endswith(".txt"):
        base = filename[:-4]  # strip '.txt'
    else:
        base = filename

    # Split by underscore
    parts = base.rsplit("_", 1)  # split only at the last underscore
    if len(parts) == 2:
        return parts[1]
    else:
        # no underscore found
        return ""


def sourceFileName(filename: str) -> str:
    # Split filename and extension
    if "." in filename:
        base, ext = filename.rsplit(".", 1)
        ext = "." + ext
    else:
        base, ext = filename, ""

    # Remove the last underscore followed by digits
    new_base = re.sub(r"_(\d+)$", "", base)

    return new_base + ext


def extract_data(filename, content):
    lines = [line.strip() for line in content.splitlines() if line.strip()]
    # Remove any trailing blank lines at the end
    while lines and not lines[-1]:
        lines.pop()

    if not lines:
        return None

    data = {
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
        "entity_number": entity_number(filename),
        "file_name": sourceFileName(filename),
    }

    # 1. Hearing Date & Legal Name
    # The first line might be "Date:YYYY-MM-DD" or "Date:null"
    if lines[0].startswith("Date:"):
        date_line = lines.pop(0)
        data["minutes_date"] = date_line.replace("Date:", "").strip()
        if data["minutes_date"] == "null":
            data["minutes_date"] = None

    if not lines:
        return data

    # Legal Name: First line after date (strip leading numbers and bullets)
    first_line = lines[0]
    first_line_clean = re.sub(r"^\s*[\d\.\-\)]+\s*", "", first_line).strip()
    data["business_name"] = first_line_clean

    # 2. Extract specific fields
    address_candidate_lines = []
    found_license_idx = -1
    found_category_idx = -1

    for idx, line in enumerate(lines):
        # License Number
        lic_match = LICENSE_NUMBER_RE.search(line)
        if lic_match and not data["license_number"]:
            digits = lic_match.group(1)
            data["license_number"] = f"LB-{digits}"
            found_license_idx = idx

        # DBA
        dba_match = DBA_RE.search(line)
        if dba_match and not data["dba_name"]:
            data["dba_name"] = dba_match.group(1).strip()

        # Category
        cat_match = CATEGORY_RE.search(line)
        if cat_match and not data["alcohol_type"]:
            # Logic for specific categories
            line_lower = (
                line.lower().replace("-", " ").replace("_", " ").replace("&", "and")
            )

            if "all alcoholic" in line_lower:
                data["alcohol_type"] = "all alcoholic beverages"
            elif "common victualler" in line_lower:
                data["alcohol_type"] = "all alcoholic beverages"
            elif "all alcohol" in line_lower:
                data["alcohol_type"] = "all alcoholic beverages"
            elif "allalcohol" in line_lower:
                data["alcohol_type"] = "all alcoholic beverages"
            elif any(kw in line_lower for kw in ["malt", "malts", "wine", "wines"]):
                data["alcohol_type"] = "wines and malt beverages"
            else:
                data["alcohol_type"] = None
            found_category_idx = idx

        # Manager
        # Try "Name, Manager." first (common in middle of paragraph)
        mgr_match_rev = re.search(r"([^,\.\n]+?)\s*,\s*Manager\.", line, re.IGNORECASE)
        if mgr_match_rev:
            data["manager"] = mgr_match_rev.group(1).strip()

        # Try "Manager: Name" (common as field label)
        if not data["manager"]:
            mgr_match = re.search(r"Manager\s*:\s*(.*)", line, re.IGNORECASE)
            if mgr_match:
                mgr_name = mgr_match.group(1).split(".")[0].strip()
                data["manager"] = mgr_name

        # Attorney
        att_match = ATTORNEY_RE.search(line)
        if att_match and not data["attorney"]:
            data["attorney"] = att_match.group(1).strip()

        # Hours
        hrs_match = HOURS_RE.search(line)
        if hrs_match and not data["hours"]:
            data["hours"] = hrs_match.group(1).strip()

    # 3. Address: Lines between legal/dba and license number
    if found_license_idx != -1:
        for idx in range(1, found_license_idx):
            line = lines[idx]
            # Exclude lines that are DBA or Category starts
            if not DBA_RE.search(line) and not CATEGORY_RE.search(line):
                address_candidate_lines.append(line)
        if address_candidate_lines:
            raw_address = ", ".join(address_candidate_lines)
            data["address"] = raw_address

            # Extract zipcode from address
            zip_match = re.search(r"\b(\d{5})\b", raw_address)
            if zip_match:
                data["zipcode"] = zip_match.group(1)

    # 4. Status: Check last few lines
    for line in reversed(lines[-7:]):
        status_found = False
        for keyword in STATUS_KEYWORDS:
            if re.search(rf"\b{keyword}\b", line, re.IGNORECASE):
                status_detail = line.strip()
                data["status_detail"] = status_detail

                # Infer status from status_detail
                status_detail_lower = status_detail.lower()
                if "granted" in status_detail_lower:
                    data["status"] = "granted"
                elif "rejected" in status_detail_lower:
                    data["status"] = "rejected"
                elif (
                    "rescheduled" in status_detail_lower
                    or "re-scheduled" in status_detail_lower
                ):
                    data["status"] = "rescheduled"
                elif "withdrawn" in status_detail_lower:
                    data["status"] = "withdrawn"
                elif "continued" in status_detail_lower:
                    data["status"] = "continued"
                elif (
                    "deferred" in status_detail_lower or "defer" in status_detail_lower
                ):
                    data["status"] = "deferred"
                else:
                    data["status"] = None

                status_found = True
                break
        if status_found:
            break

    # 5. Details: Lines from category onwards
    if found_category_idx != -1:
        detail_lines = []
        for idx in range(found_category_idx, len(lines)):
            line = lines[idx]
            # Stop if we hit Manager prefix (unless it's just a name containing it)
            # or if we hit the Status line
            if (
                line.startswith("Manager:")
                or line.startswith("Attorney:")
                or (data["status_detail"] and data["status_detail"] in line)
            ):
                break
            detail_lines.append(line)
        data["details"] = " ".join(detail_lines)

    return data


def main():
    abs_input_dir = os.path.abspath(INPUT_DIR)
    abs_output_dir = os.path.abspath(OUTPUT_DIR)

    if not os.path.exists(abs_input_dir):
        print(f"Error: {INPUT_DIR} not found.")
        return

    os.makedirs(abs_output_dir, exist_ok=True)

    files = [f for f in os.listdir(abs_input_dir) if f.endswith(".txt")]
    print(f"Processing {len(files)} chunks...")

    results = []
    for filename in files:
        path = os.path.join(abs_input_dir, filename)
        with open(path, encoding="utf-8") as f:
            content = f.read()

        extracted = extract_data(filename, content)
        if extracted:
            output_filename = filename.replace(".txt", ".json")
            output_path = os.path.join(abs_output_dir, output_filename)

            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(extracted, f, indent=4)

            results.append(extracted)

    print(f"Extraction complete. {len(results)} JSON files created in {OUTPUT_DIR}.")


if __name__ == "__main__":
    main()
