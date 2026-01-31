import json
import csv
import re
import os
from pathlib import Path

# Canonical source: Boston's SAM (Street Address Management) dataset
# https://data.boston.gov/dataset/live-street-address-management-sam-addresses
#
# The following values are derived from the SAM dataset:
#   - Street suffix abbreviations
#   - Zip codes
#   - Neighborhoods


STREET_SUFFIX_ABBR = ['Aly', 'Ave', 'Blvd', 'Cir', 'Cirt', 'Cres', 'Ct', 'Ctr', 'Cwy',
                    'Dm', 'Dr', 'Drwy', 'Ext', 'Gdn', 'Gdns', 'Grn', 'Hwy', 'Ln',
                    'Mall', 'Park', 'Path', 'Pkwy', 'Pl', 'Plz', 'Rd', 'Row',
                    'Sq', 'St', 'Ter', 'Vw', 'Way', 'Whf']

STREET_SUFFIX_FULL = ['Alley', 'Avenue', 'Boulevard', 'Center', 'Circle', 'Circuit',
                    'Court', 'Crescent', 'Crossway', 'Dam', 'Drive', 'Driveway',
                    'Extension', 'Garden', 'Gardens', 'Green', 'Highway', 'Lane',
                    'Mall', 'Park', 'Parkway', 'Path', 'Place', 'Plaza', 'Road',
                    'Row', 'Square', 'Street', 'Terrace', 'View', 'Way', 'Wharf']

class BostonAddressParser:
    def __init__(self):
        self.neighborhoods= ['Allston', 'Boston', 'Brighton', 'Charlestown', 'Chestnut Hill', 'Dorchester', 'East Boston', 'Hyde Park', 
        'Jamaica Plain', 'Mattapan', 'Mission Hill', 'Quincy', 'Roslindale', 'Roxbury', 'South Boston', 'West Roxbury', 'Back Bay']

    def parse_address(self,address):
        normalized_address = {}
        normalized_address['street_number'] = self.extract_street_number(address)
        normalized_address['full_street_name'] = self.extract_full_street_name(address)
        normalized_address['neighborhood'] = self.extract_neighborhood(address)
        normalized_address['state'] = self.extract_state(address)
        normalized_address['zipcode'] = self.extract_zipcode(address)
        return normalized_address

    
    def extract_state(self,address: str):
        if not isinstance(address, str):
            return None

        match = re.search(r"\b([A-Za-z]{2})\b,?(?:\s+\d{5})?$", address.strip())
        if match:
            return match.group(1).upper()
        return None    

    def extract_zipcode(self,address: str):
        if not isinstance(address, str):
            return None

        # Split the address by spaces
        tokens = address.strip().split()
        # Search from the end; ZIP codes are usually at the end
        for token in reversed(tokens):
            # Remove trailing punctuation
            clean_token = token.rstrip(",.")
            # Check if it’s 5 digits or 5+4 digits
            if clean_token.isdigit() and len(clean_token) == 5:
                return clean_token
            elif len(clean_token) == 10 and clean_token[:5].isdigit() and clean_token[5] == '-' and clean_token[6:].isdigit():
                return clean_token

        return None

    def extract_neighborhood(self,address: str):
        neighborhoods_sorted = sorted(self.neighborhoods, key=len, reverse=True)
        if not isinstance(address, str):
            return None
        farthest_idx = -1
        selected_neighborhood = None

        addr_lower = address.lower()

        # Check neighborhoods in descending length order
        for neighborhood in neighborhoods_sorted:
            neighborhood_lower = neighborhood.lower()
            idx = addr_lower.rfind(neighborhood_lower)
            if idx > farthest_idx:
                #print(f"Found {neighborhood} at index {idx}")
                farthest_idx = idx
                if selected_neighborhood and 'Boston' in selected_neighborhood:
                    pass # If we already have a Boston neighborhood, don't change it
                elif selected_neighborhood and 'Roxbury' in selected_neighborhood:
                    pass # If we already have a Roxbury neighborhood, don't change it
                else:
                    selected_neighborhood = neighborhood

        return selected_neighborhood

    def extract_full_street_name(self,address: str):
        if not isinstance(address, str):
            return None

        addr_lower = address.lower()

        town = self.extract_neighborhood(address)
        if town is None:
            return None

        # Get street number if any
        street_number = self.extract_street_number(address)
        if street_number is None:
            start_idx = 0
        else:
            tokens = street_number.split()
            street_number = tokens[len(tokens)-1]
            start_idx = addr_lower.find(street_number.lower()+' ')+len(street_number)

        town_lower = town.lower()

        # Find the last occurrence of the town
        idx = addr_lower.rfind(town_lower)
        if idx == -1:
            return None

        # Everything between street number (or start) and last town occurrence
        street = address[start_idx:idx]

        # Strip trailing/leading spaces, commas, etc.
        street = street.strip(" ,")
        street = street.title()
        street = self.normalize_street_suffix(street)

        return street

    def extract_street_number(self,address: str):
        if not isinstance(address, str):
            return None

        address = address.lstrip()
        if not address:
            return None

        tokens = address.split()
        if not tokens:
            return None
        # Initialize number list
        number_parts = []

        # Loop over tokens until we hit a non-number / non-range token
        for token in tokens:
            clean_token = token.rstrip(",.")  # remove punctuation
            # Accept formats like: 605, 605A, 605-607, 605-607A
            if clean_token[0].isdigit():
                number_parts.append(clean_token)
            elif "-" in clean_token:
                number_parts.append(clean_token)
            else:
                break  # stop at first token that doesn't start with digit

        if not number_parts:
            return None

        # Combine consecutive number tokens for cases like "605 - 607"
        street_number = " ".join(number_parts)
        return street_number.strip()

    def normalize_street_suffix(self,street_name: str) -> str:
        # Build lookup maps (case-insensitive)
        FULL_TO_ABBR = {f.lower(): a for f, a in zip(STREET_SUFFIX_FULL, STREET_SUFFIX_ABBR, strict=True)}
        ABBR_SET = {a.lower(): a for a in STREET_SUFFIX_ABBR}
        
        if not isinstance(street_name, str):
            return street_name

        s = street_name.strip()

        # remove trailing punctuation and collapse spaces
        s = re.sub(r"[.,]+$", "", s)
        s = re.sub(r"\s+", " ", s)

        parts = s.split(" ")
        last = parts[-1].lower()

        # Case 1: already an abbreviation we recognize
        if last in ABBR_SET:
            parts[-1] = ABBR_SET[last]
            return " ".join(parts)

        # Case 2: full suffix → abbreviation
        if last in FULL_TO_ABBR:
            parts[-1] = FULL_TO_ABBR[last]
            return " ".join(parts)

        # Case 3: no suffix detected → return cleaned name
        return s


####################################################################
# THIS CODE IS NOT USED IN THE PARSER, IT IS JUST FOR TESTING
####################################################################

def main():
    print(os.getcwd())
    base_path = Path(__file__).resolve().parent.parent
    input_json = base_path / "client/src/data/licenses.json"
    output_csv = base_path / "client/src/data/parsed_addresses.csv"

    parser = BostonAddressParser()

    # Load JSON (expects a list of dicts)
    with open(input_json, "r", encoding="utf-8") as f:
        records = json.load(f)

    rows = []

    for rec in records:
        address = rec.get("address")

        if not address:
            continue

        parsed = parser.parse_address(address)

        row = {
            "minutes_date": rec.get("minutes_date", ""),
            "license_number": rec.get("license_number", ""),
            "business_name": rec.get("business_name", ""),
            "dba_name": rec.get("dba_name", ""),
            "original_address": address,
            "street_number": parsed.get("street_number", ""),
            "full_street_name": parsed.get("full_street_name", ""),
            "neighborhood": parsed.get("neighborhood", ""),
            "state": parsed.get("state", ""),
            "zipcode": parsed.get("zipcode", ""),
            "alcohol_type": rec.get("alcohol_type", ""),
            "status": rec.get("status", ""),
            "attorney": rec.get("attorney", ""),
            "manager": rec.get("manager", ""),
            "file_name": rec.get("file_name", ""),
            

        }

        rows.append(row)

    # Write CSV
    fieldnames = [
        "minutes_date",
        "license_number",
        "business_name",
        "dba_name",
        "original_address",
        "street_number",
        "full_street_name",
        "neighborhood",
        "state",
        "zipcode",
        "alcohol_type",
        "status",
        "attorney",
        "manager",
        "file_name",
    ]

    with open(output_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"✔ Parsed {len(rows)} addresses → {output_csv}")


if __name__ == "__main__":
    main()
