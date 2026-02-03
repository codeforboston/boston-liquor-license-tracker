from dataclasses import dataclass, field


@dataclass
class ExtractionContext:
    lines: list[str]
    data: dict
    anchors: dict[str, int] = field(default_factory=dict)
