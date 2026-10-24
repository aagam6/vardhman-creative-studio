# SheetJS security update

The Excel pass generator imports the first worksheet from `.xls` and `.xlsx` files and exports the existing pass-generation columns. Its direct `xlsx` dependency was the obsolete npm registry version 0.18.5.

Use the official SheetJS CE 0.20.3 distribution, pinned to its versioned HTTPS tarball with SHA512 integrity in package-lock.json. This preserves the existing API and avoids a replacement library or unrelated major upgrades.

Sources:

- https://docs.sheetjs.com/docs/getting-started/installation/nodejs/
- https://github.com/advisories/GHSA-4r6h-8v6p-xvw6 (prototype pollution; fixed in 0.19.3)
- https://github.com/advisories/GHSA-5pgg-2g8v-p4x9 (ReDoS; fixed in 0.20.2)

Validation: clean Node 24 npm ci, production frontend build, 193 tests (190 passed, 3 optional database tests skipped), and npm audit reporting zero advisories. Excel compatibility tests cover both supported workbook formats, Gujarati text, string phone numbers, first-sheet selection and existing generation logs.

Actual existing single/combined browser downloads passed strict PDF parsing with two/four pages. An isolated six-pass fixture produced twelve pages, including a long Gujarati name. Private files, links, attendee details and hashes remain outside Git in the ignored verification directory.

Deployment requires the normal main-branch build only. No database migration, restore, booking maintenance, message processing, live pass modification or Trash purge is required. Keep existing hosting/cache configuration and worker settings. Verify deployed revision, startup, authenticated read endpoints and public registration availability; compare protected live records and message attempts with the fresh baseline, accounting for genuine new registrations.
