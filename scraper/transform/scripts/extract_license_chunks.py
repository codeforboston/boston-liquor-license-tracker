import os
import re

from dateutil import parser

# Configuration
INPUT_DIR = "data/transactional_hearings_txt"
OUTPUT_DIR = "data/license_text"

# Regex for the start of a license chunk: "1. ", "10. ", etc. at beginning of line
CHUNK_START_RE = re.compile(r"^\d+\.\s+")

# Regex for identifying a license number pattern (case-insensitive, flexible spacing/colon)
# Matches "License#", "license #", "LICENSE : #", etc.
LICENSE_NUMBER_RE = re.compile(r"license\s*:?\s*#\s*:?", re.IGNORECASE)


def get_hearing_date(first_line, filename):
    """
    Extracts hearing date from the first line of the text.
    Returns format "Date:YYYY-MM-DD" or "Date:null".
    """
    if not first_line:
        return "Date:null"

    # Try parsing the first line
    try:
        # fuzzy=True allows extracting date from strings like "December 22nd transactional hearings"
        dt = parser.parse(first_line, fuzzy=True)

        # Check if year is reasonable (if dateutil uses current year as default,
        # but the filename indicates a different year, we might need to adjust.
        # However, many hearings have the year explicitly.)

        # If the first line is very short and generic like "Transactional Hearing",
        # parser.parse might return today's date or fail.
        # Let's check if the raw line actually contains month names or numbers.
        has_date_content = (
            any(
                month in first_line.lower()
                for month in [
                    "jan",
                    "feb",
                    "mar",
                    "apr",
                    "may",
                    "jun",
                    "jul",
                    "aug",
                    "sep",
                    "oct",
                    "nov",
                    "dec",
                ]
            )
            or re.search(r"\d{1,2}/\d{1,2}", first_line)
            or re.search(r"\d{4}", first_line)
        )

        if has_date_content:
            return f"Date:{dt.strftime('%Y-%m-%d')}"
    except (ValueError, OverflowError):
        pass

    # If first line parsing fails, try filename as fallback if it contains a date pattern
    # voting_minutes_2020-04-23.txt
    match = re.search(r"(\d{4}-\d{2}-\d{2})", filename)
    if match:
        return f"Date:{match.group(1)}"

    return "Date:null"


# STATUS_KEYWORDS indicate the end of a license entry
STATUS_KEYWORDS = [
    "Granted",
    "Deferred",
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


def save_chunk(filename, hearing_date_line, chunk_text):
    """Utility to save a chunk to a file."""
    try:
        with open(filename, "w", encoding="utf-8") as f:
            f.write(f"{hearing_date_line}\n")
            f.write(chunk_text)
        # print(f"Saved chunk: {os.path.basename(filename)}")
    except Exception as e:
        print(f"Error writing chunk {filename}: {e}")


def split_by_status(lines):
    """
    Alternative chunking for multi-license chunks.
    Splits the lines into sub-chunks based on STATUS_KEYWORDS.
    """
    sub_chunks = []
    current_sub = []
    for line in lines:
        current_sub.append(line)
        lower_line = line.strip().lower()
        # Check if line contains any status keyword as a whole word or significant phrase
        found_status = False
        for kw in STATUS_KEYWORDS:
            if kw.lower() in lower_line:
                # Special case: "see old and new business" is handled in extract_hearings.py
                # but here we just look for terms that terminate a license description.
                # If we find a keyword, we finish this sub-chunk.
                found_status = True
                break

        if found_status:
            sub_chunks.append(current_sub)
            current_sub = []

    if current_sub:
        sub_chunks.append(current_sub)
    return sub_chunks


def process_file(input_path, output_dir_base):
    try:
        with open(input_path, encoding="utf-8") as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Error reading {input_path}: {e}")
        return

    basename = os.path.splitext(os.path.basename(input_path))[0]

    # Extract hearing date from the first line
    first_non_empty_line = ""
    for line in lines:
        if line.strip():
            first_non_empty_line = line.strip()
            break

    hearing_date_line = get_hearing_date(
        first_non_empty_line, os.path.basename(input_path)
    )

    chunks = []
    current_chunk = []

    for line in lines:
        if CHUNK_START_RE.match(line):
            # Start of a new chunk detected
            if current_chunk:
                chunks.append(current_chunk)
            current_chunk = [line]
        else:
            if current_chunk:
                current_chunk.append(line)

    # Append the last chunk
    if current_chunk:
        chunks.append(current_chunk)

    output_idx = 1
    for idx, chunk_lines in enumerate(chunks, 1):
        chunk_text = "".join(chunk_lines)

        # Count occurrences of the license number pattern
        matches = LICENSE_NUMBER_RE.findall(chunk_text)

        if len(matches) == 1:
            # Valid chunk: exactly one license number found
            output_filename = f"{basename}_{output_idx}.txt"
            output_path = os.path.join(output_dir_base, output_filename)
            save_chunk(output_path, hearing_date_line, chunk_text)
            output_idx += 1
        elif len(matches) > 1:
            # Attempt alternative chunking
            # print(f"Attempting split for multi-license chunk {idx} in {os.path.basename(input_path)}...")
            sub_chunks = split_by_status(chunk_lines)
            for sub in sub_chunks:
                sub_text = "".join(sub)
                sub_matches = LICENSE_NUMBER_RE.findall(sub_text)
                if len(sub_matches) == 1:
                    output_filename = f"{basename}_{output_idx}.txt"
                    output_path = os.path.join(output_dir_base, output_filename)
                    save_chunk(output_path, hearing_date_line, sub_text)
                    output_idx += 1
                elif len(sub_matches) > 1:
                    print(
                        f"Skipping sub-chunk in {os.path.basename(input_path)}: still multiple license numbers ({len(sub_matches)} found)"
                    )
        else:
            # Invalid chunk: zero license numbers
            # print(f"Skipping chunk {idx} in {os.path.basename(input_path)}: missing license numbers")
            pass


def main():
    abs_input_dir = os.path.abspath(INPUT_DIR)
    abs_output_dir = os.path.abspath(OUTPUT_DIR)

    if not os.path.exists(abs_input_dir):
        print(f"Input directory not found: {abs_input_dir}")
        return

    os.makedirs(abs_output_dir, exist_ok=True)

    files = [f for f in os.listdir(abs_input_dir) if f.endswith(".txt")]
    print(f"Processing {len(files)} files from {INPUT_DIR}...")

    for filename in files:
        input_path = os.path.join(abs_input_dir, filename)
        process_file(input_path, abs_output_dir)

    total_files_after = len(os.listdir(abs_output_dir))
    print(f"Done. Extracted {total_files_after} new license chunks into {OUTPUT_DIR}.")


if __name__ == "__main__":
    main()
