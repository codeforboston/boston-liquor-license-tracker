# Product Requirements Document (PRD)

## Transactional Hearing Section Extractor

---

## 1. Overview

### Purpose

Develop a program that processes a directory of plain-text meeting minutes files from a Licensing Board and extracts **only the section related to “Transactional Hearing(s)”** into a new output directory.

Each output file should contain **only the relevant transactional hearing section** from the source file, preserving original line order and formatting.

---

## 2. Goals & Non-Goals

### Goals

* Automatically identify and extract the **Transactional Hearing** section from each input file.
* Handle **multiple known textual variations** for section start and stop markers.
* Preserve original content verbatim (no rewriting or normalization).
* Be robust to formatting inconsistencies (case, punctuation, whitespace).

### Non-Goals

* No NLP, summarization, or semantic interpretation.
* No PDF parsing (input files are already `.txt`).
* No modification of the extracted content beyond trimming unrelated sections.

---

## 3. Input / Output

### Input

* A directory containing one or more `.txt` files.
* Each file represents meeting minutes from a Licensing Board meeting.

### Output

* A new directory containing extracted `.txt` files.
* Output filenames should match input filenames.
* Only the **Transactional Hearing section** should be included.

---

## 4. High-Level Processing Flow

For each text file:

1. Read file line-by-line.
2. Identify the **first occurrence** of a valid  *section start marker* .
3. Begin capturing lines  **starting at that marker** .
4. Continue capturing lines until:
   * A valid *section stop marker* is encountered  **after the section has started** , OR
   * End-of-file is reached.
5. Write captured lines to a corresponding output file.
6. If no start marker is found,  **do not create an output file** .

---

## 5. Section Detection Rules

### 5.1 Start of Section

The section begins when a line contains **any** of the following patterns (case-insensitive, substring match):

#### Start Markers

```
Transactional Hearings,
The Board held a transactional hearing on
Transactional Hearings:
Transactional Hearing
Transactional Hearing:
Transactional Hearing Agenda
Hearing Date:
```

Notes:

* Matching should be **case-insensitive**
* Leading/trailing whitespace should be ignored
* Punctuation and additional trailing text may be present
* A match indicates the **start of the section**

---

### 5.2 Stop of Section

Once inside a Transactional Hearing section, the section ends when a line contains **any** of the following patterns (case-insensitive):

#### Stop Markers

```
Old & New Business
OLD AND NEW BUSINESS
Old and New Business
Non Hearing Common Victualler Transactions
Non-Hearing Common Transactions
Non-Hearing Transactional:
Non-Hearing Transactional Items:
The following are applying for a new Common Victualler License
```

Notes:

* The stop marker line **is NOT included** in the output.
* Stop markers are only relevant **after** a start marker has been found.

---

## 6. Edge Cases & Constraints

### Multiple Start Markers

* If a second start marker is encountered  **before a stop marker** , it should be treated as part of the same section (do not restart extraction).

### Missing Stop Marker

* If no stop marker is found after a start marker, include content until end-of-file.

### Multiple Sections

* Only extract the **first Transactional Hearing section** per file.

### Formatting

* Preserve:
  * Line breaks
  * Indentation
  * Whitespace
* Do **not** trim or normalize text content.

---

## 7. Error Handling

* If a file cannot be read:
  * Log the error
  * Continue processing remaining files
* If no start marker is found:
  * Skip output file creation
* Empty extracted content:
  * Do not write an output file

---

## 8. Configuration & Extensibility

The following should be configurable:

* Input directory path
* Output directory path
* Start marker list
* Stop marker list

Markers should be stored in a  **centralized data structure** , not hard-coded inline.

---

## 9. Acceptance Criteria

✅ Given a directory of meeting minute text files
✅ When the program is executed
✅ Then:

* Only Transactional Hearing sections are extracted
* Output files contain correct, contiguous sections
* No non-relevant sections are included
* Files without a Transactional Hearing section produce no output

---

## 10. Suggested Implementation Notes (Non-Binding)

* Language: Python
* Line-by-line streaming preferred (memory efficient)
* Use simple substring matching (no regex required, but allowed)
* Unit tests should include:
  * Case variation
  * Missing stop marker
  * Multiple possible start markers
  * False positives before section start

---

## 11. Success Definition

The system reliably produces a clean corpus of Transactional Hearing sections suitable for:

* Indexing
* Search
* Downstream NLP or LLM ingestion

---
