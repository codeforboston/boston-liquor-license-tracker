# This module targets the September 26, 2024 hearing section and fixes
# Adding the period to the entity number for the license application.

from app.violation_plugins.base import Plugin

PDF_FILE_PATH = "pdf_file_path"
HEARING_SECTION = "hearing_section"


class Violation_2024_09_26(Plugin):
    priority = 10

    def query(self, store):
        pdf_file_path = store.get(PDF_FILE_PATH)
        if "voting_minutes_2024-09-26" in pdf_file_path:
            return True
        return False

    def run(self, store):
        hearing_section = store.get(HEARING_SECTION)

        fixed = hearing_section.replace("23 Locale, Inc.", "23. Locale, Inc.")

        store.set(HEARING_SECTION, fixed)
