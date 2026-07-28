from .context import ExtractionContext
from .sam_index import lookup


class SamAddressIdExtractor:
    """Enrich a parsed address with its canonical SAM ids.

    Runs immediately after AddressDetailsExtractor (priority 35), so the
    parsed street_number / street_name / zipcode fields are already on
    ctx.data before this runs.

    Uses a local snapshot of Boston's Live SAM dataset (see `sam_index` and
    `refresh_sam_data.py`) for an exact match on
    street_number + street_name + ZIP. On a match, it sets SAM_ADDRESS_ID and
    BUILDING_ID; on no match (or missing input) both stay None.

    No network access: the snapshot is read locally, so extraction stays
    offline and deterministic. Ranges (e.g. "1463-1467") use the low end for
    the lookup; fuller range handling is deferred.
    """

    priority = 37

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

        ctx.data["sam_address_id"], ctx.data["building_id"] = lookup(
            number, street_name, zipcode
        )

    @staticmethod
    def _lookup_number(street_number: str) -> str | None:
        """Reduce a parsed street number to a single value for the lookup.

        "1463-1467" -> "1463" (low end; ranges deferred)
        "605A"      -> "605A"
        """
        first = street_number.split("-", 1)[0].strip()
        return first or None