# This module targets the October 7, 2021 hearing section and fixes
# the address for the license application by adding a newline.

from app import constants as const
from app.violation_plugins.base import Plugin


class Violation_2021_10_07(Plugin):
    priority = 10

    def query(self, store):
        pdf_file_path = store.get(const.PDF_FILE_PATH)
        if "voting_minutes_2021-10-07" in pdf_file_path:
            return True
        return False

    def run(self, store):
        hearing_section = store.get(const.HEARING_SECTION)
        fixed = hearing_section.replace(
            "Doing business as: Jokr, 45 Franklin St., Boston, MA 02110",
            "Doing business as: Jokr\n45 Franklin St., Boston, MA 02110",
        )

        store.set(const.HEARING_SECTION, fixed)
