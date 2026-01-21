import logging

import requests

from app import constants as const
from app.parsers.date_parser import DateParser
from app.parsers.html_link_parser import HtmlLinkParser
from app.storage.json_store import JsonStore
from app.storage.stats_logger import StatsLogger

logger = logging.getLogger(__name__)


class ScraperService:
    """Orchestrates the scraping of licensing board links."""

    def __init__(self):
        self.html_parser = HtmlLinkParser()
        self.date_parser = DateParser()
        self.json_io = JsonStore()
        self.stats_logger = StatsLogger(const.STATS_LOG_FILE)
        self.filters = []  # List of filters with .process()

    def add_filter(self, filter_obj):
        self.filters.append(filter_obj)

    def run(self):
        logger.info(f"Fetching {const.TARGET_URL}...")
        # 1. Fetch HTML and extract all links
        try:
            html = self._fetch_html(const.TARGET_URL)
        except RuntimeError as e:
            logger.critical(str(e))
            return

        logger.info("Parsing links...")
        links = self.html_parser.extract_links(html)

        stats = {"total_links": len(links)}

        # 2. Apply filters sequentially (e.g. ClientSide, ExcludeList, VideoLink)
        filtered_links = links
        for f in self.filters:
            prev_len = len(filtered_links)
            filtered_links = f.process(filtered_links)
            # Rough logic to attribute stats to the filter class name
            filter_name = f.__class__.__name__
            removed_count = prev_len - len(filtered_links)
            # This mapping mirrors the old script's specific stat keys for compatibility
            if "ClientSide" in filter_name:
                stats["client_side_links"] = removed_count
            elif "Exclude" in filter_name:
                stats["excluded_links"] = removed_count
            elif "Video" in filter_name:
                stats["video_links"] = removed_count

        minutes_links = filtered_links
        stats["minutes_links"] = len(minutes_links)

        # 3. Extract dates from minutes links and save to JSON
        logger.info("Extracting dates...")
        processed_minutes = []
        for link in minutes_links:
            link["date"] = self.date_parser.parse(link["body"], link["href"])
            processed_minutes.append(link)

        # Save Data
        logger.info(f"Saving {len(processed_minutes)} minutes links...")
        self.json_io.save(processed_minutes, const.MINUTES_LINKS_FILE)

        # 4. Log stats
        logger.info("Link stats:")
        for k, v in stats.items():
            logger.info(f"{k}: {v}")
        self.stats_logger.log_stats(stats)

        logger.info("Scraping completed.")

    def _fetch_html(self, url: str) -> str:
        try:
            resp = requests.get(url, timeout=const.DEFAULT_TIMEOUT)
            resp.raise_for_status()
            if not resp.text:
                raise RuntimeError(f"Empty response from {url}")
            return resp.text
        except requests.RequestException as e:
            raise RuntimeError(f"Network error fetching {url}: {e}") from e
