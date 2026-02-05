# This module targets the September 26, 2024 hearing section and fixes
# Adding the period to the entity number for the license application.

from app import constants as const
from app.violation_plugins.base import Plugin


class Violation_2024_09_26(Plugin):
    priority = 10

    def query(self, store):
        pdf_file_path = store.get(const.PDF_FILE_PATH)
        if "voting_minutes_2024-09-26" in pdf_file_path:
            return True
        return False

    def run(self, store):
        hearing_section = store.get(const.HEARING_SECTION)

        fixed = hearing_section.replace("23 Locale, Inc.", "23. Locale, Inc.")

        store.set(const.HEARING_SECTION, fixed)
