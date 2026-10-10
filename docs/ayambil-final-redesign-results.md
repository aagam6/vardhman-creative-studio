# Vijayollas final interface refinement

Implemented in the existing React/Vite event routes. No backend configuration,
deployment, DNS, production flags, credentials or stored records were changed.
PocketBase remains the frontend backend; Supabase remains an isolated test backend.

## Files changed in this refinement

- `apps/web/src/pages/AyambilPage.jsx`: Gujarati primary identity, separate English
  identity/supporting title, editorial hero, programme and registration actions.
- `apps/web/src/pages/AyambilEveningPage.jsx`: consistent supporting identity with
  performer/programme remaining the primary heading.
- `apps/web/src/components/AyambilEventDetails.jsx`: distinct evening choices,
  directions on each choice, simple Gujarati, programme/registration/directions
  links and verified `/privacy` and `/terms` routes in the event footer.
- `apps/web/src/components/AyambilInstructions.jsx`: accessible English, Gujarati
  and Hindi instruction selector, available on the landing page and both forms.
  This translates essential instructions, not the entire website.
- `apps/web/src/components/AyambilRegistration.jsx`: native 1-or-2 attendee selector;
  existing fixed date, server submission, explicit consents and idempotency retained.
- `apps/web/src/lib/ayambilTerms.js`: attendee-specific passes, checking details,
  arriving in good time, cancelled/superseded passes and private-link security.
- `apps/web/src/components/AyambilDigitalPass.jsx`: consistent Gujarati/English
  identity in the pass and sharing draft; saved event details remain authoritative.
- `apps/web/src/pages/AyambilPage.css` and
  `apps/web/src/components/AyambilRegistration.css`: scoped editorial typography,
  responsive actions/selectors, instruction panel and Gujarati pass headings.

## Checks

- Frontend lint: passed.
- Frontend unit tests: 16 passed.
- Supabase local regression: 4 suites passed, including 49 assertions and validation
  cases for 1/2 attendees, rejection of 3 and explicit boolean terms acceptance.
- Disposable local PocketBase integration: 52 checks passed, including direct API
  rejection of a third attendee, retries, authorization, private downloads and
  cancellation/reissue. Provider transport was mocked.
- Supabase Edge Function Deno type check: passed (existing workspace warning).
- Vite production build: passed.
- Six original artwork files retained. Exact supplied Maps URLs retained for the
  corresponding artist on registration cards, location cards and footer.

## Unresolved visual acceptance

Browser access to the isolated localhost preview was rejected because permission
was declined. No workaround was attempted. Consequently this refinement has NOT
been visually verified at 360/390/430px, tablet or desktop; no new screenshots or
new PDF renders were captured. Those checks, including Gujarati glyph rendering,
PDF page fit and print-dialog behaviour, still require browser access/manual QA.
Existing PDF capture and download/print code was retained, but earlier screenshots
are not evidence for this revised layout.

Approved performer photographs remain unavailable in the supplied/repository
assets. Intentional neutral artist marks remain; no portrait was fabricated.
No Maps network destination checks were repeated in this run. Source links match
the exact user-approved URLs; previous destination checks are documented separately.

Existing prepared maximum-attendee/terms backend migrations were exercised locally;
this task did not apply them remotely. Production readiness must not be inferred
from these local tests. Registration/WhatsApp settings were not enabled or changed.
