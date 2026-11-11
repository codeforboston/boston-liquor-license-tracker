# Published data

Data in this folder is bundled into the site and shown on the live pages.

| File | What it is | How it changes |
|---|---|---|
| `licenses.json` | Every Chapter 202 (2024) zip-code-restricted license application the site tracks | Written by the data pipeline (`scripts/merge_licenses.py`). **Don't edit it by hand.** Put fixes in `scripts/data/license_corrections.json`, which the pipeline applies on every run. See [DATA_DICTIONARY.md](../../../DATA_DICTIONARY.md). |
| `schema/license-schema.json` | JSON Schema for `licenses.json` | Edited by hand; validated in CI by **Validate Licenses** |
| `last_processed_date.json` | Date of the newest voting minutes the pipeline has processed | Written by the data pipeline |
| `next-meeting-date.json` | Next Licensing Board meeting date shown on the site | Written by the **Get Next Meeting Date** workflow |
| `boston-zip-codes.json` | GeoJSON zip code boundaries drawn on the map | Edited by hand (rarely) |
| `extra-work-data.ts` | Cards in the home page's "Check out more of our work!" section | Edited by hand |
| `locales/xx-YY.json` | Translated text for each language | See below |

## locales/xx-YY.json

One file per supported language: `en-US.json` (English, the source of truth), `es-ES.json` (Spanish), `zh-CN.json` (Simplified Chinese) and `zh-TW.json` (Traditional Chinese). Keys missing from a translation fall back to English. To add a language, add its file and register it in [`src/i18n/i18n-config.ts`](../i18n/i18n-config.ts). See the [i18n README](../i18n/README.md).
