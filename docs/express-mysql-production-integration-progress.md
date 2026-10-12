# Express/MySQL integration progress — BLOCKED, NOT DEPLOYABLE

Production integration branch: codex/express-mysql-production-integration.
Base: current verified main 83d9c3f427a2f61a0b41572b2e420ae53d01d265.
Separate managed worktree preserves dirty staging checkout and all user previews.
No commit, push, PR, merge or deployment yet: this is an incomplete local port.

## Actual implementation
- Selectively ported apps/api Express/MySQL backend and Ayambil frontend/client/admin/export/pass changes, not a merge of staging history.
- Canonical programme moved into apps/api/programme.json; production Ayambil client/backend do not load PocketBase configuration.
- Full main App/router/pages/assets/sitemap/Updhan unchanged. Full normal build is produced, no staging mini-site.
- Local exact-booking module/test and its client operation excluded from this worktree.
- SPA sendFile uses an explicit root and basename; fixes hidden .codex worktree handling without allowing dotfiles.
- Offline tools/legacy-export-preflight.mjs validates a private normalized collection/schema export, duplicate identities, relationships, file references and attempted/uncertain queue counts. Reports counts only, never claims migration complete. No HTTP/SQL/write operation in this tool.

## Blocking automatic review
Automatic approval review rejected the combined local lead-router/schema patch before execution: it considered replacing legacy /hcgi/platform behavior with 404 and adding schema without proven route/data compatibility unsafe. None of that command ran. Do not bypass the rejection.

Concrete next reviewed change: replace the two proven lead callers (LeadCaptureSection.jsx and ComingSoonPage.jsx) with same-origin POST /api/leads; preserve POST /hcgi/platform/api/collections/leads/records as a compatibility alias. Validate name/email/company/message, bound lengths, exact origin, rate limits and JSON/no-store. Do NOT replace the entire legacy namespace with 404 until all consumers are audited. Store these four fields plus UUID/timestamp in a reviewed additive vcs_leads table; use a separate vcs_imports identity/hash ledger for idempotent offline imports. Do not apply DDL remotely, do not change Ayambil versions1/2 and do not create a DB/user. Existing leads/schema/file references and target compatibility must be examined before migration/cutover. This route/schema change remains unapplied pending review approval/evidence.

## PocketBase inventory still awaiting replacement
Runtime SDK: apps/web/src/lib/pocketbaseClient.js; two lead callers above; apps/web/package.json pocketbase dependency.
Root package.json dev/start still starts PocketBase; apps/pocketbase package/hooks/migrations remain. Do not deploy current root commands as unified Express.
Historical tools/ayambil.integration.test.mjs, browser-preview/config and read-only legacy flow diagnostic reference PocketBase. Keep legacy fixtures outside deployed runtime after replacement; no deletion of hosted data or historical evidence.
PocketBase internal minute cron processes ayambil_messages; it must be paused/retired by a separately reviewed ownership handoff after preserving provider references and uncertain attempts. SQL queue has no startup worker; normal processing approval remains false by required operational policy, not independently verified masked hosted values.
No active frontend Supabase caller was found; Supabase files remain legacy test/operational evidence, not a deployed frontend dependency.

## Data-source migration — BLOCKED
No actual old store export or live target metadata available. Do not infer empty collections. Required private export: collection schema, leads, ayambil_admins/bookings/attendees/passes/audit/messages with hidden capability/idempotency/consent/provider fields and associated files; record aggregate counts only. Unknown populated collections/file fields fail closed in the offline preflight.
Need deterministic source-ID to UUID mapping, booking/pass number preservation, request/payload hashes, consent/terms provenance, stable capabilities and ledger, audit actor relationships, pass history/current uniqueness, encrypted queue payload preservation and provider references. Queued/attempted/uncertain messages must not automatically send on import. Existing SQL records must be compared for collision; no overwrite, dual-write or automatic migration.
PocketBase password hashes are not assumed scrypt-compatible. Migrated admins need disabled-account staging and secure private password re-enrolment tooling; no default account/password/hash. Actual importer and re-enrolment are NOT implemented yet; offline preflight is not an importer.

## Fresh results on integration checkout
- npm install --ignore-scripts --no-audit --no-fund exit0. Initial shell Node22.17 emitted engine warnings; all tests/builds explicitly use bundled Node24.19.
- npm run build --prefix apps/web exit0,2325 modules; full main site chunks including services/home/ParamVirChakra/privacy/terms/Ayambil. No production deployment.
- npm run test --prefix apps/api: final37pass/0fail/2engine skips (39tests,includes2offline-export tests),exit0.
- npm run test --prefix apps/web:34pass/0fail/0skip,exit0. Staging-mini-site tests intentionally not ported.
- npm run lint --prefix apps/web exit0.
- MySQL8.0.46 API suite BEFORE the two offline-preflight tests:36pass/0fail/1MariaDBskip. Separate HTTPS runner FAILED later with 'Cannot read properties of undefined (reading length)' after several journey checkpoints; not fixed or counted as passed. Owned server stopped. Do not substitute previous staging105 acceptance for current branch acceptance.
- MariaDB11.8.9 corrected runner (ignored tmp/run-mariadb.cjs using cwd=integration worktree):36pass/0fail/1MySQLskip,exit0 BEFORE offline-preflight additions. First external runner was hardcoded to original staging checkout and tested39pass there; that result does not count for this branch.
- PocketBase local legacy fixture:59checks,exit0 after creating ignored local runtime and specifying existing test binary. First attempt lacked runtime directory; corrected without changing assertions.
- Supabase/PGlite legacy suite:4pass/0fail,exit0 against main historical fixture; not proof of Express migration.
- Startup and full SPA/API no-store/auth tests included in API suite. No live WhatsApp request; providers mocked.
- Production install hook/Express root startup consolidation NOT RUN/NOT IMPLEMENTED. No staging build copied. Hosted schema compatibility and data migration BLOCKED.

## Rollback/cutover prerequisites
Keep existing database/user/assignment untouched. Verify versions1/2,15InnoDB tables/relations/grants read-only. Capture private PocketBase store/files and SQL backups, deployment revision, proxy and env inventory; verify restoration offline. Cutover cannot happen without old/new aggregate counts, relationships/capability checks and unambiguous queue ownership. Rollback must preserve new records, not restore an old DB over them. Stop writes/sends for approved cutover interval, no automatic worker.
Hostinger unified Node app would use complete normal build, apps/api/server.mjs, platform PORT, supported Node24 patch, same-origin APIs before SPA and CDN API/private exclusions. Current legacy lead stub503 prevents deploying this incomplete port. Required server-only names are existing DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD,AYAMBIL_SITE_ORIGIN,AYAMBIL_RATE_LIMIT_SECRET,PORT; queue names AYAMBIL_WHATSAPP_ENABLED,AYAMBIL_QUEUE_ENCRYPTION_KEY,AYAMBIL_FLOW_TEMPLATE_MAPPINGS,VARDHMAN_FLOW_BASE_URL/API_KEY/API_SECRET/CHANNEL_ID and disabled normal approval. Exclude temporary staging approvals, enrollment IDs and recipient overrides from final production wiring; standalone test routes remain to be retired in this incomplete port.

Release status: full frontend build/API port PASS locally; full PocketBase runtime removal FAIL/incomplete; old-record migration BLOCKED; lead compatibility/schema replacement BLOCKED by approval review; HTTPS FAIL; production cutover BLOCKED. No hosted writes, migration/bootstrap, sends or environment changes occurred. Original staging changes remain untouched.
## Approved local-only lead implementation — 12 October 2026
This section supersedes the earlier rejection/unapplied-lead status only. The operator explicitly approved small local lead changes; each new router, SQL proposal and caller/wiring step passed automatic review. No rejected patch was bypassed. No commit/push/deployment/hosted data change.

Implemented files:
- apps/api/leads.mjs: POST-only public lead router, bound name/email/company/message validation, unknown/private fields rejected, exact Origin, shared socket-derived rate bucket5, 16KB JSON body limit, no-store, safe errors, parameterized INSERT. No raw SQL/PII/error logging. Missing schema/persistence fails503.
- apps/api/app.mjs: mounts only /api/leads and /hcgi/platform/api/collections/leads/records before API/legacy/SPA fallbacks. Other legacy routes retain previous behavior; no wholesale retirement.
- apps/api/server.mjs: initializes both routers without awaited work, closes them until initialization passes. No migration execution or startup send.
- apps/api/migrations/003_website_data.sql: reviewed proposal for vcs_leads and vcs_imports only, InnoDB/utf8mb4_unicode_ci, no seed data/admin/gates and no changes to Ayambil versions1/2. NOT EXECUTED, including in engine tests. Partial-DDL recovery requires definition inspection; never blindly rerun or drop existing tables.
- apps/web/src/lib/leadClient.js and the two LeadCaptureSection/ComingSoonPage callers: same-origin POST /api/leads, JSON success validation, cookies/no-store/timeout, sanitized transport failures; success/reset/toast behavior retained. Raw error logging removed.
- apps/api/tests/leads.test.mjs and apps/web/tests/leads.test.js: local endpoint/client compatibility and protections.

Contract evidence: old source submits exactly name,email,company,message via SDK collection('leads').create and ignores the returned record. Tests use the existing PocketBase SDK to create through the Express legacy alias, verifying request persistence arguments and successful record-shaped response with id,collectionName,name,email,company,message,created,updated. New route returns201 {id,created:true}; alias returns200 record. SQL UUIDs differ from PocketBase identifiers, and actual old collectionId/hidden schema/live response could not be retrieved; do NOT claim full PocketBase CRUD/metadata compatibility or live verification. Exact-origin restriction is intentional hardening. Arbitrary authenticated collections/list/update/upload endpoints are NOT supported by this alias. No active references to these two components were found in the main router/HomePage, so production build need not contain their currently unreachable code; the source callers are replaced without inventing new routes. Browser submission wiring is covered by client mocks/source integration assertions, not an actual rendered lead-form browser test.

Fresh final matrix (Node24.19):
- npm run test --prefix apps/api: exit0,39pass/0fail/2intentional engine skips (41total).
- npm run test --prefix apps/web: exit0,35pass/0fail/0skip.
- npm run lint --prefix apps/web: exit0.
- npm run build --prefix apps/web: exit0,2325modules, full main website.
- node tmp/run-mariadb.cjs: exit0, real MariaDB11.8.9 on owned local schema,40pass/0fail/1MySQLskip. Corrected cwd ensures this integration checkout tested, not staging.
- node tmp/run-mysql.cjs: final exit0, real MySQL8.0.46 API40pass/0fail/1MariaDBskip plus105HTTPS assertions. Passed twice after diagnostic instrumentation, latest serialized post-build run schema ayambil_test_1791803367561_https / evidence C:/Users/aagam/AppData/Local/AyambilMySQLTestRuntime/https_1791803378153. Owned processes stopped.
- node --test tools/ayambil.supabase.test.mjs: exit0,4pass/0fail/0skip, disposable PGlite, provider mocked.
- node tools/ayambil.integration.test.mjs with existing local test binary: exit0,59PocketBase fixture checks, provider mocked.
- git diff --check: exit0.
All lead INSERT persistence is mocked. No vcs migration was applied to a database. Engine coverage above concerns existing Ayambil SQL, not new lead-table DDL execution. No live provider calls.

HTTPS investigation: prior run failed after some checkpoints with undefined.length. Ignored copied harness now guards booking-list HTTP status and items array before length access, and captures only existing allowlisted bookings stage/code/errno/SQLSTATE; never raw error/SQL/parameters or private payloads. No assertion removed or weakened. Both guarded runs passed105. Prior root cause is NOT established; cannot label a proven defect fix. Remaining unexplained historical failure is an operations review item; production cutover stays blocked. Temporary diagnostics/harness outputs remain ignored and outside runtime source. Root install-hook/startup consolidation remains outside this scoped approval; startup behavior exercised through existing API/HTTPS tests, no production deploy.

Existing database/user/assignment and records untouched; no hosted import/bootstrap/migration/flags/messages. Pending: actual old-record/schema/file audit, idempotent importer/admin re-enrolment, single queue ownership, full PocketBase retirement, backup/rollback, supported production routing/CDN and private-pass cache exclusions, deployed acceptance. Existing PocketBase SDK/runtime code retained as before where not covered by this approval. No production-ready claim.

## Feature branch delivery — 12 October 2026 (supersedes earlier local-only status)
Root start/dev now run Express, workspace list excludes PocketBase, frontend SDK/client/auth injection removed from active source; SDK retained only as root devDependency for historical regressions. No PocketBase fallback. Full main router/assets/sitemap/Updhan preserved. Historical hooks/migrations/tools remain evidence, not root startup dependencies. Other legacy paths fail closed rather than fabricate their functionality. Existing hosted PocketBase data is untouched and out of scope for this code delivery; retiring its independently running worker remains an operator cutover prerequisite.

Legacy exact64 alphanumeric pass keys now accepted by store.download with identical SHA256/expiry/revocation/pass-attendee-booking active checks. Engine fixtures verify mixed case, wrong case/length/characters, revocation and normalization-equivalent idempotent retry. Active Express hash serialization unchanged so existing SQL retries are preserved. Legacy PB serialization/import hash preservation, source crosswalk, distinct consent_at, provider_history and persistent imported-job holds remain NOT IMPLEMENTED; no archive/import has been fabricated. Migration-readiness capability hex-only blocker is now resolved in local runtime only; other mapping gaps remain.

Exact-booking staging endpoint removed from integration app. Standalone test recipient wiring restricted to exact temporary staging origin plus staging build. No automatic worker, migration or send. Approval flags unchanged; hosted settings not accessed.

Node24.19 commands: npm run test --prefix apps/api (44pass0fail2intentional engine skips); npm run test --prefix apps/web (35pass0fail); npm run lint --prefix apps/web (exit0); npm run build --prefix apps/web (exit0,2325modules); node tmp/run-mysql.cjs (45pass0fail1Maria skip, MySQL8.0.46 + HTTPS105assertions); node tmp/run-mariadb.cjs (45pass0fail1MySQLskip,MariaDB11.8.9). Providers mocked. Real loopback disposable ayambil_test_* schemas, owned data directories, random ephemeral ports and schema-only grants; hosted u531246927_vcs never used. Migration001/002 only in owned fixtures;003 not executed. New capability fixture initially violated unique pass_id, corrected to replace/restore one synthetic fixture key, no schema weakening. One removed staging endpoint auth expectation updated to require404; remaining endpoints retain401.
Install: npm install --ignore-scripts --no-audit --no-fund exit0 under explicit Node24 (initial npm wrapper usedNode22warned; repeated explicit node npm-cli verified). No automatic install/build/migration hook introduced. Existing build startup/static/JSON/cache/auth regressions pass. Engine runners are ignored copies of existing local operator harnesses using installed official binaries; corrected cwd uses this checkout. HTTPS initializes001and002 on its fresh owned schema, guard asserts list response status/items without weakening assertions.

Read-only staging smoke 2026-10-12T11:48–11:51Z: homepage and both evening form pages render; images loaded, CSS2/script1 observed, consoleerrorcount0. Admin route renders management root; no login/submission/mutation attempted. GET health200JSONreadytrue/no-store; status200JSONreadytrue/opentrue/configured/no-store; unauthenticatedbookings401JSON/no-store; unknownAPI404JSON/no-store; homepage200HTML publicmax-age0. Temporary staging frontend observed, NOT integration revision. Complete public route/asset coverage only tested locally, not live. Private capability download not requested live.
Production smoke BLOCKED by saved browser permission denying vardhmancreativestudio.com; no alternate access attempted. Live network-wide status/content/cache/console assurance and exact deployment SHA remain unverified. Feature branch push does not deploy. No main change, merge, PR, hosted writes, flags, queue processing or sends.

Cutover NO-GO:003 lead table proposal unapplied (lead writes fail503 if absent); target metadata/old data compatibility, separate worker retirement, production routing/proxy/clientIP/CDN rules/backuprollback unverified. Legacy records are out of scope for this delivery, not claimed migrated or safe to abandon. Root Express runtime requires configured server env and platformPORT, explicit full frontend build; Node24. Existing settings keys documented above, no defaults/secrets. Do not deploy automatically.

### Final regression resolution (supersedes initial matrix above)
The intermittent HTTPS failure was reproduced with overlapping page1 reads. Safe diagnostic proved LOCAL_POOL_QUEUE_LIMIT at bookings.hydrate (installed mysql2 constant Queue limit reached). Fifty parallel booking hydration chains per request saturated queueLimit50/connectionLimit5. store.list now hydrates in ordered batches of5; SQL/search/filters/pagination/auth unchanged. New real-engine regression seeds55 synthetic bookings through store.register in owned disposable schemas and reads two full pages concurrently, preserving idempotency/lifecycle tests. Safe diagnostic sentinel test added, no message/SQL/PII logging. Acceptance harness explicitly overlaps two page1 requests; all105assertions then passed. Final API45pass0fail2skips; realMySQL46pass0fail1MariaSkip; realMaria46pass0fail1MySQLskip; frontend35pass0fail; lint/build0exit. gitdiffcheck0exit. Final MySQL schema ayambil_test_1791806132877, HTTPSsuffix, Maria schema ayambil_test_mariadb_1791806145060. Owned servers stopped; no hosted data touched. Prior failed runs retained as evidence, not counted passing.
