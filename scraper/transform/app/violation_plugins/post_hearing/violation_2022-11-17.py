# This module targets the November 17, 2022 hearing section and fixes
# the address for the license application by adding a newline.

from app import constants as const
from app.violation_plugins.base import Plugin


class Violation_2022_11_17(Plugin):
    priority = 10

    def query(self, store):
        pdf_file_path = store.get(const.PDF_FILE_PATH)
        if "voting_minutes_2022-11-17" in pdf_file_path:
            return True
        return False

    def run(self, store):
        hearing_section = store.get(const.HEARING_SECTION)
        fixed = hearing_section.replace(
            "Doing business as: Del Friscos Double Eagle Steakhouse 888 Boylston St., Boston, MA 02199",
            "Doing business as: Del Friscos Double Eagle Steakhouse\n888 Boylston St., Boston, MA 02199",
        )

        store.set(const.HEARING_SECTION, fixed)
