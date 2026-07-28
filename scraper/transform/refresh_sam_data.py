"""Download a local snapshot of Boston's Live SAM address data.

This is the ONLY component that touches the network. The extraction pipeline
reads the snapshot locally and never makes external calls. SAM addresses
change infrequently, so this is run out-of-band to refresh the snapshot:

    uv run python refresh_sam_data.py

It writes to `data/sam_addresses.csv` (see `sam_index.SAM_DATA_PATH`).

Source: https://data.boston.gov/dataset/live-street-address-management-sam-addresses
"""

import csv
import time

import requests

from app.pipeline.extraction.sam_index import SAM_DATA_PATH, SAM_FIELDS

SAM_QUERY_URL = (
    "https://gisportal.boston.gov/arcgis/rest/services/"
    "SAM/Live_SAM_Address/FeatureServer/0/query"
)
PAGE_SIZE = 2000  # SAM's maxRecordCount
REQUEST_TIMEOUT = 60


def fetch_all() -> list[dict]:
    """Page through the whole SAM layer and return the attribute rows."""
    rows: list[dict] = []
    offset = 0
    while True:
        params = {
            "where": "1=1",
            "outFields": ",".join(SAM_FIELDS),
            "returnGeometry": "false",
            "orderByFields": "OBJECTID",  # stable ordering for pagination
            "resultOffset": offset,
            "resultRecordCount": PAGE_SIZE,
            "f": "json",
        }
        resp = requests.get(SAM_QUERY_URL, params=params, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        payload = resp.json()
        if "error" in payload:
            raise RuntimeError(f"SAM API error: {payload['error']}")

        features = payload.get("features") or []
        rows.extend(f.get("attributes", {}) for f in features)
        print(f"  fetched {len(rows)} rows...", flush=True)

        if len(features) < PAGE_SIZE:
            break
        offset += PAGE_SIZE
        time.sleep(0.2)  # be polite to the endpoint

    return rows


def main() -> None:
    print(f"Downloading SAM addresses from:\n  {SAM_QUERY_URL}")
    rows = fetch_all()

    SAM_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(SAM_DATA_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=SAM_FIELDS, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field) for field in SAM_FIELDS})

    print(f"Wrote {len(rows)} rows to {SAM_DATA_PATH}")


if __name__ == "__main__":
    main()
