from .context import ExtractionContext


class AddressExtractor:
    priority = 30

    def run(self, ctx: ExtractionContext) -> None:
        license_idx = ctx.anchors.get("license_idx")
        if license_idx is None:
            return

        address_lines = []
        skip_indices = {
            ctx.anchors.get("dba_idx"),
            ctx.anchors.get("category_idx"),
            0,  # Date or Business Name
            1,  # Business Name if Date was at 0
        }

        # The logic in _extract_header_info used lines[0] or lines[1]
        # We should skip those.
        for idx in range(license_idx):
            if idx in skip_indices:
                continue
            address_lines.append(ctx.lines[idx])

        if address_lines:
            ctx.data["address"] = ", ".join(address_lines)
