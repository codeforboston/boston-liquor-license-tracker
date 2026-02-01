import json
import re
from collections import defaultdict
from pathlib import Path
import fitz
from dataclasses import dataclass, field, asdict, is_dataclass
from enum import Enum, auto
from typing import Optional

files = ["Voting Minutes 2-13-25.docx.pdf", "Voting Minutes 6-26-25.docx.pdf"]
eligible_zipcodes = [
    "02118", "02119", "02121", "02122",
    "02124", "02125", "02126", "02128",
    "02129", "02130", "02131", "02132",
    "02136",
]

boston_zip_regex = re.compile(r"^(02118|02119|02121|02122|02124|02125|02126|02128|02129|02130|02131|02132|02136|Oak Square|All Others)$")

STATE = {
    "in_target_section" : False,
    "current_zip": None,
    "current_restaurant": None,
    "restaurant_start": False,
    "restaurant_end": False,
    "capturing_status_tail": False,
}

@dataclass
class BusinessRecord:
    zip_code: str
    business_name: str
    dba: str = ""
    addr1: str = ""
    addr2: str = ""
    license_type: str = ""
    status_line: list[str] = field(default_factory=list)

@dataclass
class ParsedLine:
    text: str
    is_bold: bool
    page_num: int
    raw: dict


neighborhoods = [
    'Allston', 'Boston', 'Brighton', 'Charlestown', 'Chestnut Hill', 'Dorchester', 
    'East Boston', 'Hyde Park', 'Jamaica Plain', 'Mattapan', 'Mission Hill', 
    'Quincy', 'Roslindale', 'Roxbury', 'South Boston', 'West Roxbury', 'Back Bay'
]

neigh_pattern = "|".join([re.escape(n) for n in neighborhoods])

DBA_RE = re.compile(r"^\s*doing\s+business\s+as:\s*(.+?)\s*$", re.IGNORECASE)
ADDR1_RE = re.compile(r"^\s*\d+[A-Za-z]?(?:-\d+[A-Za-z]?)?\s+[A-Za-z]+(?:\s+[A-Za-z]+)*\s+(?:St|Ave|Blvd)\.?", re.IGNORECASE)
ADDR2_RE = re.compile(
    rf"^\s*(?:{neigh_pattern}),?\s*MA\b.*$",
    re.IGNORECASE,
)

LIC_RE = re.compile(r"^\s*(Common\s+Victualler.*?License)\s*$")




SECTION_TARGET = "the board deferred deliberation on the following applications for new alcoholic beverages licenses"

BUSINSESS_NAME_RE = re.compile(r"\b(llc|l\.l\.c\.|corp|corp\.|corporation|inc|inc\.|co|company|ltd|ltd\.|club)\b")

SECTION_LINE_RE = re.compile(
    r"(?i)\b("
    r"the board\b.*\b(voted|vote|grant|approve|deny|defer|deferred|denied|acknowledge|approved)\b"
    r"|will hold\b.*\bactive status\b"
    r"|deferred deliberation\b"
    r"|wines\s+and\s+malt\s+beverages\b"
    r"|all\s+alcoholic\s+beverages\b"
    r"|licenses?\b"
    r"|zip\s*code\s*restricted\b"
    r")",
)

ZIP_RESULT = defaultdict(dict)

def dataclass_default(obj):
    if is_dataclass(obj):
        return asdict(obj)
    raise TypeError

def reset_state() -> None:
    STATE["current_zip"] = None
    STATE["current_restaurant"] = None
    STATE["capturing_status_tail"] = False
    STATE["restaurant_start"] = False
    STATE["restaurant_end"] = False

class LineType(Enum):
    SECTION_TRIGGER = auto()
    ZIP_HEADER = auto()
    BUSINESS = auto()
    DETAIL = auto()
    STATUS = auto()


def main():

    current_dir = Path.cwd()
    file_loc = current_dir/files[0]
    print(file_loc)

    if not file_loc.exists():
        return "file not found"

    entites = parse(file_loc)
    print(json.dumps(entites, indent=4, default=dataclass_default))

    return None


def is_section_ender_status(line, text) -> bool:
    text = text.lower()
    return SECTION_LINE_RE.search(text) and line.is_bold

def something_that_looks_like_business_name(text) -> bool:
    text = text.lower()
    return BUSINSESS_NAME_RE.search(text)

def parse(file_path: Path) -> dict[str, list[BusinessRecord]]:
    lines = list(get_itr_lines(file_path))
    return _parse_lines(lines)

def _classify_line(line: ParsedLine) -> LineType|None :
    normalized = line.text.strip().lower()
    if SECTION_TARGET in normalized:
        return LineType.SECTION_TRIGGER
    if boston_zip_regex.match(normalized) and line.is_bold:
        return LineType.ZIP_HEADER
    if something_that_looks_like_business_name(normalized) and line.is_bold:
        return LineType.BUSINESS
    if DBA_RE.match(normalized) or ADDR1_RE.match(normalized) or LIC_RE.match(normalized) or ADDR2_RE.match(normalized):
        return LineType.DETAIL

    return None
    

def _parse_lines(lines: ParsedLine) -> dict[str, list[BusinessRecord]]:
    # structure: ZIP_RESULT[zip] = [ {business_name, status, status_block, ...}, ... ]
    reset_state()
    for line in lines:
        line_type = _classify_line(line)
        text = line.text
        if not line_type:
            continue
        # 1) enter target section
        if line_type==LineType.SECTION_TRIGGER:
            STATE["in_target_section"] = True

        if not STATE.get("in_target_section"):
            continue

        # 2) if capturing status tail: keep appending until next business line
        if STATE.get("capturing_status_tail"):
            if (STATE.get("current_zip") and line.is_bold and something_that_looks_like_business_name(text)) or (boston_zip_regex.match(text) and line.is_bold):
                # next business starts; stop tail capture and fall through to business handler
                STATE["capturing_status_tail"] = False
            else:
                # still part of previous restaurant's status/explanation
                if STATE.get("current_record") is not None:
                    STATE["current_record"].status_line.append(text)
                continue

        # 3) zip header
        if line_type==LineType.ZIP_HEADER and line.is_bold:
            STATE["current_restaurant"] = None
            STATE["current_zip"] = text
            ZIP_RESULT.setdefault(text, [])          # list of records per zip
            STATE["current_record"] = None
            continue

        # ignore everything until a zip is set
        if not STATE.get("current_zip"):
            continue

        # 4) business name line
        if line_type==LineType.BUSINESS:
            record = BusinessRecord(zip_code=STATE["current_zip"], business_name=text)
            ZIP_RESULT[STATE["current_zip"]].append(record)
            STATE["current_restaurant"] = text
            STATE["current_record"] = record
            STATE["restaurant_start"] = True
            continue

        if STATE["restaurant_start"] and STATE["current_restaurant"] and STATE["current_record"] and not line.is_bold:
            record = next((r for r in ZIP_RESULT[STATE["current_zip"]] if r.business_name == STATE["current_restaurant"]), None)
            text_lower = text.lower()
            m = DBA_RE.match(text)

            if m:
                record.dba = m.group(1)
                continue

            # Address line 2 (City, ST ZIP)
            m = ADDR2_RE.match(text)
            if m:
                record.addr2 = text
                continue

            # Address line 1 (Street)
            m = ADDR1_RE.match(text)
            if m:
                record.addr1 = text
                continue

            # License line
            m = LIC_RE.match(text)
            if m:
                record.license_type = m.group(1)
                continue

        # 5) status line: start tail capture
        if line.is_bold and is_section_ender_status(line, text):
            if STATE.get("current_record") is not None:
                # STATE["current_record"]["status"] = text
                STATE["current_record"].status_line.append(text)

            STATE["restaurant_end"] = True
            STATE["capturing_status_tail"] = True
            continue


    return ZIP_RESULT


def get_itr_lines(file_loc: Path):
    if fitz is None:
        raise RuntimeError("fitz is required")

    file_data: fitz.Doc = fitz.open(str(file_loc))
    empty_pattern = re.compile(r"\u200b")

    for page_num in range(file_data.page_count):
        page: fitz.Page = file_data.load_page(page_num)
        page_dict = page.get_text("dict")
        blocks = page_dict.get("blocks", [])
        for block in blocks:
            if block.get("type") != 0:
                continue
            for line in block.get("lines", []):
                spans = []
                is_bold = False
                text_parts = []
                # if result_section_found:
                    #I need to check for bold zipcodes
                    # i need to process these lines
                    # 1. if empty or just special character in line without text, avoid it
                    # 2. remove empty or special spans from the text for the line
                    # once we have the line, we can check for regex
                for span in line.get("spans", []):
                    raw_text = span.get("text", "").strip()
                    if not raw_text or empty_pattern.match(raw_text):
                        continue
                    spans.append(span)
                    text_parts.append(raw_text)
                    flags = span.get("flags", 4)
                    font_name = span.get("font", "").lower()
                    if "bold" in font_name or flags == 20:
                        is_bold = True

                if not text_parts:
                    continue

                normalized_text = "".join(text_parts)
                yield ParsedLine(
                    text=normalized_text,
                    is_bold=is_bold,
                    page_num=page_num,
                    raw={"block": block, "line": line, "spans": spans},
                )

                    #     if not (span["flags"] == 20 and "bold" in span["font"].lower()):
                    #         continue

                    # text_line = text_line.strip()
                    # if boston_zip_regex.match(text_line) and is_bold:
                    #     print(f"found {text_line}")

                # if "The Board deferred deliberation on the following applications for new alcoholic beverages licenses" in text:
                #     result_section_found = True




main()
