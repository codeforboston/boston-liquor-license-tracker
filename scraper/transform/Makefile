VENV := .venv
PYTHON := $(VENV)/bin/python
RUFF := $(VENV)/bin/ruff
MYPY := $(VENV)/bin/mypy
UV := $(VENV)/bin/uv

.PHONY: dev lint run check-venv

check-venv:
	@test -x $(PYTHON) || (echo "❌ Virtualenv not found. Run: uv sync" && exit 1)

dev:
	uv sync --extra dev

lint: check-venv
	$(RUFF) format .
	$(RUFF) check .
	$(MYPY) app/

run: check-venv
	$(PYTHON) -m app.cli --dir ../scrape/voting_minutes_pdfs --output licenses.json

run1: check-venv
	@test -n "$(PDF)" || (echo "❌ PDF is required: make run1 PDF=voting_minutes_2025-04-17.pdf" && exit 1)
	$(PYTHON) -m app.cli --file ../scrape/voting_minutes_pdfs/$(PDF) --output licenses.json