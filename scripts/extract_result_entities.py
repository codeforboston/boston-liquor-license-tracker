
import sys 
import fitz 
import os
from pathlib import Path

def extract_result(pdf_name: str):
    pdf_folder = Path.cwd()
    pdf_file = pdf_folder / pdf_name
    pdf_file

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(f"Usage: argument should be extract_entity.py <pdf_filename>")
        sys.exit(1)
    extract_result(sys.argv[1])