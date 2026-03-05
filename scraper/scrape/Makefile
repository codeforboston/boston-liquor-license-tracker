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
	$(PYTHON) -m app.main --download_dir ./data/voting_minutes_pdfs
