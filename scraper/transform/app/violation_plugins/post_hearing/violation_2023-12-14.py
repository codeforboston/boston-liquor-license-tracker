# This module targets the June 30, 2022 hearing section and fixes
# the address for the license application by adding a newline.

from app import constants as const
from app.violation_plugins.base import Plugin


class Violation_2023_12_14(Plugin):
    priority = 10

    def query(self, store):
        pdf_file_path = store.get(const.PDF_FILE_PATH)
        if "voting_minutes_2023-12-14" in pdf_file_path:
            return True
        return False

    def run(self, store):
        hearing_section = store.get(const.HEARING_SECTION)
        fixed = hearing_section.replace(
            "211 Hanover St, Boston, MA 02113 License #: LB-99356",
            "211 Hanover St, Boston, MA 02113\nLicense #: LB-99356",
        )

        store.set(const.HEARING_SECTION, fixed)
