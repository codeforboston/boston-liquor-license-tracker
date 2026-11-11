import re

from bs4 import BeautifulSoup

YEAR_RE = re.compile(r"\b(19|20)\d{2}\b")


class HtmlLinkParser:
    """
    Extracts raw links from HTML content.
    """

    def extract_links(self, html_content: str) -> list[dict]:
        """
        Parses HTML and returns a list of dicts with 'href', 'body' and
        'section_year'.

        'section_year' is the year heading of the page drawer the link sits in
        (e.g. "2025"), or None. It lets the date parser recover the year for
        links whose text and URL omit it, such as Google Drive links labelled
        "Voting Minutes: Thursday, November 6".
        """
        soup = BeautifulSoup(html_content, "html.parser")
        links_data = []

        links = soup.find_all("a", href=True)
        for link in links:
            href = link["href"]
            body = link.get_text(strip=True)
            links_data.append(
                {"href": href, "body": body, "section_year": self._section_year(link)}
            )

        return links_data

    @staticmethod
    def _section_year(link) -> str | None:
        drawer = link.find_parent(class_="paragraphs-item-drawer")
        if drawer is None:
            return None
        title = drawer.find(class_="field-name-field-title")
        if title is None:
            return None
        match = YEAR_RE.search(title.get_text(strip=True))
        return match.group(0) if match else None
