# Testing Conventions

## TypeScript Conventions

- Client-side tests use **Vitest** and are co-located with the source file (e.g., `data-interface.test.ts` next to `data-interface.ts`)
- This follows the standard Vitest convention and does not use a separate `__tests__/` directory

## Python Conventions

### Summary of Principles

1. **Strict type checking** — pyright strict mode catches bugs statically before tests run
2. **Ruff for linting & formatting** — single tool for consistent, clean Python code
3. **BDD-style naming** — tests read as specifications (`it_parses_...`, `but_it_returns_none_...`)
4. **`unittest.mock.patch` for isolation** — mock network, filesystem, and PDF dependencies in unit tests
5. **Shared fixtures in a shallow conftest.py** — widely-used fixtures live in `conftest.py`; file-specific fixtures stay in the test file
6. **Warnings as errors** — catch regressions early; only add ignore rules with documented reason
7. **Scope-aware fixtures** — function scope by default; class scope for expensive, read-only setups
8. **Verify side effects** — assert both the return value and any resulting state changes
9. **Parametrize over duplication** — use `@pytest.mark.parametrize` for multiple input/output cases
10. **Mirrored test structure** — `__tests__/unit/` and `__tests__/integration/` mirror the source layout

### Key Conventions

- `__tests__/` directory lives at each package root, next to the source it mirrors
- `unit/` — fast, isolated, mocked dependencies — mirrors the source folder structure
- `integration/` — tests that exercise multiple modules together (e.g., full scrape-to-output pipeline, PDF parse-to-entity extraction)
- File naming: `test_<source_module>.py` so pytest auto-discovers them

### Framework & Tooling

- **pytest** as the test framework
- **`unittest.mock.patch`** or **`pytest-mock`** for mocking external dependencies (network calls, filesystem, PDF parsing)
- **ruff** for linting and formatting — replaces flake8, black, and isort in a single fast tool
- **pyright** (strict mode) for static type checking — catches bugs before tests even run

#### Ruff

Ruff handles both linting and formatting. Add to `pyproject.toml`:

```toml
[tool.ruff]
target-version = "py313"
line-length = 100

[tool.ruff.lint]
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # pyflakes
    "I",   # isort (import sorting)
    "UP",  # pyupgrade (modern Python syntax)
    "B",   # flake8-bugbear (common bugs)
    "SIM", # flake8-simplify
]
```

Run with: `ruff check .` and `ruff format .`

#### Pyright (Strict Type Checking)

All Python files should include type annotations. Use pyright in strict mode to enforce this at the project level via `pyproject.toml`:

```toml
[tool.pyright]
typeCheckingMode = "strict"
pythonVersion = "3.13"
```

This catches entire categories of bugs statically — `None` access, wrong argument types, missing return types, untyped function signatures — without needing a test for each one. Type annotations also serve as documentation and make mocking safer (you'll get an error if a mock returns the wrong shape).

Strict mode requires:

- All function parameters and return types annotated
- No implicit `Any` types
- No untyped imports (use type stubs or `# type: ignore` with a reason)

Example:

```python
def parse_address(raw: str) -> ParsedAddress | None:
    """Parse a Boston address string into its components."""
    ...
```

### File & Naming

- File naming: `test_<module_name>.py` (pytest's default discovery pattern — already used with `test_extract_entity.py`)
- Test function naming: `test_<what_it_does>` — descriptive enough to understand the failure without reading the code (e.g., `test_parse_address_with_missing_unit_number`)
- Mirror source structure: test files live in a `__tests__/` directory that mirrors the module they test

### BDD-Style Naming (behavior driven development)

When tests are grouped in a class, use `Describe` prefix and natural-language method prefixes that read as specifications:

```python
class DescribeAddressParser:
    """Unit tests for boston_address_parser.py."""

    def it_parses_a_standard_boston_address(self): ...
    def but_it_returns_none_for_an_empty_string(self): ...
    def and_it_handles_addresses_with_unit_numbers(self): ...
```

| Prefix  | Usage                                               |
| ------- | --------------------------------------------------- |
| `it_`   | Primary happy-path behavior                         |
| `but_`  | Exception / failure path related to the prior `it_` |
| `and_`  | Additional behavior or edge case                    |
| `its_`  | Property or attribute behavior                      |
| `they_` | Plural / collective behavior                        |
| `test_` | Standard pytest (also supported)                    |

Both plain functions (`test_`) and BDD-style classes (`Describe` + `it_`) are supported. Plain functions are the default for simple modules; use classes when a module has enough behavior to benefit from grouping.

#### pyproject.toml configuration required

```toml
[tool.pytest.ini_options]
python_classes = ["Test", "Describe"]
python_functions = ["test_", "it_", "its_", "they_", "and_", "but_"]
```

### Structure & Style

- **Arrange-Act-Assert** pattern for each test — clear separation of setup, execution, and verification
- One assertion per behavior — a test should verify one logical thing (multiple `assert` statements are fine if they verify the same behavior)
- No test interdependence — tests must pass in any order, never rely on state from another test
- Use pytest fixtures over setup/teardown for shared state — they're explicit about dependencies and composable
- Parametrize repetitive cases with `@pytest.mark.parametrize` instead of copy-pasting tests with different inputs
- Use inline comments with `# --` prefix to separate logical sections of assertions

```python
def test_extract_hearing_from_pdf_text(sample_pdf_text):
    # -- act --
    result = extract_hearing(sample_pdf_text)

    # -- parsed fields --
    assert result.entity_name == "Boston Restaurant Group"
    assert result.address == "123 Main St"

    # -- category --
    assert result.license_type == "All Alcohol"
```

### Pytest Configuration

```toml
[tool.pytest.ini_options]
# Treat all warnings as errors, then selectively ignore known false positives
filterwarnings = [
    "error",
]

# Exclude non-test directories from collection
norecursedirs = [".git", "node_modules", "dist", ".venv"]

# File discovery pattern
python_files = ["test_*.py"]

# BDD-style naming support
python_classes = ["Test", "Describe"]
python_functions = ["test_", "it_", "its_", "they_", "and_", "but_"]
```

Key principle: **warnings are errors by default**. Only add ignore rules for known, documented issues that don't affect production.

### Fixture Patterns

#### conftest.py Usage

Use `conftest.py` for fixtures shared across multiple test files. Keep the conftest hierarchy shallow (one per `__tests__/` root) to avoid fixture definitions that are hard to trace. Fixtures specific to a single test file should stay in that file.

```python
# __tests__/conftest.py
import pytest


@pytest.fixture
def sample_pdf_text():
    """Raw text extracted from a sample voting minutes PDF."""
    return (
        "BOSTON LICENSING BOARD\n"
        "DECISION\n"
        "Re: Boston Restaurant Group LLC\n"
        "123 Main St, Boston, MA 02118\n"
    )
```

#### Fixture Scope

- **Default (function) scope** for most tests — each test gets a clean setup
- **`scope="class"`** when a fixture is expensive and the tests are read-only (no mutations)

```python
class DescribeDateParser:
    @pytest.fixture(scope="class")
    def parsed_dates(self):
        """Parse once, assert many times — no mutation."""
        return parse_meeting_dates(SAMPLE_HTML)

    def it_finds_all_meeting_dates(self, parsed_dates): ...
    def and_it_sorts_dates_chronologically(self, parsed_dates): ...
```

### Mocking

Use `unittest.mock.patch` or `pytest-mock` to isolate units from external dependencies like network requests, filesystem access, and PDF parsing:

```python
from unittest.mock import patch


def test_scraper_fetches_meeting_page():
    mock_html = "<html><body>Meeting Schedule</body></html>"

    with patch("app.services.scraper_service.requests.get") as mock_get:
        mock_get.return_value.text = mock_html
        result = scrape_meeting_page("https://example.com/meetings")

    assert "Meeting Schedule" in result


def test_text_extractor_reads_pdf(tmp_path):
    pdf_path = tmp_path / "sample.pdf"
    pdf_path.write_bytes(b"fake-pdf-content")

    with patch("app.services.text_extractor_service.fitz.open") as mock_open:
        mock_open.return_value.__enter__.return_value = [FakePage("extracted text")]
        result = extract_text(str(pdf_path))

    assert result == "extracted text"
```

### Assertion Patterns

#### Parametrized tests for multiple inputs

```python
@pytest.mark.parametrize("raw_address,expected_zip", [
    ("123 Main St, Boston, MA 02118", "02118"),
    ("456 Dorchester Ave, Boston, MA 02125", "02125"),
    ("789 Tremont St, Boston, MA 02120", "02120"),
])
def test_parse_zipcode_from_address(raw_address, expected_zip):
    result = parse_address(raw_address)
    assert result.zipcode == expected_zip
```

#### Expected exceptions

```python
def test_extract_entity_raises_on_malformed_input():
    with pytest.raises(ValueError, match="could not parse entity"):
        extract_entity("")
```

### Practical Rules

- No network/filesystem calls in unit tests — mock external dependencies with `unittest.mock.patch` or `pytest-mock`
- Test edge cases explicitly — empty inputs, missing fields, malformed data (especially relevant for PDF parsing and address logic)
- Keep tests fast — if a test takes more than a second, it probably needs mocking or belongs in an integration test suite
- Use `pytest.raises` for expected exceptions, not try/except blocks

### What NOT to Do

- Don't test third-party library behavior (e.g., don't test that BeautifulSoup parses HTML)
- Don't write tests that just mirror the implementation — test behavior and outcomes
- Don't use classes unless you need shared setup — plain functions are the pytest norm

## Target Test File Structure

The directory trees below represent the target state — not all test files exist yet.

### `scripts/`

```
scripts/
├── boston_address_parser.py
├── extract_entity.py
├── getVotingMinutes.ts
├── validateLicenseData.ts
├── updateLastProcessedDate.ts
├── paths.ts
├── getNextMeetingDate/
│   └── nextMeetingDate.ts
└── __tests__/
    ├── unit/
    │   ├── test_extract_entity.py
    │   └── test_boston_address_parser.py
    └── integration/
        └── test_extract_entity_integration.py
```

### `scraper/scrape/`

```
scraper/scrape/app/
├── link_filters/
├── parsers/
├── services/
├── storage/
├── utils/
└── __tests__/
    ├── unit/
    │   ├── link_filters/
    │   │   ├── test_client_side_filter.py
    │   │   ├── test_exclude_list_filter.py
    │   │   └── test_video_link_filter.py
    │   ├── parsers/
    │   │   ├── test_date_parser.py
    │   │   └── test_html_link_parser.py
    │   ├── services/
    │   │   ├── test_downloader_service.py
    │   │   ├── test_scraper_service.py
    │   │   └── test_text_extractor_service.py
    │   └── storage/
    │       ├── test_json_store.py
    │       ├── test_pdf_store.py
    │       └── test_stats_logger.py
    └── integration/
        └── test_scraper_pipeline.py
```

### `scraper/transform/`

```
scraper/transform/app/
├── pipeline/
│   └── extraction/
├── state/
├── utils/
├── violation_plugins/
└── __tests__/
    ├── unit/
    │   ├── pipeline/
    │   │   ├── test_extract_hearing.py
    │   │   ├── test_extract_license_text.py
    │   │   ├── test_extract_pdf_text.py
    │   │   ├── test_json_extractor.py
    │   │   └── extraction/
    │   │       ├── test_address.py
    │   │       ├── test_category.py
    │   │       ├── test_dba.py
    │   │       ├── test_details.py
    │   │       ├── test_header.py
    │   │       ├── test_license_number.py
    │   │       ├── test_people.py
    │   │       └── test_status.py
    │   ├── state/
    │   │   └── test_kv_store.py
    │   └── utils/
    │       └── test_boston_address_parser.py
    └── integration/
        └── test_transform_pipeline.py
```

## Automation Plan

The recommendations below address the gap between the conventions above and the current project automation. They are listed in priority order.

### 1. Add `pytest` to dev dependencies

Neither `scraper/scrape/pyproject.toml` nor `scraper/transform/pyproject.toml` lists `pytest` or `pytest-mock` in dev dependencies. Add them:

```toml
[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "pytest-mock>=3.14",
    # ...existing deps...
]
```

### 2. Add pytest and pyright config to each `pyproject.toml`

Both existing `pyproject.toml` files are missing the `[tool.pytest.ini_options]` section (BDD naming, `filterwarnings = ["error"]`, `norecursedirs`, etc.). They also use **mypy** instead of **pyright** for type checking. Align with the conventions above by either:

- Replacing mypy with pyright strict mode (as specified above), or
- Keeping mypy and updating this document to reflect that choice

### 3. Add `make test` targets to the Makefiles

Both `scraper/scrape/Makefile` and `scraper/transform/Makefile` have `lint` and `run` but no `test` target. Add:

```makefile
PYTEST := $(VENV)/bin/pytest

test: check-venv
	$(PYTEST) app/__tests__/ -v

test-unit: check-venv
	$(PYTEST) app/__tests__/unit/ -v

test-integration: check-venv
	$(PYTEST) app/__tests__/integration/ -v
```

### 4. Create a GitHub Actions workflow for Python tests

There is a `test-client.yml` workflow for the Vitest/Node side but nothing for Python. Create `.github/workflows/test-python.yml` that:

- Triggers on `pull_request` to `main` (matching `test-client.yml`)
- Uses a **matrix strategy** for the Python packages (`scraper/scrape`, `scraper/transform`) so they run in parallel
- Uses `actions/setup-python@v5` with Python 3.13
- Installs via `uv sync --extra dev`
- Runs three steps: `ruff check .`, `pyright` (or `mypy`), and `pytest`
- Uses **path filters** so the workflow only runs when relevant Python files change

```yaml
name: Test Python

on:
  pull_request:
    branches: [main]
    paths:
      - 'scraper/**'
      - 'scripts/**'

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package:
          - { dir: scraper/scrape, name: scrape }
          - { dir: scraper/transform, name: transform }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.13'
      - run: pip install uv
      - run: uv sync --extra dev
        working-directory: ./${{ matrix.package.dir }}
      - name: Ruff check
        run: .venv/bin/ruff check .
        working-directory: ./${{ matrix.package.dir }}
      - name: Type check
        run: .venv/bin/pyright app/
        working-directory: ./${{ matrix.package.dir }}
      - name: Run tests
        run: .venv/bin/pytest app/__tests__/ -v
        working-directory: ./${{ matrix.package.dir }}
```

### 5. Add Python linting to the reviewdog workflow

The existing `lint.yml` runs ESLint and Stylelint via reviewdog for inline PR comments. Add [`reviewdog/action-ruff`](https://github.com/reviewdog/action-ruff) to get the same inline annotation experience for Python files.

### 6. Create a `scripts/` pyproject.toml

The test structure above shows `scripts/__tests__/` but `scripts/` has no `pyproject.toml` and no Python package management. A minimal `pyproject.toml` with pytest config and dependencies is needed before tests can be discovered and run there.
