# Updhan Git review handoff

Review branch: `codex/updhan-registration-review-20261030`

Base: fetched `origin/main`, `a21832bc655899956115a13fd8b6033ff26614d7` (30 October 2026). This is a separate local checkout; unrelated dirty root work and the recent Ayambil checkout were not copied or committed. No push, PR, merge, deploy, live migration or real message was performed.

## What this commit contains

Three Updhan routes, responsive Hindi/Gujarati/English public information and registration, private management dashboard, capacity/manual review operations, encrypted acknowledgement outbox, separate read-only Ayambil identity adapter, additive 20-table SQL candidates, account-grant review, private cache handling and consent-gated Updhan measurement. Existing Ayambil app routes and worker configuration are preserved from the fetched main base. PDF and old design experiments, preview server, local login endpoints and synthetic databases are excluded.

`UPDHAN_ENABLED` defaults off. A push to this review branch is for code review, not permission to activate registration or WhatsApp. Never push this directly to main: main has automatic deployment.

## Validation

- Candidate production web build passed, including existing event SEO generation.
- Candidate API/web regressions: 303 total, 300 passed, 3 opt-in tests skipped, no failures (Node 24.22.1).
- Production runtime import with empty configuration is disabled and opens no database connection.
- Compiled JavaScript scan found no local-login/mock-send/disposable database markers.
- Separate local MariaDB verification and exact 299-to-300 concurrent approval test passed; see `UPDHAN-LOCAL-VERIFICATION-2026-10-30.md`. Those integration tests ran in the authoring checkout, not against live infrastructure.

## Required before merge/activation

1. Refresh main and review any newer Ayambil commits before merging. Review the small shared App/API/build/analytics changes separately.
2. Install pinned runtime dependencies with `npm ci --prefix apps/api/updhan`; this nested package is deliberately separate from the existing Ayambil lockfile. The hosting build must explicitly perform that installation before enabling Updhan; current default-disabled import works using existing root dependencies. Do not assume root `npm ci` installs the nested decoder.
3. Provision restricted runtime and identity credentials, durable private-photo storage, secrets and metadata/grant verification. SQL/grants are review candidates, never startup migrations. Rehearse hosted backup/restore and check HTTP/CDN private caching.
4. Confirm organizer eligibility/minors/privacy/retention and admission category configuration. Frontend display dates do not approve database options.
5. Verify provider UUID versus Meta template ID, Hindi language, exact body/header/footer/button, combined provider rate budget and distinct Updhan worker ownership. No real sender/worker startup is wired into this release. Separate approval/wait/rejection templates remain inactive.
6. Complete fresh browser mobile/keyboard acceptance and final provider no-send checks. Do not describe earlier screenshots or service tests as fresh browser acceptance.
7. Obtain explicit scoped approval for additive migration, deployment, intake opening and later real sending.

## Rollout and rollback

Take encrypted database and private-media backups, verify restore on staging, apply reviewed additive SQL once with a migration account, provision table grants and verify preflight, deploy the reviewed commit with Updhan still disabled, test private auth/read-only identity and registration on hosted staging, then separately approve intake activation. Existing Ayambil tables/queues must retain baseline hashes and behavior.

On Updhan failure, disable only Updhan/its worker; retain registrations, media and outbox state. Never drop shared tables, restore the entire shared database over active Ayambil, replay uncertain messages, or overwrite the newer Ayambil release with the old authoring build. Revert the reviewed Updhan commit on the current main if a code rollback is needed; additive tables remain for forward repair.
