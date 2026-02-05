# This module targets the August 17, 2023 hearing section and fixes
# the "Doing business" line for the license application.

from app import constants as const
from app.violation_plugins.base import Plugin


class Violation_2023_08_17(Plugin):
    priority = 10

    def query(self, store):
        pdf_file_path = store.get(const.PDF_FILE_PATH)
        if "voting_minutes_2023-08-17" in pdf_file_path:
            return True
        return False

    def run(self, store):
        hearing_section = store.get(const.HEARING_SECTION)
        fixed = hearing_section.replace(
            "Doing business: The Capital Burger",
            "Doing business as: The Capital Burger",
        )
        store.set(const.HEARING_SECTION, fixed)
