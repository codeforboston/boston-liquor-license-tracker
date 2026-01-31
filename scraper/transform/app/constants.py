from pathlib import Path

# Store Keys
PDF_FILE_PATH = "pdf_file_path"
PDF_TEXT = "pdf_text"
HEARING_SECTION = "hearing_section"
LICENSE_TEXT_DATA = "license_text_data"
LICENSE_JSON_DATA = "license_json_data"

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
LOG_DIR = BASE_DIR / "log"
