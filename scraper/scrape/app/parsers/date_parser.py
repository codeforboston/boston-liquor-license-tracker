import re
from datetime import datetime
from urllib.parse import unquote


class DateParser:
    """
    Parses dates from text/hrefs using multiple strategies.
    """

    # Regex patterns
    BODY_MONTH_DAY_PATTERN = re.compile(
        r"(January|February|March|April|May|June|July|August|September|October|November|December)[\s,]+(\d{1,2})(?:st|nd|rd|th)?(?:,\s*(\d{4}))?",
        re.IGNORECASE,
    )

    # "6-26-25" or "4.8.21" (dots appear in some older file names)
    HREF_NUMERIC_PATTERN = re.compile(
        r"(?<!\d)(\d{1,2})[-.](\d{1,2})[-.](\d{4}|\d{2})(?!\d)"
    )

    VALID_DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")

    HREF_MONTH_PATTERN = re.compile(
        r"(January|February|March|April|May|June|July|August|September|October|November|December)[^\d]*(\d{1,2})[^\d]*(\d{4})",
        re.IGNORECASE,
    )

    MONTH_NAME_TO_NUM = {datetime(2000, i, 1).strftime("%B"): i for i in range(1, 13)}

    def parse(self, body: str, href: str, fallback_year: str | None = None) -> str:
        """
        Attempts to parse a date from the body text or href.

        Args:
            body (str): Text content of the link.
            href (str): URL of the link.
            fallback_year (str | None): Year to use when neither the body nor the
                href contains one (e.g. the page section the link appears in).

        Returns:
            str: Date in 'YYYY-MM-DD' format, or constructed with placeholders 'yyyy-mm-dd' if parsing fails.
        """
        href_decoded = unquote(href)

        matches = {"year": None, "month": None, "day": None}

        # Strategy 1: Body Text
        self._parse_from_body(body, matches)

        # Strategy 2: Numeric Href
        if not self._is_complete(matches):
            self._parse_from_href_numeric(href_decoded, matches)

        # Strategy 3: Month Name Href
        if not self._is_complete(matches):
            self._parse_from_href_month(href_decoded, matches)

        # Strategy 4: year of the page section the link appears in
        if not matches["year"] and matches["month"] and matches["day"]:
            matches["year"] = fallback_year

        return self._format_date(matches)

    @classmethod
    def is_valid(cls, date_str: str | None) -> bool:
        """True for a fully parsed 'YYYY-MM-DD' date (no 'yyyy'/'mm'/'dd')."""
        return bool(date_str and cls.VALID_DATE_PATTERN.match(date_str))

    def _is_complete(self, matches):
        return all(matches.values())

    def _parse_from_body(self, text, matches):
        match = self.BODY_MONTH_DAY_PATTERN.search(text)
        if match:
            month_name, day, year = match.groups()
            matches["day"] = matches["day"] or (f"{int(day):02d}" if day else None)
            matches["month"] = matches["month"] or (
                f"{self.MONTH_NAME_TO_NUM[month_name.capitalize()]:02d}"
                if month_name
                else None
            )
            matches["year"] = matches["year"] or year

    def _parse_from_href_numeric(self, text, matches):
        match = self.HREF_NUMERIC_PATTERN.search(text)
        if match and 1 <= int(match.group(1)) <= 12 and 1 <= int(match.group(2)) <= 31:
            m, d, y = match.groups()
            matches["month"] = matches["month"] or f"{int(m):02d}"
            matches["day"] = matches["day"] or f"{int(d):02d}"
            if y:
                y_int = int(y)
                if y_int < 100:
                    y_int += 2000
                matches["year"] = matches["year"] or str(y_int)

    def _parse_from_href_month(self, text, matches):
        match = self.HREF_MONTH_PATTERN.search(text)
        if match:
            month_name, day, year = match.groups()
            matches["month"] = (
                matches["month"]
                or f"{self.MONTH_NAME_TO_NUM[month_name.capitalize()]:02d}"
            )
            matches["day"] = matches["day"] or f"{int(day):02d}"
            matches["year"] = matches["year"] or year

    def _format_date(self, matches):
        final_year = matches["year"] if matches["year"] else "yyyy"
        final_month = matches["month"] if matches["month"] else "mm"
        final_day = matches["day"] if matches["day"] else "dd"
        return f"{final_year}-{final_month}-{final_day}"
