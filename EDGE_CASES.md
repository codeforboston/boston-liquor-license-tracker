# Edge Cases & Known Data Anomalies

The Boston Licensing Board publishes its voting minutes as PDFs that are typed by hand, formatted inconsistently, and occasionally malformed. The transform pipeline parses them with regex and positional rules, so a stray line break or a missing period can silently change what ends up in `licenses.json`.

This document is the catalogue of anomalies we know about and have already worked around. Read it when a pipeline run produces output that looks wrong, before assuming you have found a new bug — the behaviour you are looking at may be a deliberate patch.

Field-level definitions live in [DATA_DICTIONARY.md](DATA_DICTIONARY.md). This file covers what is *wrong* with the source data and what we do about it.

## Contents

- [1. Per-PDF Anomaly Plugins](#1-per-pdf-anomaly-plugins)
  - [1a. post_text — raw PDF text](#1a-post_text--raw-pdf-text)
  - [1b. post_hearing — extracted hearing section](#1b-post_hearing--extracted-hearing-section)
  - [1c. File-scoped vs content-scoped plugins](#1c-file-scoped-vs-content-scoped-plugins)
- [2. Scraper-Side Exclusions](#2-scraper-side-exclusions)
- [3. Lossy Status Normalization](#3-lossy-status-normalization)
- [4. Silent Nulls](#4-silent-nulls)
- [5. Adding a New Plugin](#5-adding-a-new-plugin)

---

## 1. Per-PDF Anomaly Plugins

**Directory:** `scraper/transform/app/violation_plugins/`

Each plugin targets one known-bad document. A plugin declares `query()` — should I run? — and `run()` — patch the text in the KV store. They are discovered dynamically by `InvariantPluginStep` (`app/pipeline/invariant_plugins.py`), which walks the package for the requested stage, so adding a file is all that is needed to register one.

Plugins run at two stages:

| Stage | KV key patched | When |
|---|---|---|
| `post_text` | `pdf_text` | After text extraction, before any parsing |
| `post_hearing` | `hearing_section` | After the hearing section has been sliced out |

All current plugins declare `priority = 10` (lower runs first; the `Plugin` base class defaults to `100`).

### 1a. post_text — raw PDF text

| Plugin | What is wrong in the PDF | What the patch does |
|---|---|---|
| `violation_2020-09-10` | 19 entity numbers are written `1)`, `2)` … instead of `1.`, `2.` | Regex rewrites line-leading `(\d+)\)` to `\1.` |
| `violation_2021-02-04` | The hearing date's year is split across a line break: the text reads `February 3, 202` then a newline. See the caveat below. | Completes the year to `2021` |
| `violation_2021-09-30` | 28 entity numbers lost their trailing period; six of them also merged with the business name (`17 HSI MCA BOS FB, LLC`) | Line-by-line lookup table restoring `17.`, `19.`, `23.`, `24.`, `25.`, `28.` and the bare numbers |
| `violation_2022-09-29` | `Licensed Premise Informational Hearing` is not a recognised section boundary, so the parser runs past it | Inserts `***FORCE STOP***` before the line |
| `violation_2024-03-07` | Same problem with `Licensed Premise Inspection Hearing on` — it would be parsed as a transactional hearing | Inserts `***FORCE STOP***` before the line |
| `violation_2025-05-01` | A three-line all-caps policy statement (`THE BOARD WILL DEFER DELIBERATION ON ALL NEW ALCOHOLIC BEVERAGES …`) sits inside the license block and parses as a license-level action | Deletes the three lines, collapses runs of blank lines to at most two, and inserts a `***FORCE STOP***` before `Informational Hearing on Thursday, May 1, 2025` |
| `violation_2025-06-26` | `See Old and New Business` lines break a downstream parsing invariant | Deletes any line containing the phrase |

**Caveat on `violation_2021-02-04`.** The patch does a plain `str.replace` of `Transactional Hearing: Wednesday, February 3, 202` with the same string plus `1`. Because the search string is a *prefix* of the corrected text, re-running it against already-correct text would produce `February 3, 20211`. This is harmless today — each plugin runs once per pipeline run — but if the Board ever republishes this PDF with the year intact, the patch will corrupt it rather than no-op. Anyone touching this plugin should make the match anchored or conditional.

### 1b. post_hearing — extracted hearing section

Six of these eight fix the same underlying problem: PyMuPDF extracts a line break that should not be there, or fails to extract one that should, so a `Doing business as:` value runs into the address that belongs on the next line.

| Plugin | What is wrong in the PDF | What the patch does |
|---|---|---|
| `violation_2020-09-17` | Business name is wrapped in double quotes: `"ARIZONA B.B.Q. & HOUSE OF PIZZA"` | Strips the quotes |
| `violation_2021-10-07` | `Doing business as: Jokr, 45 Franklin St., Boston, MA 02110` — DBA and address on one line | Splits after the DBA name |
| `violation_2022-06-30` | Same, McCormick & Schmicks Seafood Restaurant / 300 Faneuil Hall Marketplace | Splits after the DBA name |
| `violation_2022-11-17` | Same, Del Friscos Double Eagle Steakhouse / 888 Boylston St. | Splits after the DBA name |
| `violation_2023-08-17` | Label reads `Doing business:` instead of `Doing business as:`, so the DBA regex misses it | Rewrites the label |
| `violation_2023-12-14` | Address runs into the license number: `211 Hanover St, Boston, MA 02113 License #: LB-99356` | Splits before `License #:` |
| `violation_2024-09-26` | Entity number `23 Locale, Inc.` is missing its period | Rewrites to `23. Locale, Inc.` |
| `violation_Easton-Boston` | The city is misspelled `Easton Boston` | Rewrites to `East Boston` |

### 1c. File-scoped vs content-scoped plugins

This distinction matters when you add a plugin.

**Fourteen of the fifteen are file-scoped.** Their `query()` matches on a substring of `pdf_file_path`:

```python
def query(self, store):
    pdf_file_path = store.get(const.PDF_FILE_PATH)
    return "voting_minutes_2020-09-10" in pdf_file_path
```

They fire for exactly one document and are inert everywhere else.

**`violation_Easton-Boston` is the exception.** It matches on content, not filename:

```python
def query(self, store):
    hearing_section = store.get(const.HEARING_SECTION)
    return "Easton Boston" in hearing_section
```

It therefore applies to *any* PDF containing the typo. That is deliberate — the misspelling currently appears in two documents (`voting_minutes_2023-02-16` and `voting_minutes_2023-05-25`), and writing it as a file-scoped plugin would have meant two near-identical files plus a third the next time the Board makes the same typo.

Prefer file-scoped when the anomaly is a one-off transcription error. Prefer content-scoped when it is a recurring habit.

---

## 2. Scraper-Side Exclusions

**Directory:** `scraper/scrape/`

Three things cause a link or a document to be skipped or substituted before the transform pipeline ever sees it.

**Link filters** (`app/link_filters/`) run over every link harvested from boston.gov:

| Filter | Behaviour |
|---|---|
| `client_side_filter` | Drops non-navigational hrefs: `tel:`, `mailto:`, `#`, `javascript:` |
| `exclude_list_filter` | Drops anything matching `data/url_exclude_list.json` (42 entries) — boston.gov chrome such as `/neighborhoods`, `/departments`, `/career-center`, accessibility and contact pages |
| `video_link_filter` | Separates hearing video links into `data/hearing_video_links.json` and removes them from the voting-minutes stream |

**Exception PDFs** (`data/exception_pdfs/`) are documents placed in the repo by hand. `DownloaderService._copy_exception_pdfs()` copies everything in that directory into the download directory on every run, bypassing download and PDF validation entirely. Use it when a PDF cannot be fetched, or fails `pikepdf` validation, but a good copy is available another way.

Currently one file lives there: `voting_minutes_2025-10-01.pdf`.

---

## 3. Lossy Status Normalization

`StatusExtractor` collapses the Board's free-text outcomes into six values. The mapping is **not reversible** — once normalized, the original wording is gone from `status`, though the raw text is preserved in `status_detail`.

| Normalized | Absorbs |
|---|---|
| `granted` | Granted, **No Violation**, **No Action Taken** |
| `deferred` | Deferred, Defer |
| `rescheduled` | RE-SCHEDULED, RESCHEDULED |
| `continued` | Continued |
| `withdrawn` | Withdrawn |
| `rejected` | Rejected, **Denied**, **Failed to Appear**, **Dismissed**, Dismiss |

The bolded entries are the ones that surprise people. A record showing `granted` may mean the Board found no violation at a disciplinary hearing, not that it approved a new license. Likewise `rejected` covers an applicant who simply did not appear. Read `status_detail` before drawing conclusions from `status`.

---

## 4. Silent Nulls

**`sam_address_id` and `building_id`** come from `SamAddressIdExtractor`, which matches against Boston's Live SAM dataset on an exact match of street number + street name + ZIP. Any mismatch — an abbreviation, a unit number, a typo in the minutes — yields `None` for both. There is no exception, no log line, and no flag on the record.

A null here means "no exact match was found", not "this address does not exist".

---

## 5. Adding a New Plugin

1. **Pick a stage.** Patch `post_text` if the problem is in the raw PDF text or spans the whole document. Patch `post_hearing` if it is confined to a single license block inside the hearing section.
2. **Name the file** `violation_<YYYY-MM-DD>.py` for a one-off document, or `violation_<Description>.py` for a content-triggered fix.
3. **Subclass `Plugin`** from `app/violation_plugins/base.py` and implement `query()` and `run()`. Set `priority = 10` unless ordering against an existing plugin matters.
4. **Read and write through `constants`** — `const.PDF_FILE_PATH`, `const.PDF_TEXT`, `const.HEARING_SECTION` — rather than string literals.
5. **Keep the patch as narrow as possible.** Match the exact malformed string, not a general pattern, so the plugin cannot affect documents it was not written for.
6. **Write a header comment** stating the document, the anomaly, and what breaks without the fix.
7. **Add a row to the table above.**

No registration step is required; `InvariantPluginStep` discovers the module automatically.

---

## Verification

Every anomaly listed in section 1 was confirmed present in its source PDF by re-running the pipeline's own extraction logic (`PDFTextExtractorStep`: per-page `get_text()`, underscore-only lines removed, non-ASCII stripped) and searching for the exact string each plugin targets. All 15 plugins are live; none has been made redundant by an upstream correction.
