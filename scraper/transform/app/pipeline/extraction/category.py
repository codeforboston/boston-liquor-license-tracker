import re

from .context import ExtractionContext

CATEGORY_RE = re.compile(r"(Holder of|Has applied for)", re.IGNORECASE)


class CategoryExtractor:
    priority = 26

    def run(self, ctx: ExtractionContext) -> None:
        if ctx.data.get("alcohol_type"):
            return

        for idx, line in enumerate(ctx.lines):
            if CATEGORY_RE.search(line):
                line_lower = (
                    line.lower().replace("-", " ").replace("_", " ").replace("&", "and")
                )
                if any(
                    kw in line_lower
                    for kw in [
                        "all alcoholic",
                        "common victualler",
                        "all alcohol",
                        "allalcohol",
                    ]
                ):
                    ctx.data["alcohol_type"] = "all alcoholic beverages"
                elif any(kw in line_lower for kw in ["malt", "malts", "wine", "wines"]):
                    ctx.data["alcohol_type"] = "wines and malt beverages"

                ctx.anchors["category_idx"] = idx
                return
