import re

from .context import ExtractionContext

STATUS_KEYWORDS = [
    "Granted",
    "Deferred",
    "RE-SCHEDULED",
    "RESCHEDULED",
    "Continued",
    "Withdrawn",
    "No Violation",
    "Failed to Appear",
    "Dismissed",
    "No Action Taken",
    "Defer",
    "Dismiss",
    "Revised",
    "Corrected",
    "Rejected",
    "Denied",
]


class StatusExtractor:
    priority = 60

    def run(self, ctx: ExtractionContext) -> None:
        # Check last 7 non-empty lines in reverse
        for line in reversed(ctx.lines[-7:]):
            for keyword in STATUS_KEYWORDS:
                if re.search(rf"\b{keyword}\b", line, re.IGNORECASE):
                    status_detail = line.strip()
                    ctx.data["status_detail"] = status_detail

                    sd_lower = status_detail.lower()
                    if "granted" in sd_lower:
                        ctx.data["status"] = "granted"
                    elif "rejected" in sd_lower:
                        ctx.data["status"] = "rejected"
                    elif any(kw in sd_lower for kw in ["rescheduled", "re-scheduled"]):
                        ctx.data["status"] = "rescheduled"
                    elif "withdrawn" in sd_lower:
                        ctx.data["status"] = "withdrawn"
                    elif "continued" in sd_lower:
                        ctx.data["status"] = "continued"
                    elif any(kw in sd_lower for kw in ["deferred", "defer"]):
                        ctx.data["status"] = "deferred"

                    return  # Stop after first status found
