#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

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

echo "GOTO http://localhost:8000/viewer.html"
python -m http.server