from app.utils.boston_address_parser import BostonAddressParser

from .context import ExtractionContext


class AddressDetailsExtractor:
    priority = 35

    def run(self, ctx: ExtractionContext) -> None:
        address = ctx.data.get("address")
        if not address:
            return

        parser = BostonAddressParser()
        parsed = parser.parse_address(address)

        ctx.data["street_number"] = parsed.get("street_number")
        ctx.data["street_name"] = parsed.get("full_street_name")
        ctx.data["city"] = parsed.get("neighborhood")
        ctx.data["state"] = parsed.get("state")
        ctx.data["zipcode"] = parsed.get("zipcode")
