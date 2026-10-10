# Premium digital pass redesign

## Changes

- `apps/web/src/components/AyambilDigitalPass.jsx`: separate primary English event
  heading and Gujarati title; saved performer/programme before attendee details;
  prominent attendee name/pass number; saved date/time/venue; credit panels and
  eight user-supplied bilingual rules. Sharing branding no longer uses Vijayollas.
- `apps/web/src/components/AyambilDigitalPass.css`: pass-scoped ivory/maroon/gold
  typography, thin borders/dividers, responsive preview and stable PDF styling.
- `apps/web/src/lib/ayambilPassPresentation.js`: display-only date-specific approved
  credit configuration, saved-credit precedence, English/everyday Gujarati rules.
- `apps/web/tests/ayambilPassPresentation.test.js`: missing-name handling, saved
  credit precedence, evening isolation and bilingual rules.

## Existing format retained

The existing export uses html-to-image at a fixed 720px capture width and jsPDF.
It produces one portrait A4 page (210 × 297mm). Content is placed at x/y 10mm,
190mm wide when it fits; taller content is proportionally fitted within 277mm
height and centred. Those export calculations, dependencies and page count were
not changed. Existing browser print width remains 180mm. There was no established
separate back page; the matching rules/organiser panel is below the front details
on the same page, preserving the required single-page export.

Attendee details and session snapshots continue to come from saved issued passes.
No database fields, API identifiers, routes or stored records were renamed.
Gujarati glyphs remain raster-preserved by the existing font-ready DOM capture.
No QR/barcode, verification, scanning, check-in or payment features were added.

## Beneficiary and organiser configuration

The brochures list families in different beneficiary/organiser roles, but the
existing approved programme configuration has no definitive per-evening pass
credit mapping. No family was assigned a role by inference. Both dates currently
have null defaults and show “Name awaiting approval / નામ કન્ફર્મ કરવાનું બાકી છે”.
Populate `ayambilPassCredits[date].labharthi` and `.aayojak` only after confirming
the exact approved names. An approved saved pass snapshot, when supplied by the
existing backend, takes precedence. No unverified contact details were added.

## Actual validation

- Frontend lint: passed.
- Frontend unit tests: 19 passed, including maximum two attendees and terms consent.
- Supabase local regression: four suites passed, including 49 reported assertions
  and negative attendee/consent cases; HTTP provider transport mocked.
- PocketBase: 52 disposable local integration checks passed, including one/two
  attendees, direct API rejection of a third, separate evening pass issuance,
  duplicate requests, authorization, private downloads and cancellation/reissue.
- Vite production build: passed (2323 modules). The first sandboxed attempt failed
  on filesystem realpath; the authorized unsandboxed build passed.

## Remaining verification — do not treat as passed

Browser review initially rejected localhost access because of the earlier denial.
The user then explicitly approved testing, but the browser tool still rejected
access because a saved permission setting blocks http://127.0.0.1:3005. No alternate
browser/automation workaround was attempted. That saved browser permission must
be changed through the app's supported permission controls before visual QA resumes.

Neither revised Manan Sanghvi nor Sairam Dave PDF was generated or visually inspected
in this run. PDF download, print action, 360/390/430px overflow, Gujarati glyphs,
terms legibility, page fit and screenshot checks therefore remain pending.
Native print dialog and physical printing were not verified. Source-level export
dimensions/page-count preservation is not a substitute for checking generated PDFs.

Supabase Deno type check: passed after authorized network access. The initial
sandboxed attempt failed on npm DNS resolution. No Supabase function/backend
source was changed by this pass-only refinement.

Production settings, hosting/DNS, registration enablement and WhatsApp sending were
not changed. No production migration, live backend switch or real message occurred.
