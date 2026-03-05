#!/bin/bash

rm log/transform.log
uv run python -m app.cli --file ../scrape/data/voting_minutes_pdfs/$1
