from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
LOG_DIR = BASE_DIR / "log"

# Files
VIDEO_LINKS_FILE = DATA_DIR / "hearing_video_links.json"
MINUTES_LINKS_FILE = DATA_DIR / "voting_minutes_links.json"
URL_EXCLUDE_LIST_FILE = DATA_DIR / "url_exclude_list.json"
STATS_LOG_FILE = DATA_DIR / "link_stats_log.csv"
DOWNLOAD_DIR = BASE_DIR / "voting_minutes_pdfs"
EXCEPTION_PDFS = DATA_DIR / "exception_pdfs"
TEXT_OUTPUT_DIR = BASE_DIR / "voting_minutes_txt"

# Scraping
TARGET_URL = "https://www.boston.gov/departments/licensing-board/licensing-board-information-and-members"
BASE_URL = "https://www.boston.gov"

# Defaults
DEFAULT_TIMEOUT = 30
