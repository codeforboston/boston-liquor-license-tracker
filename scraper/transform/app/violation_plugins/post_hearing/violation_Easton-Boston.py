# This module targets the Easton Boston hearing section and fixes
# the "Easton Boston" string to "East Boston".

from app import constants as const
from app.violation_plugins.base import Plugin


class Violation_Easton_Boston(Plugin):
    priority = 10

    def query(self, store):
        hearing_section = store.get(const.HEARING_SECTION)
        if "Easton Boston" in hearing_section:
            return True
        return False

    def run(self, store):
        hearing_section = store.get(const.HEARING_SECTION)
        fixed = hearing_section.replace("Easton Boston", "East Boston")
        store.set(const.HEARING_SECTION, fixed)
