
import re
from .context import ExtractionContext


class HeaderExtractor:
    priority = 10

    def run(self, ctx: ExtractionContext) -> None:
        if not ctx.lines:
            return

        # Check for date line
        if ctx.lines[0].startswith("Date:"):
            # We don't pop lines from context because other extractors might need the full context
            # We just use the first line and then consider the next line for business name
            date_line = ctx.lines[0]
            date_val = date_line.replace("Date:", "").strip()
            if date_val.lower() != "null":
                ctx.data["minutes_date"] = date_val

            # Legal Name is typically the first line after date (if date exists)
            if len(ctx.lines) > 1:
                first_line = ctx.lines[1]
                ctx.data["business_name"] = re.sub(
                    r"^\s*[\d\.\-\)]+\s*", "", first_line
                ).strip()
        else:
            # If no date line, first line might be business name
            first_line = ctx.lines[0]
            ctx.data["business_name"] = re.sub(
                r"^\s*[\d\.\-\)]+\s*", "", first_line
            ).strip()
