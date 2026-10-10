# Supabase test backend preparation — no live cutover

**Phase 4 update:** the test project is now verified and both migrations plus
`ayambil-test` are deployed. Hosted Auth/RLS/concurrency, admin and download results
are recorded in [ayambil-supabase-phase4-results.md](ayambil-supabase-phase4-results.md).
The preparation-time statements below are historical; they are not the current
deployment status. Live traffic remains on PocketBase.

Prepared target name supplied by user: **vardhman-ayambil**, Free plan, Mumbai.
No authenticated Supabase connector is exposed in this session. The project name,
plan, region, project reference, migrations, deployed functions and permissions
have NOT been verified remotely. Nothing has been deployed or applied remotely.
PocketBase, existing frontend clients/routes/artworks, admin UI and PDF code remain
unchanged. This is a separate test backend, not a live replacement yet.

## Files and compatibility

- supabase/migrations/202610100001_ayambil_test_schema.sql creates only new
  ayambil_test_* tables and the new ayambil_private schema; no PocketBase data touched.
- 202610100002_ayambil_test_rpc.sql adds server-only transactional operations.
- functions/ayambil-test/index.ts is a Deno Edge Function with injectable shared
  validation, handler and async VardhmanFlow adapter. No runtime npm dependency.
- tests/security.sql checks RLS/grants without writing records.
- tools/ayambil.supabase.test.mjs runs migrations and the actual HTTP handler with
  disposable PostgreSQL test data, mocked auth HTTP and mocked provider HTTP.
- @electric-sql/pglite is a development-only test dependency. It is NOT used for
  production persistence, and nothing is stored in browser local storage.

Tables: settings (closed by default), sessions (verified evening snapshots),
bookings, attendees, registrations (exactly one date matching the booking), passes,
messages, admins and audit. Private tables store attendee-specific expiring access
keys and technical rate buckets. All tables have RLS enabled, explicit restrictive
deny-browser policies and browser grants revoked. With no permissive policies the effective policy is deny all; there is
no public SELECT/INSERT/UPDATE policy. Only service_role may invoke the public RPC.
Private helper functions have browser execution revoked and fixed search_path.

Admin identities come from Supabase Auth, not migrated PocketBase passwords.
The Edge Function verifies the access token against Auth /auth/v1/user and checks
enabled ayambil_test_admins membership again in the database for every admin
operation. User-editable Auth metadata is never treated as administrator authority.
No public admin-creation endpoint or default account exists.

Booking creation uses one database RPC transaction, an advisory lock on the
hashed idempotency key, unique request hashes and payload-conflict detection.
Attendees, date records, issued pass snapshots, private download access and one
outbox job commit together. A pass insertion failure rolls back all of them.
Cancellation/restoration and reissue are transactional; superseded/cancelled
passes cannot be downloaded. Pass snapshots match the existing React PDF component.
Downloads return exactly one saved active pass, never booking contact data.
PDF rendering remains in the existing browser component; no server PDF storage
or Supabase Storage bucket is required. There is no QR, verification or check-in.

## Local validation before any remote proposal

Run `node --test tools/ayambil.supabase.test.mjs`. This executes the migrations in
ephemeral in-memory PostgreSQL with local Supabase Auth/role fixtures. It is not
the hosted Supabase API, Auth server or Edge runtime. Concurrent handler requests
are exercised, but PGlite serializes database access: multi-connection advisory
locking and SKIP LOCKED behavior require a real PostgreSQL/Supabase test environment.
Also run existing web unit tests, lint, Vite build and PocketBase integration tests.

For full platform tests, install the official Supabase CLI and Docker locally,
review supabase/config.toml, then start an isolated local stack. Apply migrations
to that local stack and run Deno/Edge checks. Do not use `db reset` on a linked
remote project; destructive reset commands are deliberately not provided here.
Test real multi-session retries, real Auth tokens, disabled/non-admin users,
DB failure rollback, private downloads, cancellation/reissue and worker races.
Keep test booking contact/attendee details synthetic. Do not use production exports.

## Required dashboard verification and secrets

Before proposing remote changes, verify in Supabase Dashboard that the selected
organization/project is **vardhman-ayambil**, Free plan, Mumbai; record its actual
project reference and API URL from Project Settings / API (or Connect).
Do not infer the project reference from its display name. Check existing tables
for name collisions; migrations intentionally fail rather than overwrite them.
No billing/paid add-ons are necessary for these preparation files; verify current
Free quotas before deployment and do not enable billing or upgrade automatically.

Edge Function server secrets/configuration (never frontend VITE secrets):

| Name | Required purpose |
| --- | --- |
| SUPABASE_URL | Platform-provided API URL |
| SUPABASE_SERVICE_ROLE_KEY | Platform-provided privileged server-only key |
| AYAMBIL_SUPABASE_PUBLISHABLE_KEY | Publishable project key for Auth validation |
| AYAMBIL_EXPECTED_PROJECT_REF | Operator-verified target reference |
| AYAMBIL_TARGET | Must equal test; other targets are rejected |
| AYAMBIL_ALLOWED_ORIGINS | JSON array of exact origins for an isolated test harness/preview |
| AYAMBIL_RATE_LIMIT_SALT | Random server-only salt for technical throttle buckets |
| AYAMBIL_TEST_REGISTRATION_OPEN | false/unset initially; test-only enablement requires approval |
| AYAMBIL_WORKER_SECRET | Random secret of at least 32 characters, server-to-server only |
| AYAMBIL_TEST_WHATSAPP_SEND_ENABLED | false/unset initially; separate authorized test approval required |
| AYAMBIL_TEST_RECIPIENTS_JSON | Explicit allowlist of consented test E.164 numbers |
| AYAMBIL_PUBLIC_SITE_URL | Verified HTTPS isolated preview with test pass-download adapter |
| AYAMBIL_FLOW_API_KEY / AYAMBIL_FLOW_API_SECRET | Existing VardhmanFlow server credentials |
| AYAMBIL_FLOW_CHANNEL_ID | When required; must match authenticated channel |
| AYAMBIL_FLOW_API_PREFIX | Authenticated verified prefix, never guessed |
| AYAMBIL_FLOW_TEMPLATE_02 / _03 | Actual approved event template names |
| AYAMBIL_FLOW_LANGUAGE_02 / _03 | Actual approved languages |
| AYAMBIL_FLOW_PARAMETERS_02 / _03 | Ordered JSON field mappings validated against actual bodies |

Do not paste keys into chat, commit secrets, print environment files or use
request-body/auth-header debugging. Supabase-managed request logging must be
reviewed for retention/redaction before any sensitive test data is used.

## Controlled test deployment steps — operator approval required

1. Verify project identity, region, Free plan and table inventory. Keep production
   PocketBase and frontend configuration untouched. Create a local backup/dump of
   any existing TEST data privately; do not assume paid backup features exist.
2. Review both migrations and security.sql. Apply only to the verified test project
   via the SQL Editor or official CLI after approval, preserving version history.
   No destructive down migration, table deletion or existing-data import is supplied.
3. In Authentication settings disable public email signups for this project and
   provision a test administrator through the supported Auth admin/dashboard flow.
   In a trusted SQL Editor insert that exact Auth UUID into ayambil_test_admins with
   enabled=true. Never use a public registration endpoint to grant membership.
4. Add server secrets in Edge Functions / Secrets. Keep sending and test
   registration flags false. Do not publish privileged keys to the browser.
5. Deploy only ayambil-test with the reviewed verify_jwt=false setting. The function
   handles public registration/downloads; admin JWTs are explicitly verified by
   Auth, then database membership. Worker calls require a separate private secret.
6. Verify POST operation=status returns JSON with open=false and run security.sql.
   The status remains closed even when the isolated test gates are temporarily
   enabled: it is deliberately not a live-registration readiness endpoint.
7. Build a separate test harness/preview only after approval. Public requests use
   the publishable key, never service_role. POST to /functions/v1/ayambil-test with
   `{operation,body}`. Operations: register, download (body.key), admin-check,
   admin/bookings, admin/change and admin/whatsapp-retry. Admin calls add a Supabase
   Auth access token. Responses match the existing booking/pass data shapes.
   Existing frontend SDK/login/signout is NOT switched automatically by these files.
8. Only after approval set the test DB singleton registration_open=true and the
   test Edge flag true. Both are needed to create a new test booking. Retry of an
   already saved request can be tested without a second booking. Run all scenarios
   with synthetic contacts/names. Confirm individual pass downloads and PDF rendering
   in the preview; do not route live traffic or use the production pass page.
9. Verify VardhmanFlow account, actual template schemas and authorized test recipient.
   Its API list example may omit body schemas: missing schema blocks sending.
   Private URLs point to the isolated preview, with a different key per attendee.
   No document-attachment support is invented; multiple links use the configured
   approved body mapping. Confirm provider template/message-length constraints for
   the tested attendee count; rejected messages remain failed, never falsely sent.
10. Only with separate approval invoke worker using the private worker secret.
    No automatic cron is enabled. Before dispatch it verifies account/templates;
    one job is claimed per invocation. Provider IDs/status are saved. Timeouts,
    interrupted requests or malformed responses become uncertain, not auto-retried.
    Known-ID status polling can reconcile; no-ID cases need provider investigation.
    Only confirmed failed jobs may be requeued by an enabled administrator. A retry
    changes only the job, not bookings/passes. Delivered/read statuses cannot regress.
11. Test a genuine authorized message and its attendee-specific preview downloads.
    Do not claim delivery from acknowledgment alone. A final live cutover plan,
    independently verified permissions, frontend adapter, retention/backup policy,
    scheduler, provider quota handling and explicit user approval are still required.

Technical rate limiting is 30 requests/minute per public operation or authenticated
admin/operation; it is a test-backend abuse control, not an invented event capacity.
Worker invocations must be bounded by the documented provider key quota and Edge
runtime limits. No automatic scheduling, unauthenticated webhook or unofficial
WhatsApp automation exists. No new paid provider/service is introduced.

## Rollback

The live website remains on PocketBase, so there is no traffic rollback to perform.
Stop test requests, keep both test gates false, set DB registration_open=false,
disable test worker invocations and revoke test admin membership as appropriate.
Retain test data/migration history and secure dumps; do not delete PocketBase data
or remove its hooks. Preserve issued production pass history if a later separately
approved import occurs. Test schema/code removal needs separate review, not a
destructive automatic down migration. Migration approval does not approve cutover.

## Validation results for this preparation

- `node --test tools/ayambil.supabase.test.mjs`: two test suites passed, including
  48 counted SQL/Edge assertions plus validation, permission-denial and payload checks.
- `npx -y deno check supabase/functions/ayambil-test/index.ts`: passed.
- `npx -y deno lint supabase/functions`: passed.
- Existing web unit tests: 12 passed; web ESLint: passed.
- Existing isolated PocketBase integration tests: 48 passed.
- Direct Vite production build: passed; event pages and existing PDF chunks compiled.
- No remote Supabase deployment, migration, Auth provisioning or provider send ran.

## Unverified boundaries

Hosted deployment/project identity, real multi-session database concurrency,
Supabase Auth/Edge integration, remote RLS/grants, provider acceptance/delivery,
full preview PDF/link flow, plan quota/backup availability and live migration are
not claimed by local tests. No Supabase credentials were requested in chat.

References:
https://supabase.com/docs/guides/functions/auth-legacy-jwt
https://supabase.com/docs/guides/database/postgres/row-level-security
