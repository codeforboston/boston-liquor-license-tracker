# This module targets the June 30, 2022 hearing section and fixes
# the address for the license application by adding a newline.

from app import constants as const
from app.violation_plugins.base import Plugin


class Violation_2022_06_30(Plugin):
    priority = 10

    def query(self, store):
        pdf_file_path = store.get(const.PDF_FILE_PATH)
        if "voting_minutes_2022-06-30" in pdf_file_path:
            return True
        return False

    def run(self, store):
        hearing_section = store.get(const.HEARING_SECTION)
        fixed = hearing_section.replace(
            "Doing business as: McCormick & Schmicks Seafood Restaurant 300 Faneuil Hall Marketplace",
            "Doing business as: McCormick & Schmicks Seafood Restaurant\n300 Faneuil Hall Marketplace",
        )

        store.set(const.HEARING_SECTION, fixed)
