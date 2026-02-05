import re

from .context import ExtractionContext

# Matches common "Doing Business As" (DBA) labels in license text.
# 
# - Supports multiple variants: "D/B/A", "DBA", or "Doing business as"
# - Case-insensitive to handle inconsistent capitalization
# - Allows optional whitespace around the colon
# - Captures everything after the label as the DBA name
#
# Example matches:
#   "DBA: Acme Pizza"
#   "D/B/A : The Blue Oyster"
#   "Doing business as: Smith & Sons"
DBA_RE = re.compile(r"(?:D/B/A|Doing business as|DBA)\s*:\s*(.*)", re.IGNORECASE)


class DBAExtractor:
    priority = 25

    def run(self, ctx: ExtractionContext) -> None:
        if ctx.data.get("dba_name"):
            return

        for idx, line in enumerate(ctx.lines):
            m = DBA_RE.search(line)
            if m:
                ctx.data["dba_name"] = m.group(1).strip()
                ctx.anchors["dba_idx"] = idx
                return
