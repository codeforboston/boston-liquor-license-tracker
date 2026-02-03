# This module targets the September 17, 2020 hearing section and fixes
# the company name by removing the quotes around it.

from app import constants as const
from app.violation_plugins.base import Plugin


class Violation_2020_09_17(Plugin):
    priority = 10

    def query(self, store):
        pdf_file_path = store.get(const.PDF_FILE_PATH)
        if "voting_minutes_2020-09-17" in pdf_file_path:
            return True
        return False

    def run(self, store):
        hearing_section = store.get(const.HEARING_SECTION)

        fixed = hearing_section.replace(
            '"ARIZONA B.B.Q. & HOUSE OF PIZZA"', "ARIZONA B.B.Q. & HOUSE OF PIZZA"
        )

        store.set(const.HEARING_SECTION, fixed)
