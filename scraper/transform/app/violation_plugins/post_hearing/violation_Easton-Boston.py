# This module targets the Easton Boston hearing section and fixes
# the "Easton Boston" string to "East Boston".

from app.violation_plugins.base import Plugin

PDF_FILE_PATH = "pdf_file_path"
HEARING_SECTION = "hearing_section"


class Violation_Easton_Boston(Plugin):
    priority = 10

    def query(self, store):
        hearing_section = store.get(HEARING_SECTION)
        if "Easton Boston" in hearing_section:
            return True
        return False

    def run(self, store):
        hearing_section = store.get(HEARING_SECTION)
        fixed = hearing_section.replace("Easton Boston", "East Boston")
        store.set(HEARING_SECTION, fixed)
