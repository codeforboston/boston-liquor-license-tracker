# Boston Liquor License Tracker

### About

**Live site: [license2succeed.org](https://license2succeed.org)**

Join us to help build a vibrant and sustainable restaurant scene in Boston neighborhoods through equitable access to Boston's liquor licensing process! Liquor licenses are crucial to the success of small businesses, and can cost more than $600,000 on the transfer market.

In 2024, [the City of Boston approved 225 new liquor licenses](https://www.wbur.org/news/2024/10/10/boston-liquor-license-expansion-what-to-know), 198 of which are non-transferrable and restricted to businesses within 13 zip codes and the Oak Square neighborhood of Brighton with low numbers of restaurants and bars which serve alcohol.

In partnership with the restaurant advocacy group [Offsite Hospitality](https://www.getoffsite.com/), Code for Boston is working to create a mapping and visualization tool that tracks the distribution of these liquor licenses, increasing transparency and enabling equitable access to these licenses by aspiring restaurateurs.

We are looking for product managers, GIS and data visualization experts, visual and content designers, UX researchers, data wranglers, web developers, accessibility experts, and translators to help us make this project a success

#### Project Leadership on CfB Slack:

- @Curt Project Lead
- @Nick Korn Project Sponsor
- @Will CfB Core Team
- @Griffin Barrows Design Lead
- @Matt Clarke Tech Lead

## Contents

- [Project Goals](#project-goals)
- [Tech Stack](#tech-stack)
- [Documentation](#documentation)
- [Local Setup](#local-setup)
- [Automation](#automation)

### Project Goals

- Bring transparency to the city's liquor license inventory and availability
- Align data schema with City of Boston standards where possible (See https://data.boston.gov/)

### Tech Stack
- **Website:** React, TypeScript and Vite, hosted on GitHub Pages. See the [client README](client/README.md).
- **Data pipeline:** Python. A [scraper](scraper/scrape/README.md) downloads the Licensing Board's voting minutes, a [transform pipeline](scraper/transform/README.md) extracts license records from the PDFs, and [`scripts/`](scripts) merges them into the site's data.

### Documentation
| Document | What it covers |
|---|---|
| [CONTRIBUTING.md](CONTRIBUTING.md) | Joining the team, issues and pull requests |
| [DATA_DICTIONARY.md](DATA_DICTIONARY.md) | Every data field, what counts as a granted license, manual corrections and the data review flow |
| [EDGE_CASES.md](EDGE_CASES.md) | Known quirks in the voting minutes PDFs and how the pipeline handles them |
| [TESTS.md](TESTS.md) | Test strategy and layout |
| [client/README.md](client/README.md) | Website structure and styling conventions |


# Local Setup

## Install Git Large File Storage

Our repo uses Git LFS for managing large files. GitHub Actions workflows will automatically be able to utilize git-lfs, but contributors will need to install and initialize git-lfs on their local system.

- First install locally (with Homebrew, or see the [official documentation](https://docs.github.com/en/repositories/working-with-files/managing-large-files/installing-git-large-file-storage))
```bash 
brew install git-lfs
```
- Then give git access to git-lfs
```bash 
git lfs install
```

## Running the React client:

```bash
cd client
npm install # install dependencies
npm start # start app
```
The app will be running at [http://localhost:5173](http://localhost:5173)

## Running tests

```bash
npm run install:python # installs pytest
npm test               # runs both react and python tests
```

## Python linting (pre-commit)

Python files are linted with [ruff](https://docs.astral.sh/ruff/) via a pre-commit hook. After cloning, activate it once:

```bash
pip install pre-commit
# or
uv tool install pre-commit
# then...
pre-commit install
```

From then on, ruff will check and auto-format any staged `.py` files before each commit. This matches the linting checks run in CI.

# Automation

The site's data updates itself through GitHub Actions. Every step that changes `main` opens a pull request; the bot merges routine ones, and anything that needs judgment waits for a maintainer.

```
Scraper (Mondays) --PR--> bot merges --> new PDF on main --> Data pipeline --PR--> bot merges* --> Pages deploy
```
\* Unless the data PR is labeled `needs-review`.

| Workflow | When it runs | What it does |
|---|---|---|
| **Run Licensing Board Scraper** (`scrape_license_board.yml`) | Mondays 00:00 UTC, or manually | Downloads new voting-minutes PDFs and link data, then opens a PR that the bot merges |
| **Update license data from voting minutes** (`liquor-license-applicant-pipeline.yml`) | When new PDFs or `scripts/data/license_corrections.json` land on `main`; Mondays 06:00 UTC as a fallback; or manually | Transforms every PDF newer than `client/src/data/last_processed_date.json`, merges the results into `licenses.json`, and opens a PR describing the changes |
| **Get Next Meeting Date** (`get-next-meeting-date.yml`) | Sundays 00:00 UTC, or manually | Updates the next Licensing Board meeting date shown on the site, then opens a PR that the bot merges |
| **Deploy static content to Pages** (`main.yml`) | Every push to `main`, or manually | Builds and publishes the site |
| **Test Client**, **Test data pipeline**, **Validate Licenses**, **Lint comments**, **Python lint** | Pull requests | Tests, data validation and linting. Test Client's `build` job is the required check on `main`. |

### Data PRs that need review
When the pipeline finds something it can't decide on its own, such as a board vote that matches no application or a possible duplicate, it adds a **Needs review** checklist to the PR and labels it `needs-review`. Those PRs are not merged automatically. Resolve each item, usually with an entry in `scripts/data/license_corrections.json`, then merge. See [DATA_DICTIONARY.md](DATA_DICTIONARY.md#pipeline-review-flow).

### The bot (`license-tracker-bot`)
The bot is a GitHub App owned by the codeforboston organization and installed only on this repository, with **Contents** and **Pull requests** read/write permissions. The workflows use it to open their PRs and merge them. It is on the `ProtectMain` ruleset's bypass list for pull requests only, so it can merge without an approval but cannot push to `main` directly or force-push.

| Setting | Where |
|---|---|
| `BOT_CLIENT_ID` (the App's Client ID) | Repo **Settings → Secrets and variables → Actions → Variables** |
| `BOT_PRIVATE_KEY` (the App's private key) | Repo **Settings → Secrets and variables → Actions → Secrets** |
| App settings and private keys | Org **Settings → Developer settings → GitHub Apps → license-tracker-bot** |

If `BOT_CLIENT_ID` is missing, the workflows fall back to the default `GITHUB_TOKEN`. They still open PRs, but a maintainer has to approve and merge each one.

**Rotating the private key** (an org admin can do this):
1. On the App's settings page, under **Private keys**, click **Generate a private key**. A `.pem` file downloads.
2. Save the whole file, including the `BEGIN`/`END` lines, as the secret:
   `gh secret set BOT_PRIVATE_KEY --repo codeforboston/boston-liquor-license-tracker < path/to/key.pem`
3. Run **Get Next Meeting Date** manually and check that the **Get bot token** step succeeds.
4. Delete the old key on the App page, then delete the local `.pem` file.
