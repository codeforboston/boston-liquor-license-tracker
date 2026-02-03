import re

from .context import ExtractionContext

LICENSE_NUMBER_RE = re.compile(
    r"License\s*#?\s*:?\s*(?:LB|L)\s*[-]?\s*(\d+)", re.IGNORECASE
)


class LicenseNumberExtractor:
    priority = 20

    def run(self, ctx: ExtractionContext) -> None:
        if ctx.data.get("license_number"):
            return

        for idx, line in enumerate(ctx.lines):
            m = LICENSE_NUMBER_RE.search(line)
            if m:
                ctx.data["license_number"] = f"LB-{m.group(1)}"
                ctx.anchors["license_idx"] = idx
                return
