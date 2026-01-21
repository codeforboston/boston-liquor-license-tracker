import json
from pathlib import Path


def scan_txt_files(directory: str) -> list[str]:
    """
    Safely scan a directory for .txt files and return resolved full paths.
    Returns an empty list if directory is missing or unreadable.
    """
    path = Path(directory)

    if not path.exists():
        print(f"[WARN] Directory does not exist: {path}")
        return []

    if not path.is_dir():
        print(f"[WARN] Path is not a directory: {path}")
        return []

    files = [
        str(f.name)
        for f in path.iterdir()
        if f.is_file() and f.suffix.lower() == ".txt"
    ]

    if not files:
        print(f"[INFO] No .txt files found in: {path}")

    return sorted(files)


def build_file_index(
    orig_dir: str = "./data/license_text", fix_dir: str = "./data/license_text_fix"
) -> dict[str, list[str]]:
    """
    Build the file index structure expected by the frontend.
    Always returns a valid structure, even if dirs are missing/empty.
    """
    return {
        "orig": scan_txt_files(orig_dir),
        "fix": scan_txt_files(fix_dir),
    }


def main():
    index = build_file_index()

    output_file = Path("file_index.json")
    try:
        with output_file.open("w", encoding="utf-8") as f:
            json.dump(index, f, indent=4)
    except Exception as e:
        print(f"[ERROR] Failed to write file_index.json: {e}")
        return

    print(f"\nfile_index.json created successfully at: {output_file}")
    print(f"  orig ({len(index['orig'])} files):")
    # for f in index['orig']:
    #     print(f"    {f}")

    print(f"  fix ({len(index['fix'])} files):")
    # for f in index['fix']:
    #     print(f"    {f}")


if __name__ == "__main__":
    main()
