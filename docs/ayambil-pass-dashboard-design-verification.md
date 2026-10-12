# Ayambil landscape pass and compact admin — local verification

Existing branch: `codex/express-mysql-production-integration`. Unchanged HEAD: `dad1c7d09ad7bf2eb23a6d3dd49dd9e5d97492cc`. Verification was performed before commit. Implementation committed on 13 October 2026 as `68fc79a`; the operator subsequently authorized a feature-branch push. No hosted access, database writes, configuration changes, message processing, merge or deployment.

## Changes

- `apps/web/src/components/AyambilDigitalPass.jsx`: deterministic fixed-width front/reverse capture; visible front status; two-page PDF through the existing html-to-image/jsPDF implementation. Existing download, print, share and copy actions preserved.
- `apps/web/src/components/AyambilDigitalPass.css`: ivory/maroon/antique-gold landscape layout, readable name area, responsive browser cards and independent export typography.
- `apps/web/src/lib/ayambilPassLayout.js`: 205 × 105 mm page geometry, explicit two-page assembly and physical overflow checks. No name-length rejection or automatic font shrinking.
- `apps/web/src/components/AyambilRegistration.css`: obsolete portrait-pass/export styles removed to prevent cascading conflicts. Registration form styles retained.
- `apps/web/src/pages/AyambilAdminPage.jsx` and `AyambilAdminPage.css`: booking date/status/count, grouped actions, expandable contact/queue details and attendee/pass previews. Existing explicit mutation confirmation retained. Phone numbers are disclosed only inside authenticated expandable contact details.
- `apps/web/tests/ayambilExpressClient.test.js`, new `ayambilPassLayout.test.js` and `tools/ayambil.design-acceptance.mjs`: layout, real jsPDF page geometry, approved terms/credits, overflow, mobile layout and existing action regressions.
- `apps/web/src/lib/ayambilPassPresentation.js` was reviewed and left unchanged: approved bilingual rules and official credit snapshots are preserved.

All pre-existing operational fixes are retained. Production WhatsApp BODY validation remains deferred and unchanged. No new branch was created because the final instruction explicitly requested continuation in the existing worktree.

## Fresh results

Supported runtime: Node 24.19.0. Commands used the explicit bundled node executable and npm CLI (not the system Node 22 shim).

| Command | Exit | Actual result |
| --- | --- | --- |
| `node --test --test-reporter=spec apps/api/tests/*.test.mjs` | 0 | 52 total; 50 pass, 0 fail, 2 intentional database-engine skips |
| `npm run test --prefix apps/web` | 0 | 39 pass, 0 fail, no skips |
| `npm run lint --prefix apps/web` | 0 | No errors |
| `npm run build` | 0 | Full production frontend built; includes the normal website router |
| `node tools/ayambil.design-acceptance.mjs` | 0 | 32 local browser/PDF assertions; API fixture responses mocked; external traffic blocked |
| `git diff --check` | 0 | No whitespace errors |

Browser runner requirements: locally installed Playwright, optionally selected with `PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs`, and an installed browser (this run used `DESIGN_BROWSER_CHANNEL=chrome`). Vite's localhost-only in-memory fixture is transformed with its standard HTML/JSX handling. Generated artifacts are excluded from the watcher to avoid Windows file-lock failures. The runner closes its owned browser/server in `finally`.

Local browser coverage: both evenings, desktop and 390px mobile; all eight bilingual terms and three credit groups; front status; two PDF pages with exact MediaBox dimensions; mobile PDF export; valid long attendee name; cancelled/superseded download/print restrictions; compact authenticated cards; concealed contact; cancel and reissue confirmations without mutation; admin pass export; synthetic CSV; true overflow rejection; no message action or browser runtime errors.

PDF verification: generated both evenings using synthetic data only. Poppler rendered all four PDF pages; inspected front/reverse for clipping, overlap and Gujarati glyph integrity. Each page is 581.102 × 297.638 points (205 × 105 mm), landscape. Desktop, mobile and admin exports use the same fixed 1000px canvas. Artifacts are under ignored `tmp/ayambil-design/` and are not release data.

## Limits and release status

- PASS: local automated suites, browser fixtures, generated PDF dimensions and rendered visual QA.
- NOT RUN: fresh real MySQL/MariaDB engine suites and HTTPS acceptance (no database/backend implementation changes in this design phase); their two generic API skips are not counted as integration coverage.
- NOT RUN: a physical printer/device share-sheet test. Print generates the same verified PDF and instructs actual-size printing.
- NOT RUN: hosted/browser deployment verification. No deployment authorized.
- BLOCKED/unchanged: operational release prerequisites from the existing audit, including legacy queue ownership, migration evidence and backup/rollback verification. This design task does not establish production readiness or real WhatsApp delivery.

Reference inspected read-only: operator programme `D:/work/arham msa/500 aymbil parnu/500 ayambil-.pdf`. Its PDF hint-table warning did not prevent rendering. Existing approved application content was not replaced with inferred reference content.
