import os

# Configuration
INPUT_DIR = "data/voting_minutes_txt"
OUTPUT_DIR = "data/transactional_hearings_txt"

START_MARKERS = [
    "Transactional Hearings,",
    "The Board held a transactional hearing on",
    "Transactional Hearings:",
    "Transactional Hearing",
    "Transactional Hearing:",
    "Transactional Hearing Agenda",
    "Hearing Date:",
]

STOP_MARKERS = [
    "Old & New Business",
    "OLD AND NEW BUSINESS",
    "Old and New Business",
    "Non Hearing Common Victualler Transactions",
    "Non-Hearing Common Transactions",
    "Non-Hearing Transactional:",
    "Non-Hearing Transactional Items:",
    "The following are applying for a new Common Victualler License",
]


def extract_section(input_path, output_path):
    try:
        with open(input_path, encoding="utf-8") as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Error reading {input_path}: {e}")
        return

    extracted_lines = []
    in_section = False

    for line in lines:
        stripped_line = line.strip()
        lower_line = stripped_line.lower()

        # ✅ VERY SPECIFIC EXCLUSION — put this FIRST
        if "see old and new business" in lower_line:
            extracted_lines.append(line)
            continue

        # Check for start marker if not already in section
        if not in_section:
            for marker in START_MARKERS:
                if marker.lower() in lower_line:
                    in_section = True
                    extracted_lines.append(line)
                    break
        else:
            # Check for stop marker if already in section
            stop_found = False
            for marker in STOP_MARKERS:
                if marker.lower() in lower_line:
                    stop_found = True
                    break

            if stop_found:
                break

            extracted_lines.append(line)

    if extracted_lines:
        try:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, "w", encoding="utf-8") as f:
                f.writelines(extracted_lines)
            # print(f"Extracted section from {os.path.basename(input_path)}")
        except Exception as e:
            print(f"Error writing to {output_path}: {e}")
    else:
        print(
            f"No Transactional Hearing section found in {os.path.basename(input_path)}"
        )


def main():
    abs_input_dir = os.path.abspath(INPUT_DIR)
    abs_output_dir = os.path.abspath(OUTPUT_DIR)

    if not os.path.exists(abs_input_dir):
        print(f"Input directory not found: {abs_input_dir}")
        return

    files = [f for f in os.listdir(abs_input_dir) if f.endswith(".txt")]
    print(f"Found {len(files)} files to process.")

    for filename in files:
        input_path = os.path.join(abs_input_dir, filename)
        output_path = os.path.join(abs_output_dir, filename)
        extract_section(input_path, output_path)


if __name__ == "__main__":
    main()
