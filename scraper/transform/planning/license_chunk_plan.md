# License Chunk Extraction Plan

This plan describes how to further refine the extracted transactional hearings into individual license data chunks.

## Goal
The objective is to split the extracted transactional hearing text files into smaller files, each containing exactly one license's details.

## Proposed Changes

### Extraction Script
#### [NEW] [extract_license_chunks.py](file:///Users/dan/Code/Vibe_Coding/Licensing-Board-Finetune/extract_license_chunks.py)
A Python script that will:
- Read files from `transactional_hearings_txt/`.
- Identify the start of each license chunk using a regular expression or simple prefix check for patterns like `1. `, `2. `, etc. at the start of a line.
- Capture all lines until the next numbered item or the end of the file.
- Validate that the chunk contains **exactly one** instance of a license number label (e.g., "License #", "License#", "license #:", etc.).
- Save each valid chunk into the `license_text/` directory.

## Extraction Logic Details

### Start of Chunk
A line that matches the pattern `^\d+\.\s+` (e.g., "1.   SOME COMPANY NAME").

### End of Chunk
- The start of the next line matching `^\d+\.\s+`.
- OR the end of the file.

### Validation Rule
A chunk is ONLY saved if it contains a license number pattern **exactly once**.
The pattern matching will be robust to variations (case-insensitive, optional spaces, optional colons):
- `License #`
- `license#`
- `LICENSE #: `
- `License: #`
(Regex equivalent: `(?i)license\s*:?\s*#\s*:?`)
- If a chunk contains zero license numbers, it is discarded.
- If a chunk contains multiple license numbers, it is discarded (this helps identify cases where the splitter might have missed a boundary).

### File Naming Convention
The output files will be named using the source filename and the item index:
`license_text/[source_filename_without_ext]_[item_index].txt`
Example: `voting_minutes_2021-04-29_1.txt`

## Verification Plan

### Automated Tests
- Run the script and ensure `license_text/` is populated.
- Check that every file in `license_text/` contains "License #: ".

### Manual Verification
- Verify `voting_minutes_2021-04-29.txt` in `license_text/`:
  - Should have ~23 chunks.
  - Each chunk should start with the numbered heading and end just before the next one.
