import time
from app import constants as const
from app.utils.logger import setup_logging
from app.link_filters.client_side_filter import ClientSideFilter
from app.link_filters.exclude_list_filter import ExcludeListFilter
from app.link_filters.video_link_filter import VideoLinkFilter
from app.services.downloader_service import DownloaderService
from app.services.scraper_service import ScraperService
from app.services.text_extractor_service import TextExtractorService
from app.storage.json_store import JsonStore


def main():
    logger = setup_logging(__name__)
    logger.info("Starting Licensing Board Scraper Application")
    start_time = time.perf_counter()
    try:
        # 1. Run Scraper
        logger.info("Initializing Scraper Service...")
        scraper = ScraperService()

        # Configure Filters
        scraper.add_filter(ClientSideFilter())
        scraper.add_filter(ExcludeListFilter(const.URL_EXCLUDE_LIST_FILE))
        scraper.add_filter(VideoLinkFilter(JsonStore(), const.VIDEO_LINKS_FILE))

        # Execute
        scraper.run()

        # 2. Run Downloader
        logger.info("Initializing Downloader Service...")
        downloader = DownloaderService()
        downloader.run()

        # 3. Run Text Extractor
        logger.info("Initializing Text Extractor Service...")
        extractor = TextExtractorService()
        extractor.run()

        logger.info("Application finished successfully.")
    finally:
        elapsed = time.perf_counter() - start_time
        minutes, seconds = divmod(elapsed, 60)
        logger.info(
            "Total runtime: %d minutes %.2f seconds",
            int(minutes),
            seconds
        )

if __name__ == "__main__":
    main()
