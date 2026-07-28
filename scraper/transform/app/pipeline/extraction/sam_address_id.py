import logging

import requests

from .context import ExtractionContext

logger = logging.getLogger(__name__)

# Boston's Live SAM (Street Address Management) address layer, ArcGIS REST.
# https://data.boston.gov/dataset/live-street-address-management-sam-addresses
SAM_QUERY_URL = (
    "https://gisportal.boston.gov/arcgis/rest/services/"
    "SAM/Live_SAM_Address/FeatureServer/0/query"
)
_REQUEST_TIMEOUT = 10  # seconds


class SamAddressIdExtractor:
    """Validate a parsed address against Boston's SAM dataset and, on an
    exact match, enrich the record with the canonical SAM_ADDRESS_ID and
    BUILDING_ID.

    Runs immediately after AddressDetailsExtractor (priority 35), so the
    parsed street_number / street_name / zipcode fields are already on
    ctx.data before this runs.

    Deliberately simple for a first pass (see issue #331 discussion):
      * API-first: query the SAM REST endpoint rather than loading the
        ~400k-row CSV.
      * Exact match on STREET_NUMBER + FULL_STREET_NAME + ZIP_CODE.
      * Take the first returned feature.
      * On no match, request error, or missing input, leave both IDs None.
      * Ranges (e.g. "1463-1467") use the low end for the lookup; fuller
        range handling is deferred.

    Never raises: a SAM outage must not break the extraction pipeline.
    """

    priority = 37

    # Process-wide cache. Many license records share an address, so this
    # avoids duplicate SAM queries within a single run.
    _cache: dict[tuple[str, str, str], tuple[str | None, str | None]] = {}

    def run(self, ctx: ExtractionContext) -> None:
        # Establish the keys up front so downstream consumers always see them.
        ctx.data.setdefault("sam_address_id", None)
        ctx.data.setdefault("building_id", None)

        street_number = ctx.data.get("street_number")
        street_name = ctx.data.get("street_name")
        zipcode = ctx.data.get("zipcode")

        # All three are needed to attempt an exact match.
        if not (street_number and street_name and zipcode):
            return

        number = self._lookup_number(street_number)
        if not number:
            return

        street_name_u = street_name.upper()  # SAM stores names uppercase
        key = (number, street_name_u, zipcode)

        if key not in self._cache:
            self._cache[key] = self._query_sam(number, street_name_u, zipcode)

        ctx.data["sam_address_id"], ctx.data["building_id"] = self._cache[key]

    @staticmethod
    def _lookup_number(street_number: str) -> str | None:
        """Reduce a parsed street number to a single value for the lookup.

        "1463-1467" -> "1463" (low end; ranges deferred)
        "605A"      -> "605A"
        """
        first = street_number.split("-", 1)[0].strip()
        return first or None

    @staticmethod
    def _esc(value: str) -> str:
        """Escape single quotes for an ArcGIS WHERE string literal."""
        return value.replace("'", "''")

    def _query_sam(
        self, number: str, full_street_name: str, zipcode: str
    ) -> tuple[str | None, str | None]:
        # SAM STREET_NUMBER is a string field (and the layer uses
        # standardized queries), so it must be quoted even when numeric.
        where = (
            f"STREET_NUMBER='{self._esc(number)}' "
            f"AND FULL_STREET_NAME='{self._esc(full_street_name)}' "
            f"AND ZIP_CODE='{self._esc(zipcode)}'"
        )
        params = {
            "where": where,
            "outFields": "SAM_ADDRESS_ID,BUILDING_ID",
            "returnGeometry": "false",
            "resultRecordCount": 1,
            "f": "json",
        }

        try:
            resp = requests.get(SAM_QUERY_URL, params=params, timeout=_REQUEST_TIMEOUT)
            resp.raise_for_status()
            payload = resp.json()
        except (requests.RequestException, ValueError) as e:
            logger.warning("SAM query failed (%s): %s", where, e)
            return None, None

        features = payload.get("features") or []
        if not features:
            return None, None

        attrs = features[0].get("attributes", {})
        sam_id = attrs.get("SAM_ADDRESS_ID")
        building_id = attrs.get("BUILDING_ID")

        # ArcGIS may return numeric ids; normalize to str | None.
        return (
            str(sam_id) if sam_id is not None else None,
            str(building_id) if building_id is not None else None,
        )