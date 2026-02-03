# This module targets the May 1, 2025 voting minutes PDF and removes a multi-line
# policy statement about deferring new license applications. The removal is necessary
# because the statement is not a license-specific action and would otherwise be
# incorrectly parsed as a license-level violation.

import re

from app import constants as const
from app.violation_plugins.base import Plugin


class Violation_2025_05_01(Plugin):
    priority = 10

    def query(self, store):
        pdf_file_path = store.get(const.PDF_FILE_PATH)
        if "voting_minutes_2025-05-01" in pdf_file_path:
            return True
        return False

    def run(self, store):
        pdf_text = store.get(const.PDF_TEXT)
        delete_phrases = {
            "THE BOARD WILL DEFER DELIBERATION ON ALL NEW ALCOHOLIC BEVERAGES",
            "LICENSE APPLICATIONS UNTIL ALL APPLICATIONS RECEIVED BY MAY 23 HAVE",
            "BEEN HEARD",
        }
        fixed_pdf_text = self._remove_lines(delete_phrases, pdf_text)

        fixed_pdf_text = self._collapse_blank_lines(fixed_pdf_text)
        fixed_pdf_text = fixed_pdf_text.replace(
            "Informational Hearing on Thursday, May 1, 2025",
            "***FORCE STOP***\nInformational Hearing on Thursday, May 1, 2025",
        )
        store.set("pdf_text", fixed_pdf_text)

    def _collapse_blank_lines(self, text: str, max_blank_lines: int = 2) -> str:
        """
        Collapse runs of whitespace-only lines so that at most `max_blank_lines`
        blank lines remain in a row.
        """
        # This pattern matches 3 or more consecutive blank/whitespace lines
        pattern = rf"(?:[ \t]*\n){{{max_blank_lines + 1},}}"

        # Replace with exactly max_blank_lines newlines
        replacement = "\n" * max_blank_lines

        return re.sub(pattern, replacement, text)

    def _remove_lines(self, delete_phrases, pdf_text: str) -> str:
        """
        Remove any line that contains one of the phrases in delete_phrases.
        Matching is substring-based and line-aware.
        """
        output_lines = []

        for line in pdf_text.splitlines():
            stripped = line.strip()

            # Skip lines containing any delete phrase
            if any(phrase in stripped for phrase in delete_phrases):
                continue

            output_lines.append(line)

        return "\n".join(output_lines)
