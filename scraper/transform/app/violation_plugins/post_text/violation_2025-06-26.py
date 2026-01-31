from app.violation_plugins.base import Plugin

# This module targets the June 26, 2025 voting minutes PDF and removes “See Old and New Business”
# lines to preserve an expected downstream parsing invariant.

PDF_FILE_PATH = "pdf_file_path"
HEARING_SECTION = "hearing_section"


class Violation_2025_06_26(Plugin):
    priority = 10

    def query(self, store):
        pdf_file_path = store.get(PDF_FILE_PATH)
        if "voting_minutes_2025-06-26" in pdf_file_path:
            return True
        return False

    def run(self, store):
        pdf_text = store.get("pdf_text")
        delete_phrases = {"See Old and New Business"}
        fixed_pdf_text = self._remove_lines(delete_phrases, pdf_text)
        store.set("pdf_text", fixed_pdf_text)

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
