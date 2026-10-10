# Phase 4 hosted test deployment — 10 October 2026

Follow-up: [Phase 4B results](ayambil-supabase-phase4b-results.md) records successful
hosted registration, both-evening download lifecycle tests, Sairam PDF inspection,
mocked WhatsApp tests and the print-action limitation. This report remains the
historical Phase 4 record.

## Verified target and deployment

Authenticated CLI account inventory established project **vardhman-ayambil**, reference
`elixeakdejaqpuiaresr`, region `ap-south-1` (Mumbai), status `ACTIVE_HEALTHY`.
No production frontend, Hostinger, PocketBase, DNS or billing changes were made.
No WhatsApp provider request was sent.

Reviewed migrations create only `ayambil_private` and `public.ayambil_test_*`
objects. Initial remote migration history was empty. Dry-run listed exactly:

- `202610100001_ayambil_test_schema.sql`
- `202610100002_ayambil_test_rpc.sql`

Both applied successfully. Final remote history matches both local versions.
Eleven dedicated tables have RLS enabled; their expected constraints and indexes
were inspected. `supabase/tests/security.sql` passed remotely.

Only `ayambil-test` was deployed using API bundling. Final observed status ACTIVE,
version 3. Public status returns HTTP 200 JSON with `open=false`.
This status response alone does not prove database or full application readiness.

## Hosted results

| Test | Actual result |
| --- | --- |
| Both evenings, multiple attendees, correct pass venue/date | Rollback-only hosted SQL assertions passed |
| Idempotency and changed-payload conflict | Hosted SQL assertions passed |
| Independent-session concurrent new submissions | Different PostgreSQL backend PIDs; identical booking; exactly one booking and pass |
| Atomicity after injected pass-write failure | No partial booking; temporary trigger/function and fixtures rolled back |
| Actual RLS filtering | Authenticated role sees no rows even with a transaction-local SELECT grant; grant rolled back |
| Browser reads/writes and privileged RPC | Anonymous 401; authenticated non-admin and admin 403, SQLSTATE 42501 |
| Real hosted Auth | Two synthetic confirmed users created through Auth admin API; real password sign-in HTTP 200 |
| Anonymous Edge admin | HTTP 401 |
| Authenticated non-admin Edge admin | HTTP 403 |
| Authorized admin database operations | Search/date filtering, cancel/restore/reissue, failed-message requeue passed |
| Authorized admin Edge operations | Initially 503 while salt missing; after operator configuration, HTTP 200 for listing, date/search filter, cancellation, restoration and reissue |
| Private pass database RPC | Exactly one saved attendee snapshot; cross-booking isolation, cancellation and supersession denied |
| Private pass Edge download | After operator salt configuration HTTP 200 for correct saved attendee; cancelled and superseded keys HTTP 404 |
| Closed registration | HTTP 403 after response-order correction; database gate false |
| Untrusted origin | HTTP 403 without Access-Control-Allow-Origin |
| Allowed origin | Exact `http://127.0.0.1:3002` echoed; no wildcard |
| Browser CORS preflight | Allowed origin OPTIONS 204; untrusted origin OPTIONS 403 without allow-origin |
| Worker without secret | HTTP 401; no provider request |
| WhatsApp | Sending flag false; zero attempted messages; provider acceptance/delivery not tested |
| PDF sample | Hosted Edge snapshot loaded into isolated preview using existing component; browser saved a 1-page A4 jsPDF file; rendered/visually inspected, Gujarati and venue legible, no QR; system print dialog not exercised |

The concurrency test enables the DB gate inside the first session's uncommitted
transaction, creates a synthetic booking, holds its advisory lock, resets the gate
and commits. Other sessions continue to see the closed gate; the competing request
waits and returns the already-saved booking. No public registration endpoint is opened.

Final database checks: registration_open=false; active bookings=0; cancelled
synthetic bookings=3; enabled admins=0; attempted messages=0; injected test trigger
absent. Six synthetic Auth users remain with random, unretained passwords. Test
admin membership was disabled. No real attendee data was used or deleted.

## Configuration and remaining work

Configured only non-sensitive settings:

- AYAMBIL_TARGET=test
- AYAMBIL_EXPECTED_PROJECT_REF=elixeakdejaqpuiaresr
- AYAMBIL_ALLOWED_ORIGINS: exact local preview origin above
- AYAMBIL_TEST_REGISTRATION_OPEN=false
- AYAMBIL_TEST_WHATSAPP_SEND_ENABLED=false
- AYAMBIL_SUPABASE_PUBLISHABLE_KEY: retrieved securely in memory; value not reported

AYAMBIL_RATE_LIMIT_SALT was initially missing, then configured by the operator.
Only its presence was checked; its value/digest was never read or printed. A salt
value exposed in chat should be rotated securely in the dashboard if it was reused.
Server-secret configuration was excluded from this phase's automatic changes by
the user's instruction to configure only non-sensitive settings.

Hosted retests verified actual admin Edge operations and attendee-specific
download responses. The harness accepts either
HTTP 200 or a reported configuration block, so its process exit alone does not mean
full validation; inspect the sanitized per-test statuses.
The isolated loopback preview under tools/supabase-pass-preview reads only the
synthetic snapshot previously returned by the hosted Edge download, not privileged
keys or private download keys. Its existing PDF component produced the inspected
PDF. It is not a deployed HTTPS pass-link site. The existing live frontend remains
on PocketBase; successful public registration through Edge was not exercised because
its gate remains closed. A 3 November PDF was not separately rendered, although
both dates' saved pass snapshots and venues passed hosted SQL assertions.
Keep both registration gates and WhatsApp sending disabled. Provider credentials,
templates and a real send are outside this phase's no-send scope.

## Commands and sanitized outcomes

All CLI commands used interactive text mode: `--agent no --output-format text`.

```powershell
npx -y supabase --version
npx -y supabase projects list --output json
npx -y supabase link --project-ref elixeakdejaqpuiaresr
npx -y supabase migration list
npx -y supabase db push --dry-run
npx -y supabase db push --yes
npx -y supabase db query --linked --file supabase/tests/security.sql
npx -y supabase db query --linked --file supabase/tests/hosted-transactions.sql
npx -y supabase db query --linked --file supabase/tests/hosted-inventory.sql
npx -y supabase functions deploy ayambil-test --project-ref elixeakdejaqpuiaresr --use-api
npx -y supabase functions list --project-ref elixeakdejaqpuiaresr
node --test tools/ayambil.supabase.test.mjs
npx -y deno check supabase/functions/ayambil-test/index.ts
npx -y deno lint supabase/functions
$env:AYAMBIL_RUN_HOSTED_TESTS='elixeakdejaqpuiaresr'
node tools/ayambil.supabase.hosted.test.mjs
node node_modules/vite/bin/vite.js --config tools/supabase-pass-preview/vite.config.mjs
```

CLI version 2.120.0; both migrations and deployment exited 0. Hosted SQL assertions
and inventory passed. Local regression suites passed (48 counted checks plus
closed-unconfigured regression); Deno check/lint passed. Existing frontend was not
modified or rebuilt in Phase 4; its preceding passing build is not a hosted Supabase
frontend test.

The isolated preview build passed (287 modules); hosted harness syntax check passed.
Preview development initially failed with the workspace esbuild/browser-target
combination; matching the existing app's `esnext` dependency target resolved it.
The bundled Poppler `.cmd` wrappers could not resolve their paths; direct bundled
`pdfinfo.exe` and `pdftoppm.exe` succeeded. PDF information: jsPDF 4.2.1, 1 A4 page,
3,597,938 bytes, no JavaScript or forms. The rendered page was visually inspected.
This synthetic PDF records a pass that was subsequently cancelled in the test DB;
it is not an active registration or an official attendee pass.

Additional CLI operations: help inspection; secrets list (names only); secrets set
for the non-sensitive names above; project API-key retrieval captured in process
memory, never printed; read-only final safety queries. Keys, Auth passwords/JWTs,
private download keys and raw credential outputs were not written into this report.
Sanitized harness results are under ignored `.ayambil-runtime/supabase-test/`.

## Files changed in Phase 4

- .gitignore: excludes Supabase linking/branch temporary files
- supabase/functions/_shared/handler.mjs: closed-registration response before salt requirement
- tools/ayambil.supabase.test.mjs: regression for closed, unconfigured registration
- tools/ayambil.supabase.hosted.test.mjs: opt-in hosted Auth/RLS/concurrency harness
- supabase/tests/hosted-transactions.sql: rollback-only transactions/security tests
- supabase/tests/hosted-inventory.sql: read-only table/index/constraint inventory
- docs/ayambil-supabase-phase4-results.md: this record
- tools/supabase-pass-preview/index.html, main.jsx, vite.config.mjs: isolated synthetic PDF preview
- docs/ayambil-supabase-test-deployment.md: link to hosted results

Link metadata is ignored, not committed. Existing migrations and PocketBase were
not rewritten. No destructive resets, rollbacks, migration repairs or object drops
were executed. Production readiness and cutover are not approved or claimed.
