#!/bin/bash

uv run python -m app.cli --file voting_minutes_pdfs/$1 >out.txt
