import os
import fitz
import json
import sys
import re
from pathlib import Path
from datetime import datetime
from dateutil.relativedelta import relativedelta
from typing import List, Dict, Optional, Any, Union

def parse_entity(entity: str) -> Dict[str, Optional[str]]:
    lines: List[str] = [line.strip() for line in entity.splitlines() if line.strip()]
    result: Dict[str, Optional[str]] = {
        "index": None, 
        "entity_number": None,
        "business_name": None,
        "dba_name": None,
        "address": None,
        "zipcode": None,
        "license_number": None,
        "status": None,
        "alcohol_type": None,
        "minutes_date": None,
        "application_expiration_date": None, 
        "file_name": None
    }

    if not lines:
        print("WARNING: Empty entity data found, skipping")
        return result

    application_details: str = " ".join(lines).lower()
    result["file_name"] = lines[-1]

    if lines:
        match: Optional[re.Match[str]] = re.match(r"^(\d+)\.?\s*(.+)", lines[0])
        if match:
            result["entity_number"] = match.group(1)
            result["business_name"] = match.group(2).strip()
            print(f"INFO: Parsed entity {result['entity_number']}: {result['business_name']}")
        else:
            print(f"WARNING: Could not parse entity number/name from: '{lines[0]}'")

    for line in lines:
        lower_line: str = line.lower()

        if "doing business as:" in lower_line:
            dba_match: Optional[re.Match[str]] = re.search(r"doing business as:\s*(.+)", line, re.IGNORECASE)
            if dba_match:
                result["dba_name"] = dba_match.group(1).strip()

        if "license" in lower_line:
            license_match: Optional[re.Match[str]] = re.search(r"license\s*#:\s*([\w\-]+)", line, re.IGNORECASE)
            if license_match:
                result["license_number"] = license_match.group(1).strip()

        if not result["address"] and re.search(r"\d{5}$", line):
            result["address"] = line.strip()
            zip_match: Optional[re.Match[str]] = re.search(r"\b(\d{5})\b", line)
            if zip_match:
                result["zipcode"] = zip_match.group(1)

    if (
        "applied" in application_details and
        ("all-alcoholic beverages" in application_details or "all alcoholic beverages" in application_details) and
        "common victualler" in application_details and
        "7 day" in application_details
    ):
        result["alcohol_type"] = "All Alcoholic Beverages"
        print(f"INFO: Entity {result['entity_number']} classified as 'All Alcoholic Beverages'")

    elif (
        "applied" in application_details and
        "wines and malt beverages" in application_details and
        "common victualler" in application_details and
        "7 day" in application_details
    ):
        result["alcohol_type"] = "Wines and Malt Beverages"
        print(f"INFO: Entity {result['entity_number']} classified as 'Wines and Malt Beverages'")

    if not result["entity_number"]:
        print("WARNING: Entity missing required entity number")
    if not result["business_name"]:
        print(f"WARNING: Entity {result['entity_number']} missing business name")
    if not result["address"]:
        print(f"WARNING: Entity {result['entity_number']} missing address")

    return result

# Extracts the first hearing date from the first page of the PDF.
# Assumes the date is in "Month DD, YYYY" format and exists on page 1.
# If date does not exist the enity date will be marked as None
def extract_hearing_date(pdf_path: str) -> datetime:
    date_pattern: str = r"(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}"
    doc: fitz.Document = fitz.open(pdf_path)
    page: fitz.Page = doc[0]
    text: str = page.get_text()
    match: Optional[re.Match[str]] = re.search(date_pattern, text)
    if match:
        date_str: str = match.group()
        try:
            date_obj: datetime = datetime.strptime(date_str, "%B %d, %Y")
            return date_obj
        except Exception as e:
            raise ValueError(f"Could not conver date string to iso format: {e}")
    else:
        raise ValueError(f"Could not find date in the pdf: {e}")

def extract_entities_from_pdf(pdf_path: str) -> List[str]:
    heading_regex: str = r'^\d+\.?\s+.*'
    entities: List[str] = []
    current_entity_lines: List[str] = []
    in_target_section: bool = False

    try:
        doc: fitz.Document = fitz.open(pdf_path)
    except Exception as e:
        print(f"ERROR: Cannot open PDF '{pdf_path}': {e}")
        sys.exit(1)

    file_name: str = os.path.basename(pdf_path)
    print(f"\nProcessing document: {file_name}")

    for page_num in range(doc.page_count):
        page: fitz.Page = doc.load_page(page_num)

        try:
            page_dict: Dict[str, Any] = page.get_text("dict", flags=fitz.TEXT_PRESERVE_LIGATURES | fitz.TEXT_PRESERVE_WHITESPACE)
            for block in page_dict["blocks"]:
                if block['type'] == 0:
                    for line in block['lines']:
                        stop_processing_line: bool = False
                        for span in line['spans']:
                            span_text: str = span['text'].strip()
                            if not span_text:
                                continue

                            if 'Transactional Hearing' in span_text:
                                in_target_section = True
                                continue

                            if 'Non-Hearing Transactions' in span_text:
                                in_target_section = False
                                stop_processing_line = True
                                break

                            heading_match: Optional[re.Match[str]] = re.match(heading_regex, span_text)
                            if in_target_section and heading_match and span['flags'] == 20:
                                if current_entity_lines:
                                    current_entity_lines.append(file_name)
                                    entities.append('\n'.join(current_entity_lines))
                                    current_entity_lines = []
                                current_entity_lines.append(span_text)
                            elif in_target_section:
                                current_entity_lines.append(span_text)

                        if stop_processing_line or not in_target_section:
                            pass
        except Exception as e:
            print(f"Error processing page {page_num + 1} in {pdf_path}: {e}")
            continue

    if current_entity_lines:
        current_entity_lines.append(file_name)
        entities.append('\n'.join(current_entity_lines))

    doc.close()
    return entities

def write_to_file(result: List[Dict[str, Optional[str]]]) -> None:
    """
    Appends new parsed entities to `data.json`, assigning incremental indices 
    only if the file is not empty (i.e., not a seeding run).
    
    If `data.json` is empty, it is assumed that the incoming `result` is from 
    a seeding step and that each entity already contains its own `index`.
    """
    pdf_folder: str = os.getcwd()
    output_file: str = os.path.join(pdf_folder, "..client/src/data/licenses.json")
    existing_data: List[Dict[str, Optional[str]]] = []

    if os.path.exists(output_file):
        try:
            with open(output_file, "r") as f:
                content = f.read().strip()
                if content:
                    existing_data = json.loads(content)
        except Exception as e:
            print(f"Error: Failed to read from json: {e}")
    

    if existing_data:
        last_entity_index = existing_data[len(existing_data)-1]['index']
        for i, entity in enumerate(result, start=last_entity_index+1):
            entity["index"] = i


    existing_data.extend(result)

    try:
        with open(output_file, "w") as f:
            json.dump(existing_data, f, indent=4)
    except Exception as e:
        print(f"Error: Failed writing data to file: {e}")

def process_pdf(file_name: str, option: str = "default") -> List[Dict[str, Optional[str]]]:
    pdf_folder: str = os.getcwd()
    pdf_path: str = os.path.join(pdf_folder, file_name)
    if not os.path.isfile(pdf_path):
        print(f"Error: File does not exist: {file_name}")
        sys.exit(1)
    date: Optional[datetime] = None
    expiration_date: Optional[datetime] = None
    try:
        date = extract_hearing_date(pdf_path)
        expiration_date = date + relativedelta(years=1)
    except Exception as e:
        print(f"Could not get date {pdf_path} : {e}")

    entities: List[str] = extract_entities_from_pdf(pdf_path)
    final_result: List[Dict[str, Optional[str]]] = []
    for entity_data in entities: 
        try:
            result: Dict[str, Optional[str]] = parse_entity(entity_data)
        except Exception as e:
            print(f"WARNING: Failed to parse entity: {e}")
            continue
        if result['alcohol_type'] in ('Wines and Malt Beverages', 'All Alcoholic Beverages'):
            result['file_name'] = file_name
            result['minutes_date'] = date.date().isoformat()
            result['application_expiration_date'] = expiration_date.date().isoformat()
            result['status'] = 'Deferred'
            final_result.append(result)
            print('--------------------------')

    if(option == 'seeding'):
        return final_result

    write_to_file(final_result)
    return final_result 

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(f"Usage: argument should be extract_entity.py <pdf_filename>")
        sys.exit(1)
    process_pdf(sys.argv[1])

# Can be used to load just a single pdf
# if __name__ == "__main__":
#     process_pdf('Voting Minutes 7-17-25.docx.pdf')
