# Express/MySQL queue ownership and PocketBase runtime retirement

Local implementation branch: codex/ayambil-express-queue-owner, based on main 8ef2524. No hosted settings, SQL, records or messages changed. Not activated or deployed.

## Ownership and safety

Root start/dev/workspaces already use Express and MySQL. PocketBase SDK was removed from root dependencies and package-lock. The obsolete apps/pocketbase package no longer has runtime/start/migration commands. The minute-based ayambil_whatsapp_outbox hook was removed from the hook-loading path and archived under tools/legacy-pocketbase. Historical source/migrations are retained as evidence, not application dependencies; no old records or files were deleted. Optional SDK compatibility evidence has its own non-workspace tools/legacy-pocketbase-sdk package. Standard API/frontend tests now call Express directly. The old integration runner restores the archived hook only into its owned disposable fixture.

This does NOT prove any already-deployed PocketBase process is stopped. Deleting a repository hook does not retire a running old deployment. Read-only authoritative process/start-command/hook inventory and external scheduler ownership are required before setting the Express owner approval. An empty account cron list is insufficient. Legacy record preservation, backups and route consumers remain unverified.

The executor itself now requires normal-processing approval, explicit Express queue ownership and a reviewed UTC activation timestamp. Normal selection requires active consented booking, booking created at/after activation, queue updated at/after activation, confirmation/pass/reminder type, queued status, zero attempts and no provider reference. Old bookings, old queued jobs, attempted jobs, standalone tests and admin notices are excluded. There is no cleanup or requeue operation. A future reminder for a pre-activation booking is intentionally excluded and requires a separately reviewed exact-job policy.

Pass preflight accepts exact 64-character mixed-case alphanumeric keys while retaining capability hashing, expiry, revocation, active-pass checks and same-booking association. Normal recipients and evening are checked against the saved booking, using phone normalization on both sides. No browser recipient override exists. Exact staging test processing additionally requires staging build and exact staging origin.

Send intent persists before provider POST. No automatic preflight retry: invalid preparation is terminal failed, worker pauses. Unknown acceptance is uncertain and never selected again. The worker runs serial ticks every 15 seconds, reconciles existing accepted/sent provider references, pauses if any fresh preparing/sending/uncertain intent exists, and pauses on failures. Reconciliation checks uncertain intent separately from its bounded provider polling batch. Operator investigation is required before resuming; do not blindly retry after a timeout, restart or missing provider reference. Delivered/read are distinct from accepted/sent.

## Disabled-by-default activation

Keep AYAMBIL_WHATSAPP_NORMAL_PROCESSING_APPROVED=false, AYAMBIL_WHATSAPP_AUTO_WORKER_ENABLED=false or absent, AYAMBIL_WHATSAPP_TEST_BODY_OVERRIDE=false. Queue-owner and activation timestamp may remain absent. No hosted flag was changed.

Only AFTER independent worker retirement/ownership, production template policy verification, controlled delivery evidence and backup/rollback approval, the operator may configure:

- AYAMBIL_WHATSAPP_QUEUE_OWNER=express-mysql
- AYAMBIL_WHATSAPP_AUTOMATION_START_AT=<reviewed activation UTC instant, exact YYYY-MM-DDTHH:mm:ss.sssZ>
- AYAMBIL_WHATSAPP_NORMAL_PROCESSING_APPROVED=true
- AYAMBIL_WHATSAPP_AUTO_WORKER_ENABLED=true

This is documentation, NOT activation authorization. Choose the actual cutover instant, never an earlier timestamp to drain existing jobs. Existing WhatsApp enabled/configuration, queue encryption key and recipient/consent protections remain required. No startup send occurs; first tick happens only after readiness and the timer interval. No migrations or new hosted DB/user are required.

Production BODY snapshot policy is unchanged and remains deferred. If provider BODY definitions are absent and production mapping is not verified, prepare fails closed, worker pauses and sends nothing. A separately reviewed production policy is still required; staging-only override must not be used in production.

## Verification evidence

Provider calls are mocks, localhost schemas owned/disposable. Initial real-engine run failed saved-recipient comparison because queued context included '+' while comparison used normalized digits; fixed by normalizing both values without weakening matching. Fresh MariaDB 11.8.9 rerun: 57 pass, one MySQL skip. Fresh MySQL 8.0.46 rerun: 57 pass, one MariaDB skip. HTTPS local acceptance: 104 assertions, migration 001/002 applied only to owned fixture, 003 unapplied. Processes stopped and gates closed. Later presentation changes expose only boolean worker status, with final local API/frontend/lint/build/browser tests rerun before handoff. No real WhatsApp delivery tested.

Blocked: hosted PocketBase/external consumer retirement evidence, production BODY policy/approved mappings, real controlled provider delivery, backup/rollback and lead schema/access readiness. Automatic production launch remains NO-GO. Never process old queue entries to make the test look successful.

Final local API run after the two additional negative tests: `node --test apps/api/tests/*.test.mjs`, 60 tests, 58 pass, 2 intentional engine skips, exit 0. Focused worker tests: 7 pass. Frontend `npm run test --prefix apps/web`: 42 pass; `npm run lint --prefix apps/web` and `npm run build --prefix apps/web`: exit 0. `node --test tools/production-postinstall.test.mjs`: 5 pass. `git diff --check`: exit 0. Engine runs above preceded only the additional negative unit tests and documentation; no queue source changed afterward. The restricted-shell API attempt could not connect to its localhost fixture (EACCES); the authorized loopback run passed. Browser acceptance uses installed Chrome via DESIGN_BROWSER_CHANNEL=chrome because bundled Playwright Chromium is absent. All local runs use Node 24.19.0; no hosted credentials or live recipients are used.
