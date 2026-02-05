import json


class KVStore:
    """
    Simple in-memory JSON-compatible name/value store.
    Enforces that all values are JSON-serializable.
    """

    def __init__(self):
        self._data = {}

    # ---------- core API ----------

    def get(self, key, default=None):
        return self._data.get(key, default)

    def set(self, key, value):
        self._data[key] = value

    def has(self, key):
        return key in self._data

    def delete(self, key):
        if key in self._data:
            del self._data[key]

    def items(self):
        return self._data.items()

    def as_dict(self):
        """Return a shallow JSON-safe copy"""
        return dict(self._data)

    # ---------- validation ----------

    def _is_json_compatible(self, value) -> bool:
        try:
            json.dumps(value)
            return True
        except (TypeError, OverflowError):
            return False

    # ---------- debugging ----------
    def dump(self, escape: bool = False) -> str:
        """
        Full diagnostic dump of KVStore contents.
        Prioritizes core pipeline keys and provides clear sectioning.

        If escape=True:
            Strings will show literal escape sequences (\\n, \\t, etc.)
            Useful for debugging PDF / parsing issues.
        """
        priority_keys = [
            "pdf_file_path",
            "hearing_section",
            "license_text_data",
            "license_json_data",
            "pdf_text",
        ]

        def fmt(value):
            if isinstance(value, str):
                if escape:
                    # Show raw string with escaped control characters
                    return (
                        value.replace("\\", "\\\\")
                        .replace("\n", "\\n")
                        .replace("\r", "\\r")
                        .replace("\t", "\\t")
                    )
                return value
            return repr(value)

        output = []
        output.append("\n" + "=" * 70)
        output.append("KVStore FULL STATE DUMP")
        output.append(f"Total keys: {len(self._data)}")
        output.append("=" * 70)

        processed_keys = set()

        # 1. Process priority keys in order
        for key in priority_keys:
            if key in self._data:
                self._append_key_section(output, key, self._data[key], fmt)
                processed_keys.add(key)

        # 2. Process all other keys sorted alphabetically
        remaining_keys = sorted(
            [k for k in self._data.keys() if k not in processed_keys]
        )
        for key in remaining_keys:
            self._append_key_section(output, key, self._data[key], fmt)

        output.append("=" * 70 + "\n")
        return "\n".join(output)

    def _append_key_section(self, output, key, value, fmt_func):
        val_type = type(value).__name__

        # Section Header
        if isinstance(value, (str, list, dict)):
            size_info = (
                f", len={len(value)}"
                if not isinstance(value, dict)
                else f", size={len(value)}"
            )
            output.append(f"SECTION: {key.upper()} ({val_type}{size_info})")
        else:
            output.append(f"SECTION: {key.upper()} ({val_type})")
        output.append("-" * 70)
        # Data Block
        if isinstance(value, list):
            for i, item in enumerate(value):
                output.append(f"  [{i}] {fmt_func(item)}")
        elif isinstance(value, dict):
            for dk, dv in value.items():
                output.append(f"Key  : {dk}\nValue: {fmt_func(dv)}\n------")
        else:
            output.append(fmt_func(value))

        output.append("=" * 70)

    def __repr__(self):
        # Default repr now uses escaping for safety
        return self.dump(escape=True)
