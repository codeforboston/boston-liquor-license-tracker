# Correcting license data

The site's license data comes from the Licensing Board's voting minutes, read automatically. When it gets something wrong, an approved editor can fix it with a short form. No code or technical knowledge is needed.

## Before you start (once)

1. Create a free GitHub account at [github.com/signup](https://github.com/signup) if you don't have one.
2. Send your GitHub username to the project team. They add you as an approved editor.
3. Bookmark these two links:
   - [Correct a license record](https://github.com/codeforboston/boston-liquor-license-tracker/issues/new?template=correct-license.yml)
   - [Add a missing license](https://github.com/codeforboston/boston-liquor-license-tracker/issues/new?template=add-license.yml)

## Making a correction

1. Open **Correct a license record**.
2. Enter the license number (for example LB-574154) and choose what to do:
   - **Change a detail**: pick the detail and type the new value.
   - **Hide this license from the site**: for licenses that shouldn't be listed.
   - **Show a hidden license again**: undoes a hide.
3. Say why, and where you confirmed it (for example "March 5, 2026 minutes, item 25").
4. Press **Submit**.

Within a few minutes a reply appears under your submission:

- **"Done"** lists exactly what changed. The site shows it about five minutes later, and your submission is closed.
- **"I couldn't apply this yet"** says what to fix. Use the **...** menu at the top right of your submission, choose **Edit**, fix it and save. It tries again automatically.

To undo a change, submit another correction with the old value. Each submission changes one detail.

### Tips

- Dates can be written however is natural: 2025-02-13, Feb 13, 2025, or 2/13/2025.
- To mark a license Granted, first submit its **Date granted**, then change its **Status**.
- Changing a license back to Deferred or Expired clears its date granted automatically.
- Type `none` as the new value to clear a DBA name, note, or date.

## Adding a missing license

Use **Add a missing license** for a zip-code-restricted license the site doesn't show at all. You'll need the details from the voting minutes: business name, address with zip code, status, alcohol type, the hearing date, and the date of the minutes it appears in.

## For maintainers

- Approved editors are listed, comma-separated, in the `CORRECTIONS_EDITORS` repository variable (Settings → Secrets and variables → Actions → Variables).
- Their submissions are applied by the *Apply license correction* workflow (`.github/workflows/license-correction.yml`) without review. `scripts/apply_correction.py` checks the form and writes `scripts/data/license_corrections.json`; the bot opens and merges a `[CORRECTION]` pull request. Each entry's reason includes the source and the issue number.
- Submissions from anyone else get a thank-you reply and wait for a maintainer.
- If a run fails for a technical reason, the issue gets the `needs-review` label and a link to the failed run.
