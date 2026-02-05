import json
import re
from collections import defaultdict
from pathlib import Path
import fitz
from dataclasses import dataclass, field, asdict, is_dataclass
from enum import Enum, auto

files = ["Voting Minutes 2-13-25.docx.pdf", "Voting Minutes 6-26-25.docx.pdf"]
eligible_zipcodes = [
    "02118", "02119", "02121", "02122",
    "02124", "02125", "02126", "02128",
    "02129", "02130", "02131", "02132",
    "02136",
]

boston_zip_regex = re.compile(r"^(02118|02119|02121|02122|02124|02125|02126|02128|02129|02130|02131|02132|02136|Oak Square|All Others)$", re.IGNORECASE)

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
    "Allston", "Boston", "Brighton", "Charlestown", "Chestnut Hill", "Dorchester",
    "East Boston", "Hyde Park", "Jamaica Plain", "Mattapan", "Mission Hill",
    "Quincy", "Roslindale", "Roxbury", "South Boston", "West Roxbury", "Back Bay",
]

neigh_pattern = "|".join([re.escape(n) for n in neighborhoods])

DBA_RE = re.compile(r"^\s*doing\s+business\s+as:\s*(.+?)\s*$", re.IGNORECASE)
ADDR1_RE = re.compile(r"^\s*\d+.*\s+(St|Ave|Blvd|Rd|Square)\.?$", re.IGNORECASE)
ADDR2_RE = re.compile(
    rf"^\s*(?:{neigh_pattern}),?\s*MA\b.*$",
    re.IGNORECASE,
)

LIC_FRAGMENTS = [
    r"^\s*(Common\s+Victualler.*?License)\s*$",
    r"^\s*(Club All-Alcoholic Beverages License)\s*$",
    r"^\s*(General On-Premise All Alcoholic Beverages License)\s*$",
]
LIC_RE = re.compile(rf"(?:{'|'.join(LIC_FRAGMENTS)})", re.IGNORECASE)

END_RE = re.compile(r"^\s*-+\s*$")


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


def dataclass_default(obj):
    if is_dataclass(obj):
        return asdict(obj)
    raise TypeError


class LineType(Enum):
    SECTION_TRIGGER = auto()
    ZIP_HEADER = auto()
    BUSINESS = auto()
    DETAIL = auto()
    STATUS = auto()
    END = auto()

class ResultParser:
    def __init__(
            self,
            section_trigger: str,
            zip_header_regex: re.Pattern,
            section_line_regex: re.Pattern,
            dba_regex: re.Pattern,
            business_regex: re.Pattern,
            addr1_regex: re.Pattern,
            addr2_regex: re.Pattern,
            license_regex: re.Pattern,
    ) -> None:
        self.section_trigger = section_trigger
        self.zip_header_regex = zip_header_regex
        self.section_line_regex = section_line_regex
        self.dba_regex = dba_regex
        self.business_regex = business_regex
        self.addr1_regex = addr1_regex
        self.addr2_regex = addr2_regex
        self.license_regex = license_regex
        self.reset_state()


    def reset_state(self) -> None:
        self.current_zip = None
        self.in_target_section = False
        self.current_restaurant = None
        self.capturing_status_tail = False
        self.current_record: BusinessRecord | None = None

    def parse(self, file_path: Path) -> dict[str, list[BusinessRecord]]:
        lines = list(self.get_itr_lines(file_path))
        return self._parse_lines(lines)

    def _parse_lines(self, lines: ParsedLine) -> dict[str, list[BusinessRecord]]:
    # structure: ZIP_RESULT[zip] = [ {business_name, status, status_block, ...}, ... ]
        result: dict[str, list[BusinessRecord]] = defaultdict(list)
        self.reset_state()
        for line in lines:
            line_type = self._classify_line(line)
            text = line.text
            text = text.replace("\u200b","")
            if not line_type:
                continue
            # 1) enter target section
            if line_type==LineType.SECTION_TRIGGER:
                self.in_target_section = True

            if not self.in_target_section:
                continue

            # 2) if capturing status tail: keep appending until next business line
            if self.capturing_status_tail:
                if (self.current_zip and line_type == LineType.BUSINESS) or (line_type == LineType.ZIP_HEADER):
                    # next business starts; stop tail capture and fall through to business handler
                    self.capturing_status_tail = False
                else:
                    # still part of previous restaurant's status/explanation
                    if self.current_record is not None:
                        self.current_record.status_line.append(text)
                    continue

            if self.capturing_status_tail and line_type == LineType.END:
                break

            # 3) zip header
            if line_type == LineType.ZIP_HEADER and line.is_bold:
                self.current_zip = text
                result.setdefault(text, [])          # list of records per zip
                self.current_record = None
                continue

            # ignore everything until a zip is set
            if not self.current_zip:
                continue

            # 4) business name line
            if line_type == LineType.BUSINESS:
                record = BusinessRecord(zip_code=self.current_zip, business_name=text)
                result[self.current_zip].append(record)
                self.current_restaurant = text
                self.current_record = record
                continue

            if line_type == LineType.DETAIL and self.current_restaurant and self.current_record and not line.is_bold:
                record = next((r for r in result[self.current_zip] if r.business_name == self.current_restaurant), None)
                m = self.dba_regex.match(text)

                if m:
                    record.dba = m.group(1)
                    continue

                # Address line 1 (Street)
                m = self.addr1_regex.match(text)
                if m:
                    record.addr1 = text
                    continue

                # Address line 2 (City, ST ZIP)
                m = self.addr2_regex.match(text)
                if m:
                    record.addr2 = text
                    continue

                # License line
                m = self.license_regex.match(text)
                if m:
                    record.license_type = text
                    continue

            # 5) status line: start tail capture
            if line_type == LineType.STATUS:
                if self.current_record is not None:
                    # STATE["current_record"]["status"] = text
                    self.current_record.status_line.append(text)
                self.capturing_status_tail = True
                continue


        return result


    def _is_section_ender_status(self, text) -> bool:
            return SECTION_LINE_RE.search(text)

    def _something_that_looks_like_business_name(self, text) -> bool:
        text = text.lower()
        return BUSINSESS_NAME_RE.search(text)

    def _classify_line(self, line: ParsedLine) -> LineType|None :
        normalized = line.text.strip().lower()
        normalized = normalized.replace("\u200b", "")
        if self.section_trigger in normalized:
            return LineType.SECTION_TRIGGER
        if boston_zip_regex.match(normalized) and line.is_bold:
            return LineType.ZIP_HEADER
        if self._something_that_looks_like_business_name(normalized) and line.is_bold:
            return LineType.BUSINESS
        if self.dba_regex.match(normalized) or self.addr1_regex.match(normalized) or self.addr2_regex.match(normalized) or self.license_regex.match(normalized):
            return LineType.DETAIL
        if self._is_section_ender_status(normalized) and line.is_bold:
            return LineType.STATUS
        return None

    def get_itr_lines(self, file_loc: Path):
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

def build_parser() -> ResultParser:
    return ResultParser(
        section_trigger=SECTION_TARGET,
        zip_header_regex=boston_zip_regex,
        section_line_regex=SECTION_LINE_RE,
        business_regex=BUSINSESS_NAME_RE,
        dba_regex=DBA_RE,
        addr1_regex=ADDR1_RE,
        addr2_regex=ADDR2_RE,
        license_regex=LIC_RE,
    )

def main(file_path: str) -> None:
    parser = build_parser()
    result = parser.parse(Path(file_path))
    print(json.dumps(result, indent=4, default=dataclass_default))

path = Path(__file__).resolve().parent
path = path /"Voting Minutes 7-31-25.docx.pdf"
main(path)
