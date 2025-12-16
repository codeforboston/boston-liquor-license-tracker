"""
This script is a **one-time data load job** used to seed the JSON database (`data.json`)
with initial structured data extracted from a set of PDF files.

It performs the following steps:
1. Scans the current directory for PDF files.
2. Extracts relevant entity data from each PDF using `process_pdf`.
3. Collects and sorts all entity records by hearing date and entity number.
4. Writes the result to `data.json`.

NOTE: This script is intended for initial data ingestion only. For future updates, data would be
obtained by scraping from the webstie directly through a scheduled github action.
"""


import sys 
import os 
from dotenv import load_dotenv
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from extract_entity import process_pdf, read_data


class ArchiveFunctions: 


    def __init__(self):
        load_dotenv()
        self.current_loc = os.getcwd()
        self.LICENSES_JSON = os.getenv("LICENSES_JSON")

    def seed_with_local_files(self):

        pdf_file = [f for f in os.listdir(self.current_loc) if f.endswith('.pdf')]
        print(f"pdf files are {pdf_file}")
        final_result = []
        for pdf in pdf_file:
            try:
                result = process_pdf(pdf, 'seeding')
                final_result.extend(result)
            except Exception as e:
                print(f"Error in file {pdf} : {e}")


       
        data_stored = read_data()

        resultant_data = data_stored + final_result  
        resultant_data = sorted(resultant_data, key=lambda x: (x["minutes_date"], x["entity_number"]))

        for i, entity in enumerate(resultant_data, start=1): 
            entity["index"] = i
        

        output_file: str = os.path.join(self.current_loc, "..", "..", self.LICENSES_JSON)
        try:
            with open(output_file, "w") as f:
                json.dump(resultant_data, f, indent=4)
        except Exception as e:
            raise RuntimeError(f"Failed to write data to {output_file}: {e}")

    
    def reindex_dataset(self):
        # Path to the JSON file
        output_file = os.path.join(self.current_loc, "..", "..", self.LICENSES_JSON)
        
        # Load JSON data
        with open(output_file, "r") as f:
            data = json.load(f)

        # Sort by minutes_date, then entity_number
        sorted_data = sorted(data, key=lambda x: (x["minutes_date"], x["entity_number"]))

        # Reassign sequential indexes
        for i, item in enumerate(sorted_data, start=1):
            item["index"] = i

        # Write back to file
        with open(output_file, "w") as f:
            json.dump(sorted_data, f, indent=4)

if __name__ == "__main__":
    import sys

    archive = ArchiveFunctions()

    # Check command-line arguments
    if len(sys.argv) < 2:
        print("Usage: python your_script.py [seed|reindex]")
        sys.exit(1)

    command = sys.argv[1].lower()

    if command == "seed":
        archive.seed_with_local_files()
    elif command == "reindex":
        archive.reindex_dataset()
    else:
        print(f"Unknown command: {command}")
        print("Usage: python your_script.py [seed|reindex]")

    