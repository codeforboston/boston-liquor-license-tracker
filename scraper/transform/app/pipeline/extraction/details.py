from .context import ExtractionContext


class DetailsExtractor:
    priority = 70

    def run(self, ctx: ExtractionContext) -> None:
        cat_idx = ctx.anchors.get("category_idx")
        if cat_idx is None:
            return

        detail_lines = []
        status_detail = ctx.data.get("status_detail")

        for idx in range(cat_idx, len(ctx.lines)):
            line = ctx.lines[idx]
            # Stop if we hit explicit labels or the identified status text
            if (
                line.startswith("Manager:")
                or line.startswith("Attorney:")
                or (status_detail and status_detail in line)
            ):
                break
            detail_lines.append(line)

        ctx.data["details"] = " ".join(detail_lines)
