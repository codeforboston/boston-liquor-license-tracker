#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting Data Processing Pipeline..."

# --- Clean up old directories safely ---
echo "--- Cleaning up old directories ---"
for dir in license_json license_text_fix license_text transactional_hearings_txt; do
    if [ -d "$dir" ]; then
        echo "Deleting $dir..."
        rm -rf "$dir"
    fi
done

# --- Ensure voting_minutes_txt exists ---
VOTING_DIR="data/voting_minutes_txt"
if [ ! -d "$VOTING_DIR" ]; then
    echo "Creating directory $VOTING_DIR..."
    mkdir -p "$VOTING_DIR"
else
    echo "Directory $VOTING_DIR already exists"
fi

# --- Optional: Load files if --load is passed ---
if [[ "$1" == "--load" ]]; then
    SRC_DIR="../scrape/voting_minutes_txt"
    if [ -d "$SRC_DIR" ]; then
        echo "Preparing to copy files from $SRC_DIR to $VOTING_DIR..."
        # Ensure the destination is empty
        rm -rf "$VOTING_DIR"/*
        cp -r "$SRC_DIR"/* "$VOTING_DIR"/
        echo "Files copied successfully."
    else
        echo "⚠️ Source directory $SRC_DIR does not exist. Skipping copy."
    fi
fi

# Step 0: Activate Virtual Environment
echo ""
echo "--- Step 0: Activating Virtual Environment ---"
VENV_PATH="./.venv/bin/activate"

if [ -f "$VENV_PATH" ]; then
    source "$VENV_PATH"
    echo "Using python: $(which python)"
else
    echo "⚠️  Warning: Virtual environment not found at $VENV_PATH"
    echo "Attempting to run with system python..."
fi

# Step 1: Extract Transactional Hearing sections
echo ""
echo "--- Step 1: Extracting Hearing Sections ---"
python3 scripts/extract_hearings.py

# Step 2: Split into license text chunks
echo ""
echo "--- Step 2: Extracting License Chunks ---"
python3 scripts/extract_license_chunks.py

# Step 3: Extract to JSON
echo ""
echo "--- Step 3: Extracting to JSON ---"
python3 scripts/extract_to_json.py

# Step 4: Build file index
echo ""
echo "--- Step 4: Building file index ---"
python3 scripts/build_file_index.py

echo "✅ Pipeline completed successfully!"
