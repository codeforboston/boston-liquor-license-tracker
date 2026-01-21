import logging

from app.storage.json_store import JsonStore

logger = logging.getLogger(__name__)


class VideoLinkFilter:
    """Separates video links, saves them, and filters them out."""

    def __init__(self, json_io: JsonStore, file_path):
        self.json_io = json_io
        self.file_path = file_path

    def process(self, links: list[dict]) -> list[dict]:
        video_links = []
        other_links = []

        for link in links:
            href = link.get("href", "").lower()
            if "youtube.com" in href or "youtu.be" in href:
                video_links.append(link)
            else:
                other_links.append(link)

        if video_links:
            logger.info(f"Saving {len(video_links)} video links to {self.file_path}...")
            self.json_io.save(video_links, self.file_path)

        return other_links
