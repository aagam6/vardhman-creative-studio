# Phase 4B hosted test validation — 10 October 2026

Target verified through authenticated Supabase CLI: `vardhman-ayambil`,
`elixeakdejaqpuiaresr`, `ap-south-1` (Mumbai). This is a test-project result,
not production approval. No Hostinger, DNS, live frontend configuration or
PocketBase changes were made. No WhatsApp provider request was sent.

## Actual results

| Gap | Result |
| --- | --- |
| Successful hosted registration | HTTPS Edge registration passed for 2 November (one attendee) and 3 November (two attendees). Saved passes matched each booking's evening. |
| Isolated test mechanism | Temporary `admin/test-register` required hosted Auth and enabled test-admin membership, synthetic names and a reserved synthetic phone number. Anonymous requests returned 401; non-admin requests returned 403. The existing transactional registration RPC ran with its gate temporarily changed inside an uncommitted transaction, then restored before commit. Public registration remained 403 throughout. |
| Duplicate submissions | Concurrent identical HTTPS retries returned the same booking; changed payload returned 400. No duplicate passes were created. Earlier independent-connection concurrency and rollback tests remain recorded in the Phase 4 report. |
| Sairam PDF | Existing browser PDF component rendered the saved HTTPS download snapshot. Downloaded one-page A4 PDF was rendered with Poppler and visually inspected: 3 November 2026, 8:00 PM IST, “મારી મા... મારો પ્રાણ”, Sairam Dave, Tagore Hall and the verified Paldi address. No QR code or clipping. |
| Private downloads | Deployed HTTPS `download` operation returned 200 for the correct capability key and exactly its attendee snapshot; missing/random keys returned 404. Arbitrary booking identifiers could not switch the result. Cancelled and superseded keys returned 404. Restoration allowed the original active pass; reissue invalidated the previous pass. |
| Print action | Clicked the existing Print button in the isolated in-app browser. DOM confirmed `ay-print-selected` on the intended pass, proving the handler reached the print action. Browser input timed out at `window.print()`. Native OS print-dialog appearance and actual printing are not verified; manual verification remains required. |
| WhatsApp construction | Offline mocked tests checked both event templates, parameter/date/programme/venue/count/private-link content and a single `/api/v1` prefix. Mock acceptance, rejection, delayed response, timeout and missing provider ID passed. No live sending or delivery claim. |
| Cleanup | Two Phase 4B synthetic bookings cancelled; temporary admin disabled. Migration 004 revoked fixture RPC execution including service_role. Final database checks: zero active bookings, zero enabled admins, zero attempted messages, registration gate false, fixture execution false. Synthetic audit/history and two synthetic Auth users with random unretained passwords remain; no destructive deletion. |
| Final gates | Server registration and WhatsApp flags remain false; public registration returned 403 after tests. No live traffic switched. |
| Regression | All validation commands below passed. |

Download authorization uses an opaque private capability, not a user's JWT.
A valid capability with an invalid JWT therefore returns its own pass snapshot;
missing or incorrect capabilities are denied. The deployed function returns
authorized pass data; the existing browser component produces the PDF. The
HTTPS download checks do not claim a server-generated PDF attachment response.

## Changes and remote operations

- `supabase/migrations/202610100003_ayambil_staff_fixture.sql`: additive, restricted test fixture RPC.
- `supabase/migrations/202610100004_ayambil_disable_staff_fixture.sql`: revokes execution after the one-time hosted tests; retains history.
- `supabase/functions/ayambil-test/index.ts` and `_shared/handler.mjs`: authenticated fixture dispatch using the existing validation and registration implementation.
- `tools/ayambil.supabase.phase4b.test.mjs`: opt-in hosted synthetic validation and safe cancellation/admin cleanup.
- `tools/ayambil.supabase.test.mjs`: fixture authorization/validation, cleanup privilege and mocked VardhmanFlow regressions.
- This report. Main website and PocketBase source remain unchanged.

Authenticated project inventory was checked before remote changes. For each new
migration, migration history and `db push --dry-run` were inspected and listed
only its intended additive change. Both migrations applied successfully. The
updated `ayambil-test` function deployed successfully using API bundling.
Registration and WhatsApp flags were explicitly maintained false.

The hosted harness is a one-time audit tool: migration 004 intentionally disables
its fixture operation. Do not rerun it expecting success or grant privileges
automatically. Any future fixture run needs a separately reviewed test-only
enablement and cleanup procedure.

## Commands and sanitized outcomes

```powershell
npx -y supabase projects list --output json
npx -y supabase migration list --linked
npx -y supabase db push --dry-run
npx -y supabase db push
npx -y supabase functions deploy ayambil-test --use-api --project-ref elixeakdejaqpuiaresr
$env:AYAMBIL_RUN_HOSTED_TESTS='elixeakdejaqpuiaresr'
node tools/ayambil.supabase.phase4b.test.mjs
node --test tools/ayambil.supabase.test.mjs
npx -y deno check supabase/functions/ayambil-test/index.ts
npx -y deno lint supabase/functions
npm run test --prefix apps/web
npm run lint --prefix apps/web
# From apps/web, actual production build:
node ../../node_modules/vite/bin/vite.js build --outDir ../../dist/apps/web
```

All commands completed successfully: four Supabase test suites (including the
existing 48 counted assertions plus added regressions), twelve frontend tests,
Deno check/lint, frontend ESLint and Vite production build (2,317 modules).
Additional CLI read-only SQL queries verified final safety state. API credentials,
Auth passwords/JWTs and private download keys were captured in process memory
without printing; this report intentionally omits credential-bearing commands.

The isolated preview used `tools/supabase-pass-preview/vite.config.mjs` on loopback
port 3004 and the existing pass component. Download and print buttons were
exercised; its browser tab and development server were closed afterwards.
`pdfinfo.exe` confirmed one A4 page; `pdftoppm.exe` produced the visually inspected
PNG. These synthetic passes were subsequently cancelled in the test database.

## Remaining manual verification

Verify a native print dialog and print-to-PDF/physical print in a supported desktop
browser. Live WhatsApp acceptance/delivery and production configuration were
deliberately excluded; they require separate authorization and approved provider
configuration. Production readiness and a frontend cutover are not claimed.
