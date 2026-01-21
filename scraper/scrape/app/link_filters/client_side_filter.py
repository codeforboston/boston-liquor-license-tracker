class ClientSideFilter:
    """Filters out client-side links (tel:, mailto:, #)."""

    LOCAL_PREFIXES = ("tel:", "mailto:", "#", "javascript:")

    def process(self, links: list[dict]) -> list[dict]:
        cleaned = []
        for link in links:
            href = link.get("href", "").lower()
            if not href.startswith(self.LOCAL_PREFIXES):
                cleaned.append(link)
        return cleaned
