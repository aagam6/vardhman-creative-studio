# Phase 5A — event UI and booking rules

Implemented locally, without a website rebuild or production cutover. The existing
React/Vite architecture, PocketBase client, admin routes and six original images
remain. No remote migrations, deployments, secrets, flags, DNS, hosting or provider
settings were changed. No real WhatsApp messages were sent.

## Visitor experience

- Main route: `/500-akhand-ayambil-vijayollas`. The religious identity stays primary;
  Hindi identity and exact Gujarati subtitle remain separate. The prominent free
  evening registration section now follows the hero, with independent artist/date
  cards and full-width bilingual links on phones. No combined option.
- Dedicated routes: `/500-akhand-ayambil-vijayollas/manan-sanghvi` and
  `/500-akhand-ayambil-vijayollas/sairam-dave`. Performer and exact Gujarati programme
  lead each page, with an English transliteration, original day poster, date,
  weekday, time, reachable form and dedicated location card.
- Places of Celebration shows the correct individual evening halls. Day 3 retains
  its separate verified Parna address and unconfirmed Samaiyu notice.
- Exact supplied Maps links use location-pin buttons, safe new-tab attributes and
  descriptive accessible names. Browser checks resolved the first to Shri
  Chandramaulishwar Hall and the second to Tagore Hall. The shortened URLs remain
  unchanged in source; no coordinates were substituted.
- Event-only footer uses maroon, ivory and gold, existing branding, copyright and
  configured social links. Existing unrelated footers are unchanged.
- Short everyday Gujarati accompanies key labels, descriptions, forms, required
  consents, review, errors, confirmation and pass instructions. Official ceremony
  names and programme titles are preserved. No new religious quotations.
- Terms contain all eight proposed rules with plain Gujarati translations. The
  verified studio privacy route is `/privacy`; `/privacy-policy` belongs to the
  separate Param Vir Chakra event and is deliberately not linked here.

## Attendee and consent enforcement

Frontend: one attendee initially; a second can be added and removed. A third is
disabled, and validation independently rejects more than two. Both attendee names,
WhatsApp consent and explicit boolean pass-terms acceptance are required before
review; validation runs again before submission. One matching evening per booking
is preserved. Submission keys, locking and safe retry behavior remain.

PocketBase: registration hook validates one/two attendees and boolean
`termsAccepted=true`, includes acceptance in the idempotency payload hash, and
records `terms_version` and `terms_accepted_at`. Additive migration
`1791636000_ayambil_pass_terms.js` adds these fields without deleting or rewriting
existing bookings. Tested only against a disposable local database.

Supabase: shared Edge validation rejects three attendees and absent, false or
string-valued terms consent. Prepared additive migration
`202610100005_ayambil_booking_terms.sql` adds nullable consent-history fields and
updates the authoritative service-only registration RPC with the same checks.
Existing records remain untouched; no public privileges or gates change.
The acceptance version is `2026-10-10`. New consent values are saved only for new
successful bookings. Direct RPC bypass tests also reject three attendees and
missing/non-boolean acceptance.

**Deployment required:** neither migration nor revised server code has been
applied remotely. Deploy the corresponding migration and hook/Edge validation
alongside the new frontend after review. Keep registration and messaging closed.
Do not switch the live frontend to the test Supabase project. Existing in-flight
requests made before terms were introduced need the refreshed form and consent;
do not treat a rejected retry as a new confirmed booking. Back up the backend
before deployment; preserve old rows, audit history and migrations for rollback.
Rollback requires a reviewed matched frontend/server release, not deleting consent
columns or weakening security rules.

## Portrait assets

The project asset search found the six brochure images and existing branding,
but no suitable performer photographs. The original artwork contains illustrated
religious figures, not verified performer portraits.

Online discovery found [Manan Sanghvi's Saregama artist page](https://www.saregama.com/artist/manan-sanghvi_78823/songs),
[Sairam Dave's official profile links](https://linktr.ee/sairamdave), and a
[Wikimedia image candidate](https://commons.wikimedia.org/wiki/File:Sairam_dave_photo.jpg).
These searches did not establish suitable asset reuse rights; the Wikimedia file
page could not be retrieved for license verification. No new photograph was
downloaded or hotlinked. No AI portrait was generated.

Intentional music/initials artist marks replace the old “official portrait to be
added” blocks and are reused consistently. Accessibility text makes the missing
photograph explicit. Still needed: authorized, preferably high-resolution portrait
files of **Manan Sanghvi** and **Sairam Dave**, with source/permission and any credit
requirements. The website does not claim official portraits are present.

## Validation performed

| Check | Result |
| --- | --- |
| Three event routes | Loaded in browser, correct primary heading and programme/date/venue mapping |
| Widths 320, 360, 390, 768, 1024, 1440 | Main page and both evening pages: document width stayed within viewport; one h1; no broken images detected |
| Confirmation/pass widths | Synthetic multi-attendee confirmation checked at all six widths without horizontal overflow |
| Interactive registration | Isolated loopback mock: two Manan attendees; one Sairam attendee; third-add button disabled; missing terms blocked review; review and final confirmation worked |
| Main route safety | Existing backend preview reported registration closed and controls disabled; mock UI availability never changed real backend flags |
| PDFs | Both downloaded from the existing pass component and rendered with Poppler. Correct separate date, performer, Gujarati programme and hall/address; branding and bilingual summary; no QR |
| Mobile PDF export | Inspection caught clipped names. Fixed with a stable 720px off-screen capture and block-layout attendee text; regenerated PDFs visually checked with complete names |
| Frontend unit tests | 16 pass, including one/two attendees, third rejection, missing second name, boolean terms and sharing/export regressions |
| PocketBase integration | 52 checks pass against disposable database, including direct API limit/terms denial, transactions, authorization, cancellation, reissue and mocked messaging |
| Supabase local tests | Four suites pass; 49 counted database/Edge assertions plus new negative cases; existing RLS and lifecycle checks retained |
| Deno check/lint | Pass |
| Frontend ESLint | Pass |
| Actual Vite production build | Pass; 2,320 modules |

Commands used: `npm run lint --prefix apps/web`, `npm run test --prefix apps/web`,
`node tools/ayambil.integration.test.mjs`, `node --test tools/ayambil.supabase.test.mjs`,
`npx -y deno check supabase/functions/ayambil-test/index.ts`,
`npx -y deno lint supabase/functions`, and from `apps/web`,
`node ../../node_modules/vite/bin/vite.js build --outDir ../../dist/apps/web`.
The first sandboxed build encountered a Windows realpath permission error; the
same local build succeeded with normal filesystem access. The isolated UI preview
needed its explicit existing Tailwind config; that preview configuration was fixed.
An earlier sharing test expected the old hall spelling and was updated to the
user-supplied spelling before the final test run.
Final regression reruns passed after the PDF and bilingual-error fixes. A workspace
`git diff --check` also reported an existing trailing blank line in the unrelated
`apps/web/public/sitemap.xml`; this phase did not edit that file.

The UI fixture tool accepts synthetic names and a reserved synthetic phone only,
returns in-memory `TEST-ONLY` passes, and never contacts a database or provider.
It is an explicit loopback developer tool, not a production API or persistence
fallback. Its tab and process are closed after testing.

Remaining manual checks: native operating-system print dialog/physical printing,
authorized portrait assets, organizer review of public terms/privacy coverage,
and native Gujarati editorial review if desired. No hosted validation of the new
rules is claimed: the Phase 5A migrations and function changes remain local.

## Files created or modified in this phase

Frontend:

- `apps/web/src/pages/AyambilPage.jsx`
- `apps/web/src/pages/AyambilEveningPage.jsx`
- `apps/web/src/pages/AyambilPassDownloadPage.jsx`
- `apps/web/src/pages/AyambilPage.css`
- `apps/web/src/components/AyambilEventDetails.jsx` (new shared cards, directions, artist marks, footer)
- `apps/web/src/components/AyambilRegistration.jsx`
- `apps/web/src/components/AyambilRegistration.css`
- `apps/web/src/components/AyambilDigitalPass.jsx`
- `apps/web/src/lib/ayambilProgramme.js`
- `apps/web/src/lib/ayambilRegistration.js`
- `apps/web/src/lib/ayambilBookingValidation.js` (new pure validator)
- `apps/web/src/lib/ayambilTerms.js` (new paired terms)
- `apps/web/src/lib/ayambilPassUtils.js`
- `apps/web/tests/ayambilBookingValidation.test.js` (new)
- `apps/web/tests/ayambilPassUtils.test.js`

Backend preparation and tests:

- `apps/pocketbase/pb_hooks/ayambil/service.cjs`
- `apps/pocketbase/pb_migrations/1791636000_ayambil_pass_terms.js` (new additive migration)
- `supabase/functions/_shared/contracts.mjs`
- `supabase/functions/_shared/handler.mjs`
- `supabase/migrations/202610100005_ayambil_booking_terms.sql` (new additive migration)
- `supabase/tests/hosted-transactions.sql` (future fixtures include terms acceptance)
- `tools/ayambil.integration.test.mjs`
- `tools/ayambil.supabase.test.mjs`
- `tools/ayambil.supabase.hosted.test.mjs` (future fixtures include terms acceptance)
- `tools/ayambil.supabase.phase4b.test.mjs` (future fixtures include terms acceptance; its temporary RPC stays revoked)
- `tools/ayambil-ui-preview.config.mjs` (new isolated UI fixtures)
- `docs/ayambil-phase5a-results.md` (this report)

Runtime screenshots/PDF renders are under ignored `.ayambil-runtime/`; generated
build output is local only. No dependency, backend configuration, sitemap, route
name or original artwork file was changed. No public registration, WhatsApp send,
combined booking, payment, QR or check-in feature was enabled.
