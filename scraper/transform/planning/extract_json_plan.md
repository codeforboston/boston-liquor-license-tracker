# Extraction to JSON Plan

This plan outlines the heuristics and logic required to map the unstructured text in `license_text/` to the defined `license_schema.json`.

## Goal
To process 2,338 text chunks and extract structured attributes into a JSON format suitable for fine-tuning or indexing.

## Heuristics per Field

| Field | Heuristic / Detection Logic |
| :--- | :--- |
| **license_number** | Search for `License #:`, `License#:` (case-insensitive). Capture the alphanumeric code (e.g., LB-12345). |
| **legal_name** | Assume the first non-empty line of the chunk is the legal entity name. |
| **dba** | Look for prefixes like `D/B/A:`, `Doing business as:`, `DBA:`. Capture the remaining text on that line. |
| **address** | Aggregate all lines between the entity/dba lines and the license number line. |
| **category** | Look for sentinel phrases: `Holder of`, `Has applied for`. Assign the matching phrase. |
| **manager** | Search for `Manager:` or `Manager.`. Capture the text immediately following or surrounding it. |
| **attorney** | Search for `Attorney:`. Capture the name following the colon. |
| **status** | Inspect the last 1-2 lines of the chunk for decision keywords: `Granted`, `Deferred`, `Dismissed`, `No Action Taken`. |
| **hours** | Look for `Hours of Operation:` or `Closing Time:`. Capture the time range. |
| **details** | Capture the block of text that begins with the category phrase (`Holder of...`) and ends before the status/manager section. |
| **source** | Use the basename of the input `.txt` file. |

## Proposed Implementation

### Extraction Script
#### [NEW] [extract_to_json.py](file:///Users/dan/Code/Vibe_Coding/Licensing-Board-Finetune/extract_to_json.py)
A Python script that will:
1. Iterate over all files in `license_text/`.
2. Apply the heuristics above to each chunk.
3. Handle partial matches (e.g., if "Attorney" is missing, set to `null`).
4. Save each result as a separate `.json` file in a new directory `license_json/`.
5. Generate a `summary.json` containing the list of all processed records.

## Verification Plan

### Automated
- Validate generated JSON files against `license_schema.json` using a schema validator.
- Check for "Missing mandatory field" errors (Legal Name and License Number).

### Manual
- Pick 5 chunks with complex descriptions and 5 with simple manager changes to verify that the `details` and `manager` fields were parsed correctly.
