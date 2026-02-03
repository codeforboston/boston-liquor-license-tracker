# This module targets the September 10, 2020 voting minutes PDF and fixes
# the entity numbers for the license applications which are using 1) and not 1.

import re

from app import constants as const
from app.violation_plugins.base import Plugin


class Violation_2020_09_10(Plugin):
    priority = 10

    def query(self, store):
        pdf_file_path = store.get(const.PDF_FILE_PATH)
        if "voting_minutes_2020-09-10" in pdf_file_path:
            return True
        return False

    def run(self, store):
        pdf_text = store.get(const.PDF_TEXT)
        fixed_pdf_text = self._fix_numbered_lines(pdf_text)
        store.set(const.PDF_TEXT, fixed_pdf_text)

    def _fix_numbered_lines(self, text: str) -> str:
        # Replace "2)" -> "2." only at the start of a line
        return re.sub(r"(?m)^(\d+)\)", r"\1.", text)
