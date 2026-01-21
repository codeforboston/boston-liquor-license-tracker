# License Schema Inference Plan

This plan describes how to analyze the `license_text/` directory to derive a common JSON schema that represents the license data structure.

## Goal
To programmatically inspect the extracted license chunks and identify the key-value pairs and logical data fields present in the text, eventually producing a consolidated JSON schema.

## Proposed Changes

### Analysis Script
#### [NEW] [infer_license_schema.py](file:///Users/dan/Code/Vibe_Coding/Licensing-Board-Finetune/infer_license_schema.py)
A Python script that will:
- Read files from `license_text/`.
- Clean each line (remove separators like `---`, `===`, `___`).
- Identify common prefixes (e.g., `D/B/A:`, `Manager:`, `License #:`) to use as preliminary keys.
- Use simple heuristics to determine field meanings (e.g., the first line is usually the entity name, address lines follow).
- Aggregate all discovered "keys" across the entire corpus.
- Generate a summary of common fields and a proposed JSON schema structure.

## Inference Logic

### Text Cleaning
- Remove lines that are purely whitespace or punctuation separators.
- Trim leading/trailing whitespace.

### Key Identification
- Lines containing colons (e.g., `Manager:  Sam Putnam`) will be treated as `Key: Value` candidates.
- Pattern-based keys: `License #`, `D/B/A`, `Hours of Operation`, `Manager`, `Closing Time`, `Attorney`.

### Positional Logic
- **Row 1:** Usually the legal entity name.
- **Row 2:** Usually the "Doing Business As" (D/B/A) name.
- **Lines before the license number:** Typically address information.
- **Lines after the license number:** Petition details, manager changes, or applied-for descriptions.

## Output
The script will output a `license_schema.json` (or similar) representing the superset of all identified fields.

## Verification Plan

### Automated
- Run the script and count unique keys found.
- Verify that mandatory fields like "License Number" and "Entity Name" are present in the inferred schema.

### Manual
- Review a subset of extracted chunks and compare them against the inferred schema to ensure no major data points were missed.
