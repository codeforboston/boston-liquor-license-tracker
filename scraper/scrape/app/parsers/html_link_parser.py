from bs4 import BeautifulSoup


class HtmlLinkParser:
    """
    Extracts raw links from HTML content.
    """

    def extract_links(self, html_content: str) -> list[dict]:
        """
        Parses HTML and returns a list of dicts with 'href' and 'body'.
        """
        soup = BeautifulSoup(html_content, "html.parser")
        links_data = []

        links = soup.find_all("a", href=True)

        for link in links:
            href = link["href"]
            body = link.get_text(strip=True)
            links_data.append({"href": href, "body": body})

        return links_data
