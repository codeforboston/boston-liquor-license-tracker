import json
import logging
import os
import sys
from collections import Counter
from datetime import datetime

logger = logging.getLogger(__name__)


class DataAnalyzer:
    """Analyzes Licensing Board JSON data and generates reporting statistics."""

    def __init__(self, data):
        self.data = data
        self.total_records = len(data)
        self.stats = {}

    def analyze(self):
        """Performs statistical analysis across all fields."""
        if not self.data:
            return None

        # 1. Field Completeness
        fields = [
            "minutes_date",
            "license_number",
            "business_name",
            "dba_name",
            "address",
            "zipcode",
            "alcohol_type",
            "manager",
            "attorney",
            "status",
            "status_detail",
            "details",
        ]

        field_stats = {}
        for field in fields:
            count = sum(
                1
                for item in self.data
                if item.get(field) and str(item.get(field)).strip()
            )
            field_stats[field] = {
                "count": count,
                "percentage": round((count / self.total_records) * 100, 2)
                if self.total_records > 0
                else 0,
            }
        self.stats["fields"] = field_stats

        # 2. Status Distribution
        statuses = [item.get("status") for item in self.data if item.get("status")]
        self.stats["status_dist"] = dict(Counter(statuses).most_common())

        # 3. Alcohol Type Distribution
        alcohol_types = [
            item.get("alcohol_type") for item in self.data if item.get("alcohol_type")
        ]
        self.stats["alcohol_dist"] = dict(Counter(alcohol_types).most_common())

        # 4. File Source Stats
        files = [item.get("file_name") for item in self.data if item.get("file_name")]
        self.stats["total_files"] = len(set(files))

        return self.stats


class HTMLReporter:
    """Generates a clean HTML report from analysis stats."""

    def __init__(self, stats, total_records):
        self.stats = stats
        self.total_records = total_records

    def generate(self, output_filename="report.html"):
        """Creates the HTML report file."""

        # Simple CSS for a professional look
        css = """
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 1000px; margin: 0 auto; padding: 40px; background: #f4f7f6; }
        .card { background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 25px; margin-bottom: 30px; }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
        th { background: #f8f9fa; font-weight: 600; }
        .progress-bg { background: #e0e0e0; border-radius: 4px; height: 12px; width: 100px; display: inline-block; }
        .progress-fill { background: #3498db; height: 100%; border-radius: 4px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .stat-box { text-align: center; padding: 20px; background: #ebf5fb; border-radius: 8px; }
        .stat-val { font-size: 28px; font-weight: bold; color: #2980b9; display: block; }
        .stat-label { font-size: 14px; text-transform: uppercase; color: #7f8c8d; }
        """

        html_parts = [
            f"<html><head><style>{css}</style><title>Pipeline Statistics Report</title></head><body>",
            "<h1>📊 Boston Licensing Board Pipeline Report</h1>",
            f"<p style='color: #7f8c8d;'>Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>",
            # Summary Boxes
            "<div class='summary-grid'>",
            f"<div class='card stat-box'><span class='stat-val'>{self.total_records}</span><span class='stat-label'>Total Entities</span></div>",
            f"<div class='card stat-box'><span class='stat-val'>{self.stats['total_files']}</span><span class='stat-label'>Source PDFs</span></div>",
            "</div>",
            # Field Completeness Table
            "<div class='card'>",
            "<h2>Field Completeness</h2>",
            "<table><tr><th>Field Name</th><th>Count</th><th>Completeness</th><th>Health</th></tr>",
        ]

        for field, s in self.stats["fields"].items():
            perc = s["percentage"]
            html_parts.append(f"""
                <tr>
                    <td><code>{field}</code></td>
                    <td>{s["count"]}</td>
                    <td>{perc}%</td>
                    <td>
                        <div class='progress-bg'>
                            <div class='progress-fill' style='width: {perc}%'></div>
                        </div>
                    </td>
                </tr>
            """)
        html_parts.append("</table></div>")

        # Status and Alcohol Distributions
        html_parts.append(
            "<div style='display: grid; grid-template-columns: 1fr 1fr; gap: 30px;'>"
        )

        # Status
        html_parts.append("<div class='card'><h2>Status Distribution</h2><table>")
        for k, v in self.stats["status_dist"].items():
            html_parts.append(f"<tr><td>{k}</td><td><strong>{v}</strong></td></tr>")
        html_parts.append("</table></div>")

        # Alcohol
        html_parts.append("<div class='card'><h2>Alcohol Types</h2><table>")
        for k, v in self.stats["alcohol_dist"].items():
            html_parts.append(f"<tr><td>{k}</td><td><strong>{v}</strong></td></tr>")
        html_parts.append("</table></div>")

        html_parts.append("</div>")  # End Grid
        html_parts.append("</body></html>")

        with open(output_filename, "w", encoding="utf-8") as f:
            f.write("".join(html_parts))

        return os.path.abspath(output_filename)


def process_file(filename):
    """EntryPoint for processing a JSON file path."""
    if not os.path.exists(filename):
        logger.error(f"Error: File '{filename}' not found.")
        return

    try:
        with open(filename, encoding="utf-8") as f:
            data = json.load(f)
        return process_data(data)
    except Exception as e:
        logger.error(f"Error reading JSON: {e}")
        return


def process_data(data):
    """EntryPoint for processing an existing data list."""
    analyzer = DataAnalyzer(data)
    stats = analyzer.analyze()

    reporter = HTMLReporter(stats, len(data))
    report_path = reporter.generate()
    # logger.info(f"Report successfully generated at: {report_path}")
    return report_path


if __name__ == "__main__":
    target = "all_licenses.json"
    if len(sys.argv) > 1:
        target = sys.argv[1]

    process_file(target)
