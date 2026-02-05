# This module targets the September 30, 2021 voting minutes PDF and fixes
# the line numbers for the license applications.
# which expect the entity number to be followed by a period.

from app import constants as const
from app.violation_plugins.base import Plugin


class Violation_2021_09_30(Plugin):
    priority = 10

    def query(self, store):
        pdf_file_path = store.get(const.PDF_FILE_PATH)
        if "voting_minutes_2021-09-30" in pdf_file_path:
            return True
        return False

    def run(self, store):
        pdf_text = store.get(const.PDF_TEXT)
        fixed_text = self._fix_specific_lines(pdf_text)
        store.set(const.PDF_TEXT, fixed_text)

    def _fix_specific_lines(self, text: str) -> str:
        replacements = {
            "1": "1.",
            "2": "2.",
            "3": "3.",
            "4": "4.",
            "5": "5.",
            "6": "6.",
            "7": "7.",
            "8": "8.",
            "9": "9.",
            "10": "10.",
            "11": "11.",
            "12": "12.",
            "13": "13.",
            "14": "14.",
            "15": "15.",
            "16": "16.",
            "17 HSI MCA BOS FB, LLC": "17. HSI MCA BOS FB, LLC",
            "18": "18.",
            "19 LSFW, LLC": "19. LSFW, LLC",
            "20": "20.",
            "21": "21.",
            "22": "22.",
            "23 MITSOS, LLC": "23. MITSOS, LLC",
            "24 Mattapan Gas Station Inc.": "24. Mattapan Gas Station Inc.",
            "25 New S.S. Group, Inc": "25. New S.S. Group, Inc",
            "26": "26.",
            "27": "27.",
            "28 DW Cafe Corporation": "28. DW Cafe Corporation",
        }

        lines = text.split("\n")
        fixed_lines = []

        for line in lines:
            stripped = line.strip()

            if stripped in replacements:
                # Preserve original leading whitespace
                prefix = line[: len(line) - len(line.lstrip())]
                fixed_lines.append(prefix + replacements[stripped])
            else:
                fixed_lines.append(line)

        return "\n".join(fixed_lines)
