import re

from .context import ExtractionContext

ATTORNEY_RE = re.compile(r"Attorney\s*:\s*(.*)", re.IGNORECASE)


class PeopleExtractor:
    priority = 40

    def run(self, ctx: ExtractionContext) -> None:
        for line in ctx.lines:
            # Manager
            if not ctx.data.get("manager"):
                mgr_match_rev = re.search(
                    r"([^,\.\n]+?)\s*,\s*Manager\.", line, re.IGNORECASE
                )
                if mgr_match_rev:
                    ctx.data["manager"] = mgr_match_rev.group(1).strip()
                else:
                    mgr_match = re.search(r"Manager\s*:\s*(.*)", line, re.IGNORECASE)
                    if mgr_match:
                        ctx.data["manager"] = mgr_match.group(1).split(".")[0].strip()

            # Attorney
            if not ctx.data.get("attorney"):
                att_match = ATTORNEY_RE.search(line)
                if att_match:
                    ctx.data["attorney"] = att_match.group(1).strip()
