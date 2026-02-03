# This module targets the March 7, 2024 voting minutes PDF and inserts a "***FORCE STOP***"
# before the "Licensed Premise Inspection Hearing on" line. This is necessary because the
# line is not currently a transactional hearing stop marker and would otherwise be incorrectly
# parsed as a transactional hearing.

from app import constants as const
from app.violation_plugins.base import Plugin


class Violation_2024_03_07(Plugin):
    priority = 10

    def query(self, store):
        pdf_file_path = store.get(const.PDF_FILE_PATH)
        if "voting_minutes_2024-03-07" in pdf_file_path:
            return True
        return False

    def run(self, store):
        pdf_text = store.get(const.PDF_TEXT)
        fixed_pdf_text = pdf_text.replace(
            "Licensed Premise Inspection Hearing on",
            "***FORCE STOP***\nLicensed Premise Inspection Hearing on",
        )
        store.set(const.PDF_TEXT, fixed_pdf_text)
