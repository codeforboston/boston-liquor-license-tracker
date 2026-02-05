# This module targets the September 29, 2022 voting minutes PDF and inserts a "***FORCE STOP***"

from app import constants as const
from app.violation_plugins.base import Plugin


class Violation_2022_09_29(Plugin):
    priority = 10

    def query(self, store):
        pdf_file_path = store.get(const.PDF_FILE_PATH)
        if "voting_minutes_2022-09-29" in pdf_file_path:
            return True
        return False

    def run(self, store):
        pdf_text = store.get(const.PDF_TEXT)
        fixed_pdf_text = pdf_text.replace(
            "Licensed Premise Informational Hearing",
            "***FORCE STOP***\nLicensed Premise Informational Hearing",
        )
        store.set(const.PDF_TEXT, fixed_pdf_text)
