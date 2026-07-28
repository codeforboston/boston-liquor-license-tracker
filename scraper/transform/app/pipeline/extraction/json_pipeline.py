from .address import AddressExtractor
from .address_details import AddressDetailsExtractor
from .base import Extractor
from .category import CategoryExtractor
from .dba import DBAExtractor
from .details import DetailsExtractor
from .header import HeaderExtractor
from .license_number import LicenseNumberExtractor
from .people import PeopleExtractor
from .sam_address_id import SamAddressIdExtractor
from .status import StatusExtractor

EXTRACTORS: list[Extractor] = sorted(
    [
        HeaderExtractor(),  # minutes_date, business_name
        LicenseNumberExtractor(),  # license_number
        DBAExtractor(),  # dba_name
        CategoryExtractor(),  # alcohol_type
        AddressExtractor(),  # address
        AddressDetailsExtractor(),  # street_number, street_name, city, state, zipcode
        SamAddressIdExtractor(),  # sam_address_id, building_id (SAM validation)
        PeopleExtractor(),  # manager, attorney
        StatusExtractor(),  # status
        DetailsExtractor(),  # status_detail
    ],
    key=lambda e: e.priority,
)
