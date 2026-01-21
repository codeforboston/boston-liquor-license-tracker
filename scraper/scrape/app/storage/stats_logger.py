import csv
import logging
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)


class StatsLogger:
    """Handles appending stats to a CSV log."""

    def __init__(self, csv_path: Path):
        self.csv_path = csv_path
        self.fieldnames = [
            "run_date",
            "total_links",
            "client_side_links",
            "excluded_links",
            "video_links",
            "minutes_links",
        ]

    def log_stats(self, stats: dict):
        """Appends a row of stats to the CSV."""
        run_date = datetime.now().strftime("%Y-%m-%d")
        row = {"run_date": run_date}
        # Safely get fields, defaulting to 0
        row.update({k: stats.get(k, 0) for k in self.fieldnames if k != "run_date"})

        self.csv_path.parent.mkdir(parents=True, exist_ok=True)
        file_exists = self.csv_path.exists()

        try:
            with open(self.csv_path, "a", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=self.fieldnames)
                if not file_exists:
                    writer.writeheader()
                writer.writerow(row)
            logger.info(f"Stats logged to {self.csv_path}")
        except OSError as e:
            logger.error(f"Failed to log stats to CSV: {e}")
