# This module targets the February 4, 2021 voting minutes PDF and fixes
# the date of the transactional hearing.

from app import constants as const
from app.violation_plugins.base import Plugin


class Violation_2021_02_04(Plugin):
    priority = 10

    def query(self, store):
        pdf_file_path = store.get(const.PDF_FILE_PATH)
        if "voting_minutes_2021-02-04" in pdf_file_path:
            return True
        return False

    def run(self, store):
        pdf_text = store.get(const.PDF_TEXT)
        fixed_pdf_text = pdf_text.replace(
            "Transactional Hearing: Wednesday, February 3, 202",
            "Transactional Hearing: Wednesday, February 3, 2021",
        )
        store.set(const.PDF_TEXT, fixed_pdf_text)
