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

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from extract_entity import process_pdf
from extract_entity import write_to_file

current_loc = os.getcwd()
print(f"{current_loc}")
pdf_file = [f for f in os.listdir(current_loc) if f.endswith('.pdf')]
final_result = []
for pdf in pdf_file:
    try:
        result = process_pdf(pdf, 'seeding')
        final_result.extend(result)
    except Exception as e:
        print(f"Error in file {pdf} : {e}")

sorted_data = sorted(final_result, key=lambda x: (x["minutes_date"], x["entity_number"]))
print(f"the data is ${sorted_data}")
# for i, entity in enumerate(sorted_data, start=1): 
#     entity["index"] = i

write_to_file(sorted_data)


    