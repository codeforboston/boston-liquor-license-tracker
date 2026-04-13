# Data Dictionary — Boston Liquor License Tracker

This document describes all data entities, their fields, types, and validation rules used across the project.

---

## Table of Contents

1. [Business License (Published)](#1-business-license-published)
2. [Extracted License Data (Internal Processing)](#2-extracted-license-data-internal-processing)
3. [Link Tracking Entities](#3-link-tracking-entities)
4. [Tracking & Metadata](#4-tracking--metadata)
5. [GIS Data](#5-gis-data)
6. [Configuration Constants](#6-configuration-constants)
7. [Application Status Types](#7-application-status-types)
8. [Localization Data](#8-localization-data)
9. [Extra Work / Partnership Data](#9-extra-work--partnership-data)
10. [Internal Processing Keys (KVStore)](#10-internal-processing-keys-kvstore)

---

## 1. Business License (Published)

**Files:** `client/src/data/licenses.json`, `client/src/data/schema/license-schema.json`  
**TypeScript Interface:** `client/src/services/data-interface/data-interface.ts` → `BusinessLicense`

The primary published data entity. Each record represents one liquor license applicant that appeared in an official Boston Licensing Board voting minutes PDF.

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `index` | integer | Yes | min: 1 | Unique sequential index assigned when writing to file |
| `entity_number` | string | Yes | pattern: `^[0-9]+$` | Number associated with the license in the voting minutes |
| `business_name` | string | Yes | min length: 1 | Registered legal business name |
| `dba_name` | string \| null | No | — | "Doing Business As" name; null if not applicable |
| `address` | string | Yes | min length: 5 | Full business address |
| `zipcode` | string | Yes | pattern: `^[0-9]{5}$`; see eligible zipcodes below | 5-digit ZIP code extracted from address |
| `license_number` | string | Yes | pattern: `^LB-[0-9]+$` | License number assigned by the Licensing Board (e.g., `LB-123456`) |
| `status` | string | Yes | enum: `Deferred`, `Granted` | Application status as shown in the client |
| `alcohol_type` | string | Yes | enum: `Wines and Malt Beverages`, `All Alcoholic Beverages` | Type of alcoholic beverage license |
| `minutes_date` | string (date) | Yes | format: `YYYY-MM-DD` | Date of voting minutes where this license appears |
| `application_expiration_date` | string (date) | Yes | format: `YYYY-MM-DD` | Date by which the application will expire |
| `file_name` | string | Yes | min length: 1 | Voting minutes PDF filename where this license appears |

### Eligible ZIP Codes (`EligibleBostonZipcode`)

The 13 ZIP codes established by 2024 legislation for non-transferable, zipcode-restricted licenses (excludes 3 Oak Square licenses):

`02118`, `02119`, `02121`, `02122`, `02124`, `02125`, `02126`, `02128`, `02129`, `02130`, `02131`, `02132`, `02136`

---

## 2. Extracted License Data (Internal Processing)

**Files:** `scraper/transform/app/pipeline/json_extractor.py`, `scraper/transform/app/pipeline/extraction/`  
**Python Dataclass:** `scraper/transform/app/pipeline/extraction/context.py` → `ExtractionContext`

Internal fields extracted from voting minutes PDFs during the transform pipeline. Not all fields are published; they are used to build the final `BusinessLicense` record.

| Field | Type | Source Extractor | Description |
|-------|------|-----------------|-------------|
| `minutes_date` | string \| None | `HeaderExtractor` | Voting minute date extracted from PDF header text |
| `license_number` | string \| None | `LicenseNumberExtractor` | Regex pattern: `License\s*#?\s*:?\s*(?:LB\|L)\s*[-]?\s*(\d+)` |
| `business_name` | string \| None | `HeaderExtractor` | Extracted from first/second line of license block |
| `dba_name` | string \| None | `DBAExtractor` | Regex pattern: `(?:D/B/A\|Doing business as\|DBA)\s*:\s*(.*)` |
| `address` | string \| None | `AddressExtractor` | Combined address lines between license number and category markers |
| `street_number` | string \| None | `AddressDetailsExtractor` | Parsed from full address via `BostonAddressParser` |
| `street_name` | string \| None | `AddressDetailsExtractor` | Full street name parsed from address |
| `city` | string \| None | `AddressDetailsExtractor` | Neighborhood/city parsed from address |
| `state` | string \| None | `AddressDetailsExtractor` | State (typically `MA`) |
| `zipcode` | string \| None | `AddressDetailsExtractor` | 5-digit ZIP code parsed from address |
| `alcohol_type` | string \| None | `CategoryExtractor` | Detected from keywords: `all alcoholic`, `common victualler`, `malt`, `wine` |
| `manager` | string \| None | `PeopleExtractor` | Regex: `Manager\s*:\s*(.*)` or `([^,\.\n]+?)\s*,\s*Manager\.` |
| `attorney` | string \| None | `PeopleExtractor` | Regex: `Attorney\s*:\s*(.*)` |
| `status` | string \| None | `StatusExtractor` | Normalized status value (see status keywords below) |
| `status_detail` | string \| None | `StatusExtractor` | Raw status text from the last 7 lines of the license block |
| `details` | string \| None | `DetailsExtractor` | Additional text between category and manager/attorney sections |
| `entity_number` | string | `TextJsonExtractorStep` | Extracted from the store key (number after last underscore) |
| `file_name` | string | `TextJsonExtractorStep` | Extracted from the store key (filename without numeric suffix) |

### Status Keywords

The `StatusExtractor` maps raw PDF text to normalized values using these keywords:

| Normalized Value | Raw Keywords |
|-----------------|-------------|
| `granted` | Granted, No Violation, No Action Taken |
| `deferred` | Deferred, Defer |
| `rescheduled` | RE-SCHEDULED, RESCHEDULED |
| `continued` | Continued |
| `withdrawn` | Withdrawn |
| `rejected` | Rejected, Denied, Failed to Appear, Dismissed, Dismiss |

---

## 3. Link Tracking Entities

### 3a. Voting Minutes Links

**File:** `scraper/scrape/data/voting_minutes_links.json`

Links to voting minutes PDFs discovered on boston.gov.

| Field | Type | Description |
|-------|------|-------------|
| `href` | string | Relative URL path to the voting minutes PDF on boston.gov |
| `body` | string | Description text (e.g., `Voting Minutes: Thursday, January 8`) |
| `date` | string (date) | Extracted date in `YYYY-MM-DD` format |

### 3b. Hearing Video Links

**File:** `scraper/scrape/data/hearing_video_links.json`

Links to YouTube hearing videos discovered on boston.gov.

| Field | Type | Description |
|-------|------|-------------|
| `href` | string | Full URL to the YouTube video (`youtube.com` or `youtu.be`) |
| `body` | string | Description text (e.g., `Violation Hearing: Tuesday, January 6`) |

### 3c. Link Statistics Log

**File:** `scraper/scrape/data/link_stats_log.csv`

CSV log tracking metrics on link discovery and processing across scraper runs.

---

## 4. Tracking & Metadata

### 4a. Next Meeting Date

**File:** `client/src/data/next-meeting-date.json`

| Field | Type | Description |
|-------|------|-------------|
| `nextMeetingDate` | string (ISO-8601) | Timestamp of the next scheduled Licensing Board meeting |

### 4b. Last Processed Date

**File:** `client/src/data/last_processed_date.json`

| Field | Type | Description |
|-------|------|-------------|
| `date` | string (ISO-8601) | Timestamp of when license data was last processed by the pipeline |

---

## 5. GIS Data

### Boston ZIP Code Boundaries

**File:** `client/src/data/boston-zip-codes.json`  
**Format:** GeoJSON `FeatureCollection`

Used to render the ZIP code map in the client application. Each feature is a polygon boundary for one ZIP code.

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Always `"FeatureCollection"` |
| `features` | array | Array of GeoJSON `Feature` objects |

Each `Feature`:

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | ZIP code identifier |
| `geometry` | Polygon | Coordinate array defining the ZIP code boundary |
| `properties` | object | Additional display/metadata properties |

---

## 6. Configuration Constants

**File:** `client/src/services/data-interface/data-interface.ts`

License allocation limits established by the 2024 Massachusetts legislation.

| Constant | Value | Description |
|----------|-------|-------------|
| `MAX_LICENSES_AVAILABLE` | 195 | Total non-transferable, zipcode-restricted licenses available |
| `MAX_BEER_WINE_LICENSES` | 78 | Maximum "Wines and Malt Beverages" licenses |
| `MAX_ALL_ALC_LICENSES` | 117 | Maximum "All Alcoholic Beverages" licenses |
| `MAX_AVAILABLE_PER_ZIP` | 15 | Maximum licenses per ZIP code (5 per year × 3 years) |
| `MAX_ALL_ALC_PER_ZIP` | 9 | Maximum all-alcohol licenses per ZIP code |
| `MAX_BEER_WINE_PER_ZIP` | 6 | Maximum beer/wine licenses per ZIP code |

---

## 7. Application Status Types

**File:** `client/src/services/data-interface/data-interface.ts`

```typescript
type ApplicationStatusType = "Granted" | "Expired" | "Deferred"
```

| Value | Description |
|-------|-------------|
| `Granted` | License application was approved by the Licensing Board |
| `Deferred` | Application decision was postponed to a future meeting |
| `Expired` | Application passed its `application_expiration_date` without a grant |

---

## 8. Localization Data

**Directory:** `client/src/data/locales/`

Translation files for the client UI. Each file is keyed by locale code.

| Locale Code | Language |
|-------------|----------|
| `en-US` | English |
| `es` | Spanish |
| `ht` | Haitian Creole |
| `zh-CN` | Mandarin Chinese (Simplified) |
| `vi` | Vietnamese |
| `zh-HK` | Cantonese (Traditional) |
| `ht-CR` | Cape Verdean Creole |
| `ru` | Russian |
| `ar` | Arabic |
| `pt` | Portuguese |
| `fr` | French |

---

## 9. Extra Work / Partnership Data

**File:** `client/src/data/extra-work-data.ts`

Metadata for partner organizations displayed on the site.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Internal identifier (e.g., `"offsite"`, `"bootcamp"`, `"cfb"`) |
| `title` | string | Display name for the organization |
| `imgSrc` | string | Path to the partner's logo/image |
| `href` | string | URL to the partner's external website |

---

## 10. Internal Processing Keys (KVStore)

**File:** `scraper/transform/app/constants.py`

Key names used in the transform pipeline's internal key-value store as data flows between processing steps.

| Key | Value Type | Description |
|-----|-----------|-------------|
| `pdf_file_path` | string | Filesystem path to the source PDF |
| `pdf_text` | string | Full raw text extracted from the PDF |
| `hearing_section` | string | Transactional hearing section isolated from the full PDF text |
| `license_text_data` | dict | Indexed chunks of license text extracted from the hearing section |
| `license_json_data` | list[dict] | Final structured JSON records ready for publication |

### Hearing Section Boundary Markers

The pipeline uses text markers to isolate the transactional hearing section from the full PDF.

**Start markers** (any of):
- `"Transactional Hearings,"`
- `"The Board held a transactional hearing on"`
- `"Hearing Date:"`

**Stop markers** (any of):
- `"Old & New Business"`
- `"Non Hearing Common Victualler Transactions"`
- `"Non-Hearing Transactions"`
