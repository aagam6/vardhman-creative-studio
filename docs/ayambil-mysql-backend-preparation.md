# Ayambil MySQL backend preparation — 11 October 2026

## Readiness and scope

Ready for isolated testing, not production deployment. No live database connection, schema application, seed, deployment, commit, push, environment change or messaging occurred. Local Ayambil frontend now uses same-origin Express; the deployed production frontend was not changed. Supabase and PocketBase sources remain available; the new server never silently falls back to either database.

Branch inspected: `codex/ayambil-hostinger-deploy`. Existing App.jsx, sitemap, Updhan and blank-screen remediation changes were preserved. Git emitted an existing fsmonitor IPC warning; status and diffs remained readable.

## Verified hosting settings and proposed entry point

Read-only Hostinger build-settings inspection returned Node 22, `app_type: other`, `output_directory: dist/apps/web`, `build_script: build`, null root directory and null entry file. This confirms the stored configuration, **not** that incoming traffic reaches Express. No settings were changed.

Proposed single entry: `apps/api/server.mjs`, repository root as working directory. Build: `npm run build --prefix apps/web`; assets: `dist/apps/web`; start: `node apps/api/server.mjs`. The existing root start command still starts PocketBase and must not be used for this server. Select the supported Express/Node server application mode and entry-file setting only during separately approved deployment. Confirm its exact hPanel option and platform-provided PORT with Hostinger first; do not invent a proxy or .htaccess rule. Server requires PORT and listens on 0.0.0.0. Default local Node is 22.17.0; final tests/build used the bundled Node 24.19.0, satisfying Node >=22.22. Hostinger runtime compatibility still needs approval and confirmation.

## Files introduced/changed

* `apps/api/package.json`: Express/MySQL dependencies, start/test scripts and runtime requirement.
* `apps/api/config.mjs`: required server-only environment validation, authoritative existing programme snapshots and shared registration validation.
* `apps/api/security.mjs`: scrypt password hashing, random capabilities, SHA-256 stored hashes and HMAC rate-limit identities.
* `apps/api/store.mjs`: parameterized SQL, transaction helper, registrations, admin sessions, searches and pass lifecycle.
* `apps/api/app.mjs`: JSON routes, authentication, CSRF/origin checks, no-store headers and static SPA serving after API handlers.
* `apps/api/server.mjs`: startup readiness, bounded pool, platform PORT and shutdown; no automatic migration.
* `apps/api/migrations/001_ayambil.sql`: versioned MySQL schema with InnoDB/utf8mb4, foreign keys, unique keys and attendee ordinal CHECK.
* `apps/api/tools/bootstrap.mjs`: explicit operator-only first administrator and approved evening snapshot provisioning; password via stdin, no default credentials.
* `apps/api/tests/api.test.mjs`: real cryptography and HTTP routing with a mock store, validation and mock transactions.
* `apps/api/tests/schema.test.mjs`: static SQL assertions, not proof of successful DDL execution.
* `apps/api/tests/mysql.test.mjs`: opt-in disposable local MySQL integration suite.
* `package-lock.json`: API workspace and dependency graph; removed dev-only flags where packages are now runtime dependencies. No unrelated dependency replacement.
* This document: setup, evidence and remaining blockers.

## Server environment

Required: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, AYAMBIL_SITE_ORIGIN (exact HTTPS origin), AYAMBIL_RATE_LIMIT_SECRET (random server secret, at least 32 characters), PORT. Obtain actual DB host/port/name/user from hPanel; no connection destination is hardcoded. Pool maximum five, bounded queue, UTF-8 and parameterized queries. Never use VITE variables for these values.

Keep AYAMBIL_REGISTRATION_OPEN=false and AYAMBIL_WHATSAPP_ENABLED=false. Registration additionally requires the database gate; both default closed. WhatsApp enablement fails startup and retry route rejects requests. There is no sending worker.

Only an approved bootstrap uses AYAMBIL_BOOTSTRAP_APPROVED=true and AYAMBIL_INITIAL_ADMIN_EMAIL. Supply password through a secure stdin mechanism; never a command argument, chat, file committed to Git or log. Bootstrap requires no existing administrator and transactionally inserts the reviewed programme snapshots and hashed administrator. It was not run.

## API and compatibility

Canonical namespace `/api/ayambil`: GET health/status; POST register/pass-download; POST admin/login/logout/change; GET admin/session/bookings. WhatsApp retry is explicitly disabled. Search, date/status filtering and pagination support the existing paginated frontend CSV export model; no new file-export endpoint is introduced.

Unknown `/api` paths return JSON, never the SPA. Private/admin/error responses carry Cache-Control: no-store. Hostinger CDN behavior still requires independent acceptance testing; application headers alone do not prove edge cache exclusion.

Sessions have secure HttpOnly SameSite=Strict host cookies, eight-hour expiry, enabled-administrator checks on every operation, and session-bound CSRF proof for mutations. Login returns CSRF proof; the frontend preserves it in memory. Exact-origin authenticated POST admin/session restores fresh proof after reload without extending expiry. GET admin/session confirms login independently. Restoration rotates proof, so another open admin tab may need reload before mutations. No plaintext administrator password is stored.

Registration allows only one evening and one/two attendees, enforces existing explicit consents and terms, uses unique hashed idempotency keys and transactional locking. Retry with changed payload is rejected. Successful retries return existing saved passes; raw private links cannot be recovered from hashes and are returned only when issued. The UI adapter must not promise repeated retrieval of the original private link.

Private links are random 256-bit capabilities stored only as hashes, expire after seven days, and return one attendee's saved pass. Active booking/attendee/pass state is mandatory. Reissue revokes old links and supersedes old passes. Cancellation denies access; authorized restoration retains the old link only until its original expiry, matching retained PocketBase behavior. Saved session snapshots preserve PDF data shape and event association. PDFs use the existing html-to-image/jsPDF stack with a custom 90 × 200 mm single portrait page. No new PDF library or QR system.

## Deployment blockers and separate approval steps

1. Confirm actual database engine/version: this DDL requires **MySQL 8.0.16+**, not an unverified MariaDB compatibility claim. Run the disposable local integration suite before applying live DDL.
2. Confirm managed Node server routing and entry-file support. Preserve unrelated legacy `/hcgi/platform` lead operations: the proposed server currently returns explicit JSON 503 there instead of guessing an upstream. An approved platform route or deliberate existing-lead adapter is required before whole-site activation.
3. Validate the implemented Ayambil frontend adapter with real isolated MySQL: canonical paths, cookie credentials, login/session/CSRF handling, mutation fields and returned private links. Local frontend adapter is implemented and tested with mock transports. Real Express/MySQL end-to-end acceptance and hosted validation remain required. No silent fallback.
4. Verify trusted proxy topology before enabling proxy trust. Current socket-IP rate limiting does not trust spoofable X-Forwarded-For; behind a shared proxy all visitors may share a bucket. Add reviewed proxy-hop configuration and integration tests before public use. Plan periodic cleanup of expired sessions/rate-limit rows through approved maintenance.
5. Back up database and deployed frontend/config, review SQL and database permissions, apply migration manually after explicit approval. MySQL DDL implicitly commits: inspect partial failures, do not blindly rerun or assume transactional rollback. Version stamp is last. Do not use destructive automatic down migration.
6. Provision approved snapshots and first administrator with the explicit bootstrap; keep both registration gates closed. Confirm administrator identity and use a unique strong password.
7. Configure server-only secrets and entry point only after deployment approval. Verify HTTPS cookies, JSON health, authentication denials, one-attendee private access, expiry/cancellation/reissue, no shared caching, existing website/lead routes and frontend contracts in isolated staging.
8. Any old-registration import needs separately reviewed mapping and reconciliation of pass snapshots, revisions and audits. Do not import plaintext old capabilities; plan secure replacement delivery without enabling messages automatically.

Rollback: retain old artifacts and configuration, close registrations, restore the reviewed previous frontend/backend routing after approval; preserve new MySQL data for reconciliation rather than dropping tables. Old PocketBase private links and data are not automatically interchangeable with MySQL. Never roll back by silently selecting another backend.

## Previous backend preparation checks (historical baseline)

| Command | Observed result |
| --- | --- |
| npm install --workspace apps/api --ignore-scripts | Added dependencies; engine warnings on local Node22.17. Installed Express5.3.0/mysql2 3.24.5. |
| npm run test --prefix apps/api | 7 passed, 1 skipped. HTTP tests use mock store; transactions use mock connection; password hashing real. Real MySQL suite skipped. First sandbox HTTP attempt failed fetch; approved rerun passed. |
| npm run test --prefix apps/web | 23 passed, including non-JSON API rejection and pass contracts. |
| npm run lint --prefix apps/web | Exit0. Frontend scope only. |
| npm run build --prefix apps/web | Exit0; dist/apps/web produced, including preserved Updhan changes. |
| node tools/ayambil.integration.test.mjs | 59 real isolated PocketBase checks passed; provider transport mocked. |
| node tools/ayambil.supabase.test.mjs | 49 local PostgreSQL/PGlite/Edge assertions passed; provider calls mocked, hosted runtime/concurrent sessions unverified. |

No mysql/mysqld/docker command was available for disposable integration. The real MySQL suite requires AYAMBIL_DISPOSABLE_MYSQL_TEST=true, localhost/127.0.0.1 and an empty DB_NAME beginning ayambil_test_; it refuses other hosts/schema names and retains its synthetic local schema for inspection. Run `npm run test --prefix apps/api` with those isolated settings only. It covers schema execution, concurrent idempotency, transaction rollback, admin authentication, filters, cancellation/restoration/reissue and expiry. These checks have **not** passed against MySQL yet.

At the baseline stage hosted MySQL, hosted Supabase, browser UI/PDF/native printing, CDN caching, server PORT injection and actual hPanel Express routing were not tested. The current phase below supersedes local browser/PDF results only. No visual or production readiness claim is made. Production setup requires the named conditions above and separate explicit approval.

## Current phase: Express frontend integration and long pass — 11 October 2026

This section supersedes the baseline frontend/PDF state. Chosen architecture: React/Vite frontend + same-origin Express API + MySQL. Source HEAD and merge-base with local origin/main are ad53ae63a329b26d176572908de7ba0271ee11e6 on codex/ayambil-hostinger-deploy. No remote fetch or deployment was performed; this is local-ref evidence. No staged files were present.

### Changes in this phase

| File | Purpose |
| --- | --- |
| apps/web/src/lib/ayambilExpressClient.js | Canonical Express fetch transport, same-origin cookies, no-store requests, timeout, JSON/shape validation, verified login/session restoration/logout, in-memory CSRF and booking/pass association checks. |
| apps/web/src/lib/ayambilRegistration.js | Replace Ayambil PocketBase SDK/client with Express adapter; retain shared config, request keys and CSV utility. |
| apps/web/src/pages/AyambilAdminPage.jsx | Login/session/logout integration, validated lists/export, mutations and private reissue fragment link. |
| apps/web/src/components/AyambilRegistration.jsx | Existing idempotent form now calls Express through adapter; show newly issued per-attendee private fragment links when supplied. Retries retain saved passes without fabricating links. |
| apps/web/src/pages/AyambilPassDownloadPage.jsx | Preserve earlier loading/error/empty/JSON fixes; handle subsequent private hash navigation without retaining another pass. |
| apps/api/app.mjs | Authenticated exact-origin POST admin/session restores CSRF; protected GET confirms session. No proxy-trust changes. |
| apps/api/store.mjs | Rotate stored CSRF hash without extending session expiry; enabled admin/cookie authorization still required. |
| apps/api/tests/api.test.mjs | Mock-store HTTP tests for session restoration success and anonymous denial. |
| apps/web/tests/ayambilExpressClient.test.js | Mock transport contract tests for two evenings, 1/2 attendees, retries, filters, mutations, private download, verified auth, errors and custom page layout. |
| apps/web/src/lib/ayambilPassLayout.js | Shared 90×200 mm page dimensions, margin/capture settings, geometry and excessive-length rejection. |
| apps/web/src/components/AyambilDigitalPass.jsx | Existing raster/Gujarati PDF flow now creates custom portrait page; compressed PNG; Print uses same prepared PDF in an iframe. |
| apps/web/src/components/AyambilDigitalPass.css | Narrow cream/maroon/gold design, compact bilingual credits/numbered terms and stable PDF capture. |
| apps/web/src/components/AyambilRegistration.css | Remove old 720px/A4 capture sizes and set custom page print CSS. |
| apps/web/src/lib/ayambilPassPresentation.js | Shorter bilingual versions of the same eight rules; duplicate privacy paragraph removed from component. No new policy. |
| apps/web/public/.htaccess | Remove only explicit X-Powered-By Hostinger Horizons branding directive. SPA/static caching rules retained. |
| tools/ayambil-ui-preview.config.mjs | Loopback-only Express-namespace synthetic fixtures; registration closed, no database/provider; two synthetic private passes. |
| tools/ayambil-long-pass-check.mjs | Headless local UI/PDF/download/print-call verification harness; external network blocked. |
| docs/ayambil-mysql-backend-preparation.md | Authoritative technical report updated instead of contradictory replacement. |
| docs/AYAMBIL-HANDOFF.md | Concise first-read handoff linking this detailed report. |

The lead client was not edited. PocketBase SDK remains in unrelated website functionality and retained regression tests; programme config is still imported from the existing authoritative JSON under apps/pocketbase, without calling PocketBase. Supabase/PocketBase source and rollback resources remain. No Ayambil runtime fallback remains.

All HTTP failures show useful unavailable/sign-in/private-link errors. A resolved login promise alone is insufficient: authenticated=true plus a non-empty 64-hex CSRF proof and an independently confirmed backend session are required. Mutation responses and list pagination are validated before rendering/export. Private URLs use fragments rather than query strings, are removed from the pass page address after receipt, and are not sent as URL request paths. Failed sign-out is reported rather than pretending the server session was revoked.

### Current test evidence

All final checks used bundled Node 24.19.0 by prepending its bin directory to PATH. Default system node --version was v22.17.0; results must not be attributed to Node22.22 or the hosted runtime.

| Exact command | Observed result / scope |
| --- | --- |
| npm run test --prefix apps/api | 7 passed, 1 skipped. Real HTTP with mock store; mocked SQL transaction helper; real scrypt. Disposable real MySQL suite remains skipped. |
| npm run test --prefix apps/web | 28 passed. Includes five new adapter/layout tests; frontend transport is mocked, not real MySQL. |
| npm run lint --prefix apps/web | Exit0, frontend scope. |
| npm run build --prefix apps/web | Exit0, dist/apps/web; retained unrelated Updhan source included unchanged. |
| node tools/ayambil.integration.test.mjs | 59 isolated real PocketBase checks passed, provider transport mocked; rollback regression only. |
| node tools/ayambil.supabase.test.mjs | 49 local PGlite/PostgreSQL/Edge assertions passed; provider mocked, hosted state and multi-session concurrency unverified; rollback regression only. |
| node tools/ayambil-long-pass-check.mjs | Passed using AYAMBIL_PLAYWRIGHT_MODULE for the bundled Playwright module and AYAMBIL_CHROME_PATH for installed Chrome, against loopback 3005 only. Two synthetic passes at 320,360,390,430,768,1024,1366,1920px; no horizontal overflow or page runtime errors. |
| Poppler pdfinfo.exe, both generated PDFs | One page each; 255.118×566.929 points = 90×200 mm. |
| Poppler pdftoppm.exe -scale-to 1600 -png -singlefile, both PDFs | Rendered and actually inspected. Gujarati glyphs, synthetic long name, programme/date/venue, credits, numbered bilingual rules and page boundaries visible without clipping/overlap; no QR. |

Actual Download buttons produced manan-download.pdf (420,518 bytes) and sairam-download.pdf (416,771 bytes). Generated/printed artifacts and screenshots are ignored under .ayambil-runtime/long-pass, not staged. Both print buttons reached an instrumented PDF-frame print() call. Native print dialog and physical printing **not verified**. The PDF's smallest supporting text is compact; actual-size printer readability remains a manual acceptance check. Device drivers must support 90×200 mm and actual-size output; do not fit onto A4 and call that custom printing.

The first visual attempt rejected the old oversized capture safely. CSS overrides were corrected and bilingual rules shortened; the final script passed. An intermediate harness navigation attempt failed because reload intentionally loses a cleared private fragment; corrected by using a fresh document per evening. No failures were relabeled as successful. The in-app browser tool itself failed initialization (kernel assets path unavailable); local headless Chrome supplied the observed browser evidence.

Extremely long valid names or future expanded credits can exceed the readable-fit threshold; PDF generation returns a friendly error instead of silently clipping or shrinking indefinitely. Final synthetic name exercised wrapping but not every maximum-length name. A maximum-input corpus and actual-size print acceptance remain recommended. Raster PDF preserves Gujarati appearances; selectable/searchable PDF text is not provided by the retained stack.

### Remaining priorities and release conditions

1. Run the opt-in disposable MySQL suite on empty localhost ayambil_test_* with MySQL8.0.16+; validate actual DDL, concurrency, locking, rollback, session restoration and lifecycle. No local mysql/mysqld/docker executable was available. No live Hostinger DB connection was attempted.
2. Test the actual frontend against that Express/MySQL instance over local HTTPS for Secure cookies. Mock transport and synthetic UI tests do not prove real database/authentication end-to-end behavior. Verify revoked/expired/cancelled/missing links using real isolated records.
3. Confirm persistent Hostinger Express runtime, entry apps/api/server.mjs, platform PORT, Node>=22.22 and same-origin API routing before approval. Current stored entry was null at previous read-only inspection.
4. Resolve preserved legacy lead routing before whole-site activation. Confirm supported CDN/API exclusions: retained Apache static configuration still has public default caching/SPA fallback. Do not rely on it to run the API or assume Express no-store survives edge/Apache configuration. Never deploy this frontend alone onto the old static routing.
5. Validate proxy trust/rate-limit topology without guessing; current socket-IP bucket may be shared behind the platform proxy. Plan secure expired-row maintenance.
6. Review maximum-name/pass-content fit, manual native PDF print and actual-size readability. Confirm source spelling separately for ambiguous religious/family names; no names changed in this phase.
7. Obtain separate schema/bootstrap/deployment/data-import approval after backup and rollback review. Both registration gates stay closed and WhatsApp stays disabled.

Next recommended task: provision a disposable LOCAL MySQL8 test database, run the protected real MySQL suite, then run frontend-to-Express session and registration lifecycle acceptance over local HTTPS with synthetic identities. Resolve evidence-based failures before requesting any Hostinger deployment approval.

No live MySQL access, migration, administrator provisioning, production data changes, hPanel/environment/DNS/cache changes, proxy rewrites, registration activation, WhatsApp messages, Git staging/commit/push/merge or deployment occurred. Existing App.jsx/sitemap/Updhan and prior remediation edits remain. Final diff review detected the pre-existing sitemap EOF whitespace and fsmonitor warning; those unrelated changes were left alone.

## Local MySQL / HTTPS acceptance prerequisite check — 11 October 2026

**Blocked before execution.** The requested compatible local MySQL or already-installed container runtime could not be found. Following the instruction to stop at that prerequisite, no mocked checks were substituted and no test suite was rerun. The earlier pass counts and PDF inspections remain historical evidence only.

Read both handoff/preparation reports and `apps/api/tests/mysql.test.mjs` before inspection. Confirmed branch `codex/ayambil-hostinger-deploy`; staged diff empty; existing unstaged/untracked implementation, Updhan, App.jsx, sitemap and remediation files preserved.

### Commands and actual observations

* `git status --short`, `git branch --show-current`, `git diff --cached --stat`, `git diff --stat`: branch confirmed, no staged files, existing changes present. Existing fsmonitor IPC warning remains.
* `node --version`: v22.17.0. Bundled executable `C:/Users/aagam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe --version`: v24.19.0. No test was run under either runtime in this attempt.
* `Get-Command mysql,mysqld,docker,podman,nerdctl`: none available. `Get-Command wsl`: Windows launcher exists; `wsl --list --quiet` reports **Windows Subsystem for Linux is not installed**. No installation was performed.
* `Get-Service` filtered for mysql/maria/docker/podman: initial sandbox inspection could not access Service Control Manager. An approved read-only unsandboxed retry succeeded with no matching services. No service was started/stopped/changed.
* `Test-Path` checks returned false for C:/Program Files/MySQL, C:/Program Files/Docker/Docker/resources/bin/docker.exe, C:/Program Files/RedHat/Podman/podman.exe, C:/xampp/mysql/bin/mysqld.exe, C:/laragon/bin/mysql and C:/Program Files/MariaDB.
* `Get-Process` for mysqld/mariadbd/docker/Docker Desktop/podman found no matching processes. The combined inspection command exited 1 because optional process names were absent; this is discovery evidence, not a failed integration suite.

Actual MySQL engine/version: **not available, not verified**. No database connection, disposable schema, credentials or opt-in test environment variables were created. Reviewed existing safeguards require localhost/127.0.0.1, ayambil_test_* and an empty schema; they were not relaxed. The suite currently verifies an 8.x version string; checking the precise >=8.0.16 patch requirement remains necessary when a runtime is supplied. The suite internally enables its isolated store/database gate to exercise synthetic creation; the separately launched HTTPS acceptance server must remain closed and messaging-disabled as requested. No gates were changed here.

| Requested command/check | Result in this attempt |
| --- | --- |
| npm run test --prefix apps/api, real MySQL opt-in | Not run: runtime prerequisite blocked. No current pass/fail/skip counts; prior real MySQL test was skipped. |
| Frontend-to-real-Express/MySQL over HTTPS | Not run: depends on real database acceptance. Secure cookies unchanged. |
| npm run test --prefix apps/web | Not rerun: stopped at prerequisite. |
| npm run lint --prefix apps/web | Not rerun: stopped at prerequisite. |
| npm run build --prefix apps/web | Not rerun: stopped at prerequisite. |
| node tools/ayambil.integration.test.mjs | Not rerun; no PocketBase connection attempted. |
| node tools/ayambil.supabase.test.mjs | Not rerun; no Supabase connection attempted. |
| node tools/ayambil-long-pass-check.mjs | Not rerun; no newly generated PDF/screenshots or maximum-name acceptance. |

Only `docs/ayambil-mysql-backend-preparation.md` and `docs/AYAMBIL-HANDOFF.md` were edited in this attempt to document the blocker. No application/test/migration source change was needed or made.

Next task: obtain explicit permission for a local MySQL installation/system-service configuration, or have the operator supply a compatible already-installed LOCAL MySQL8 runtime. Verify precise engine/version and isolated empty ayambil_test_* schema before running the protected suite. Then perform local HTTPS real frontend/API acceptance, maximum-name PDF/error-state tests and fresh regressions. Do not use Hostinger credentials/database as an alternative.

Remaining release blockers are unchanged: real MySQL correctness/concurrency, real HTTPS frontend/session lifecycle, maximum-content/physical printing, persistent Hostinger Express runtime/entry/PORT/compatible Node, preserved lead routing, verified proxy trust/rate limits and actual CDN API no-store behavior. Classification remains prepared for isolated testing, **acceptance blocked and production not approved**.

No software installed, system service modified, production database/data/settings accessed, Git history/staging changed, registration activated, WhatsApp enabled/message sent, commit/push/merge/deploy performed.

## Expanded Windows runtime discovery — 11 October 2026

Repeated discovery beyond PATH before concluding installation is required. No usable local engine was found. Actual MySQL version remains unknown; `npm run test --prefix apps/api` was **not executed** (no new pass/fail/skip counts). HTTPS acceptance was not begun. Prior successful checks remain historical evidence.

Read-only commands/evidence:

* `Get-Command` mysql, mysqld, docker, podman and nerdctl: all absent.
* `Get-ChildItem -Directory` on existing C:/Program Files, C:/Program Files (x86), C:/ProgramData and common C:/D: tools/XAMPP/Laragon roots, filtered for MySQL/MariaDB/container distributions: no matching installation directories found.
* `Get-ItemProperty` on HKLM native/WOW6432Node and HKCU Windows Uninstall records, selecting only matching DisplayName/DisplayVersion/InstallLocation for MySQL/MariaDB/Docker/Podman/Rancher: no matches. No credentials or unrelated program records printed.
* Approved read-only `Get-CimInstance Win32_Service`, filtered by matching names/display names: **0 services**. No service change.
* `Get-Process`, filtered for mysqld/mariadbd/docker/podman/Docker Desktop/Rancher Desktop: **0 processes**.
* `Test-Path`: false for Program Files MySQL (both architectures), Docker, RedHat/Podman, user Local/Programs/MySQL and Podman, Local/rancher-desktop, Scoop mysql/docker, C:/wamp64/bin/mysql, C:/xampp/mysql/bin, D:/xampp/mysql/bin and D:/laragon/bin/mysql. This is targeted discovery, not an exhaustive disk/private-database scan.
* Bundled Node executable `--version`: **v24.19.0**. `Test-Path node_modules/mysql2/promise.js`: **true**. Existing integration guard was reread; localhost/name/empty-schema restrictions unchanged.
* Git branch/status/staged diff: `codex/ayambil-hostinger-deploy`, existing changes preserved, staged diff empty. Existing fsmonitor warning remains.

Smallest no-additional-cost option: after explicit software-download/extraction approval, use the official MySQL Community Server Windows **noinstall ZIP** as an isolated user-directory runtime, with its own data directory, loopback-only binding and a verified available port. Run it as a temporary process rather than registering a Windows service. This avoids Docker/WSL installation; it is still installing/extracting executable software and was **not done**. It generally need not require administrator permission for a writable user directory/process; missing Visual C++ runtime prerequisites or local security restrictions may require separate administrator action. Verify prerequisites and exact supported MySQL8 version before use. Official references: [ZIP installation](https://dev.mysql.com/doc/refman/8.0/en/windows-install-archive.html), [console startup](https://dev.mysql.com/doc/refman/8.0/en/windows-server-first-start.html).

Precise next approval/action: approve downloading and extracting official MySQL8 Community ZIP into an ignored local runtime directory, initializing only a new disposable data directory, starting only a loopback-bound temporary process (no service/firewall/PATH changes), and creating a schema-limited synthetic test user and empty ayambil_test_* schema. Alternatively, the operator may supply the path to an existing compatible LOCAL engine and securely provision that isolated schema/user. Do not provide production credentials. Once guards/version are verified, run the real suite with process-only test settings; only after it passes start the separate local HTTPS frontend acceptance task.

Only the two existing reports were edited during this discovery phase. No installation/download of executable software, DB connection/schema/seed, live backend access, application changes, production settings, registration/WhatsApp activation or Git mutation/deployment occurred. Release status: **ready for isolated testing only; prerequisite and production approval blocked**.

## Authorized official ZIP setup attempt — 11 October 2026

User authorized local ZIP provisioning and real database tests only. Branch/status and empty staged diff were inspected before and after; all existing application and Updhan changes were preserved.

Prerequisites: read-only Windows service discovery found zero matching MySQL/MariaDB/container services; mysql/mysqld/docker commands and mysqld process were absent. Visual C++ x64 runtime registry reports Installed=1, version v14.50.35719.00; vcruntime140.dll and msvcp140.dll exist in System32. Bundled Node executable reports v24.19.0; mysql2 dependency exists. This confirms available prerequisites only, not successful MySQL execution.

Official https://dev.mysql.com/downloads/mysql/8.0.html listed Windows x64 noinstall ZIP **mysql-8.0.46-winx64.zip**, release **8.0.46**, with published MD5 **003f527d5df61b663ff191038cd676bd**. Official ZIP instructions were read. No third-party mirror used.

Executed setup commands: `New-Item -ItemType Directory` for `C:\Users\aagam\AppData\Local\AyambilMySQLTestRuntime`, then `Invoke-WebRequest -Uri https://dev.mysql.com/get/Downloads/MySQL-8.0/mysql-8.0.46-winx64.zip -OutFile <runtime>/mysql-8.0.46-winx64.zip`. The request failed with Oracle Technical Difficulties HTML; the ZIP was not created. The command exited 1. Subsequent `Get-FileHash -Algorithm MD5` could not read the missing file. Its final checksum-mismatch exception was misleading: **no actual checksum was computed and no archive mismatch was established**. Extraction was not reached. The official download link independently resolves to cdn.mysql.com, but the web tool could not fetch that binary; no alternate binary was obtained or executed.

Final read-only directory/process check: runtime directory exists and is empty; no mysqld process found. The combined discovery command exited 1 because the optional process lookup had no match, not because a database suite failed. No temporary server needed shutdown. No data directory, schema, local user or credentials were created.

`npm run test --prefix apps/api`: **not run** in this attempt. Real MySQL tests executed=0; pass/fail/skip counts are unavailable because the runner was not invoked. Mock HTTP/store, mock transaction and static schema tests were also not rerun. Prior 7-pass/1-skip API results remain historical, not current acceptance. Local HTTPS acceptance was not begun.

Next action: obtain the exact official Windows x64 ZIP through the official download page (or retry its verified official CDN destination in a separate setup attempt), verify its MD5 against the publisher value before execution, then finish isolated loopback provisioning and run the guarded suite on an empty ayambil_test_* schema. Recheck the published release/checksum if selecting a different file. Stop on verification failure. Only after real MySQL passes proceed to the separate local HTTPS frontend/session/CSRF/private-pass acceptance phase.

Only this report and AYAMBIL-HANDOFF.md changed in this attempt. No production connection/data/settings, Git staging/history, deployment, registration activation, WhatsApp sending, Windows service, global PATH or firewall change. **Ready for isolated testing only; real MySQL acceptance and production release remain blocked.**

## Exact official CDN retry — 11 October 2026

Reinspected handoff, technical report, Git status/branch and empty staged diff; preserved all existing work. Reread localhost/ayambil_test_*/empty-schema opt-in guards in apps/api/tests/mysql.test.mjs.

Official page independently reconfirmed mysql-8.0.46-winx64.zip, 236.5M and MD5 003f527d5df61b663ff191038cd676bd. `Invoke-WebRequest -Uri https://cdn.mysql.com//Downloads/MySQL-8.0/mysql-8.0.46-winx64.zip -OutFile <runtime>/mysql-8.0.46-winx64.zip -PassThru` succeeded with HTTP200, 248009349 bytes. First bytes 50-4B-03-04 (ZIP PK signature). `Get-FileHash -Algorithm MD5` returned the exact publisher checksum. Expand-Archive succeeded. `mysqld.exe --no-defaults --version` reports MySQL Community Server 8.0.46 for Win64 x86_64. Runtime: C:/Users/aagam/AppData/Local/AyambilMySQLTestRuntime/mysql-8.0.46-winx64.

An external runtime helper run-tests.cjs (no stored credential values; generated credentials held in process memory) initialized fresh data_1791705777366 with --initialize-insecure, then started a temporary server with --skip-networking --enable-named-pipe and MySQL X disabled. Initial account provisioning was attempted via client stdin over the local named pipe, with a schema-limited synthetic user. No TCP/public listener was started. The helper failed in its shutdown check: `Owned server still running`. It checks exitCode but does not correctly distinguish signal termination; exact provisioning completion was not independently verified. Subsequent `Get-CimInstance Win32_Process -Filter "name='mysqld.exe'"` returned zero processes. No server remains running. Data and helper remain outside Git; no test-output log was generated.

The real suite was NOT invoked; executed real MySQL tests=0, current pass/fail/skip counts unavailable. Mocks/static checks not rerun. Runtime/archive prerequisite is resolved, but isolated schema/user provisioning and integration acceptance are not verified. Stop at setup failure as requested. Next task: correct the external helper's owned-process lifecycle/shutdown verification (including signalCode and graceful shutdown), create a NEW data directory/empty ayambil_test_* schema, verify MySQL version via SQL and limited grants, then run npm run test --prefix apps/api with process-only opt-in settings. Do not reuse a possibly populated schema or relax test guards. Only after real tests pass begin separate HTTPS frontend acceptance.

Changed repository files: only docs/ayambil-mysql-backend-preparation.md and docs/AYAMBIL-HANDOFF.md. No production connection/settings, application source, staging/history, deployment, Windows service/PATH/firewall, public registration or WhatsApp changes. Ready for isolated testing only; production remains blocked.

## Real MySQL acceptance and lifecycle repair — 11 October 2026

Reinspected branch codex/ayambil-hostinger-deploy, status, empty staged diff, both reports, mysql.test.mjs and external helper. Bundled Node24.19.0 used. No archive re-download: previously publisher-MD5-verified MySQL8.0.46 runtime reused.

External C:/Users/aagam/AppData/Local/AyambilMySQLTestRuntime/run-tests.cjs now distinguishes exitCode and signalCode, tracks its exact child PID, waits for readiness with a bounded timeout, uses SQL SHUTDOWN, and waits for actual termination. It does not stop arbitrary MySQL processes. Initialization occurs in a new directory each attempt; network-disabled named-pipe provisioning secures root before TCP startup. Generated passwords remain in memory, SQL goes through client stdin, and no values are stored in helper/report/log. MySQL X disabled. No Windows service, global PATH, firewall or system setting change.

Two preliminary attempts discovered incorrect bundled npm paths (MODULE_NOT_FOUND; runner did not execute). Correct invocation uses bundled node.exe with C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js run test --prefix apps/api; only child-process PATH points to Node24. This executes the requested npm run test --prefix apps/api script.

First genuine suite: MySQL SQL version8.0.46; schema ayambil_test_1791706221798; port49817. Result 8 tests, 7 pass, 1 fail, 0 skipped. Failure at mysql.test.mjs:42 CREATE TRIGGER rollback injection: ER_BINLOG_CREATE_ROUTINE_NEED_SUPER / errno1419. Earlier real DDL, registration concurrency/auth/filter/private-pass assertions reached successfully, but rollback/logout acceptance was incomplete in that run. No application defect or missing ordinary TRIGGER privilege was established. Default binary logging adds administrative requirements for trigger creation.

Resolution: add --skip-log-bin ONLY to this disposable local server invocation, avoiding SUPER or trust-function changes and retaining schema-limited grants. No production setting, migration or test assertion changed. Created another brand-new directory/schema for rerun.

Successful final run:
- SQL SELECT VERSION(): **8.0.46**, compatible with >=8.0.16.
- Data directory: C:/Users/aagam/AppData/Local/AyambilMySQLTestRuntime/data_1791706242906.
- Schema: ayambil_test_1791706242906, confirmed empty using SHOW TABLES before suite.
- TCP endpoint: **127.0.0.1:49834**, port selected by loopback socket availability check; bind-address127.0.0.1, MySQL X off, binary logging off.
- Separate synthetic user at 127.0.0.1 successfully connected. SHOW GRANTS checked for no ALL PRIVILEGES or GRANT OPTION; provisioned schema-only SELECT,INSERT,UPDATE,DELETE,CREATE,ALTER,INDEX,REFERENCES,TRIGGER, plus default global USAGE. No global administrative grant.
- AYAMBIL_DISPOSABLE_MYSQL_TEST=true and local DB variables passed only to npm child process. Local/name/empty-schema guards unchanged.
- **npm run test --prefix apps/api: 8 passed, 0 failed, 0 skipped, 0 cancelled; exit0.**

Breakdown: real MySQL integration1 passed (not skipped); mock-store HTTP1 passed; mocked transaction1 passed; static schema1 passed; configuration, payload validation, real scrypt, snapshot validation4 passed. The real single test executed migration DDL/relational/index/unique definitions, concurrent same-key registration4 requests yielding one booking, two-attendee receipt, reject3, changed-payload conflict, attendee-specific download, missing key, invalid/good admin login/session, search/date/status/page filters, cancellation/restoration, reissue old-key revocation, expiry, trigger-induced actual rollback, logout/session rejection. It does not constitute exhaustive direct negative tests for every FK/index/constraint, nor browser/hosted acceptance. No frontend/lint/build/PDF or retained-backend checks rerun in this task.

Shutdown: named-pipe provisioning PID12908 exited0/signalnull; TCP suite PID8920 gracefully exited0/signalnull after SQL SHUTDOWN. Final Get-CimInstance Win32_Process filtered mysqld returned no processes. Runtime, synthetic data directories and suite_1791706242906.log retained outside repository. Earlier attempt directories/logs preserved, not reused or deleted.

Only repository changes in this task: docs/ayambil-mysql-backend-preparation.md and docs/AYAMBIL-HANDOFF.md. External helper changed outside Git. No application/migration/assertion changes. Existing unrelated work preserved; no staging/commit/push/merge/deploy, production connection/data/settings, real admin, public registration or WhatsApp activation. The suite temporarily opens only its isolated store/database gate for synthetic records; no public server or production gate changed.

Next separate task: local HTTPS frontend-to-real-Express/MySQL acceptance with synthetic identities, Secure cookies, login/session restoration, CSRF, closed registration handling plus isolated registration lifecycle, idempotency/conflicts, filters/export and attendee-specific missing/expired/cancelled/superseded links. Create fresh isolated setup or safely provision a dedicated acceptance schema; do not reuse uncertain earlier data. Do not begin production deployment. Hostinger persistent Express/entry/PORT/compatible Node, lead routing, proxy trust/rate limits and CDN no-store remain unverified blockers; native printing remains manual. Classification: **ready for isolated HTTPS acceptance testing only; production blocked**.

## Local HTTPS frontend / Express / real MySQL acceptance — 11 October 2026

Current branch codex/ayambil-hostinger-deploy; pre/post status and staged/unstaged summaries inspected, staged diff empty. Existing Updhan, App.jsx, sitemap and remediation changes preserved. All commands used bundled Node **v24.19.0** via process-only PATH; no claim of Node22.22 verification.

Actual final isolated environment: verified MySQL **8.0.46** queried over SQL, fresh data directory C:/Users/aagam/AppData/Local/AyambilMySQLTestRuntime/data_1791707015676. Real regression schema ayambil_test_1791707015676 and separately created empty acceptance schema ayambil_test_1791707015676_https; loopback MySQL port64536. Restricted synthetic user granted only schema-level SELECT,INSERT,UPDATE,DELETE,CREATE,ALTER,INDEX,REFERENCES,TRIGGER; no ALL/GRANT OPTION or global administrative privilege. Reviewed migration and event snapshots applied only locally. Synthetic administrator hashed using real scrypt. Credentials generated in memory; never recorded. MySQL X and binary logging disabled only in disposable server. No remote backend contacted.

HTTPS setup: test-only two-day certificate generated using installed Git OpenSSL3.2.4, SAN127.0.0.1. Chrome trusts only this certificate's SPKI using --ignore-certificate-errors-spki-list, not blanket ignoreHTTPSErrors/TLS bypass. No OS trust-store changes. A loopback HTTPS proxy forwards to the actual **apps/api/server.mjs** process, serving built **dist/apps/web**. Both proxy and Express bound127.0.0.1. Express cookies remain Secure/HttpOnly/SameSiteStrict. Origin is the exact local HTTPS endpoint; no spoofed forwarding headers introduced or trusted. Source retains trust proxy=false and rate buckets use req.socket.remoteAddress. This verifies a specific test browser exception, not an OS-trusted certificate/production TLS chain.

Final browser acceptance **75 assertions passed**, no page runtime exceptions. Actual UI: invalid login stays signed out, correct login confirms backend session, cookie attributes verified, reload restores session without extending SQL expiry; Manan registration form filled/reviewed/confirmed through real Express/MySQL, receipt private links shown, admin list and CSV download, real pass download and instrumented print. Additional same-origin browser fetch assertions exercise CSRF missing/invalid denial, JSON404 unknownAPI, identical retry without duplicate/private-link fabrication, changed-payload409, missing terms400, second evening/two attendees, reject3, missing consent400, date/status filters, empty page2, cancellation404, restoration, reissue old-key404, one intended attendee only, expiry404, malformed/missing key404, disabled admin401, closed registration403 and logout401. JSON/no-store asserted on 29 browser API calls spanning auth/admin/private/error endpoints. No request routed to PocketBase/Supabase; browser network restricted to loopback and built client uses canonical namespace.

Coverage limits: the second evening/two-attendee registration used browser fetch rather than a second full form interaction. Browser pagination verified empty page2, not >50 populated records. HTML/empty-login refusal is covered by frontend mock transport tests, not an injected HTML response in the final HTTPS run. Spoofed X-Forwarded-For resistance is source/mock-regression evidence, not a measured adversarial proxy topology test. Certificate pinning is test-harness-specific. Real native print dialog, physical printer and Hostinger edge/cache remain unverified. Do not describe these as passed hosted checks.

PDF: both final real API-issued variants downloaded and pypdf inspected: **1 page each, exactly90x200mm**. Poppler renders of real-flow Manan and Sairam variants visually inspected: Gujarati glyphs, long bilingual name, selected evening/venue, separate credits and bilingual terms readable, no clipping/overlap/extra page/QR. Final paths: external https_1791707023308/actual-pass.pdf and sairam-pass.pdf. Native printing not performed; instrumented iframe PDF print call passed. Eight widths320,360,390,430,768,1024,1366,1920 had no horizontal overflow for the actual Manan pass. Both fixture variants also passed all eight widths.

Maximum content: actual registration accepted a120-character synthetic name, browser PDF generator safely rejected excessive height rather than emitting unreadable output, and showed its error. Confirmed UX defect: suggested Print despite Print using the same generator. Corrected download/print errors to explain excessive content and authorised organiser correction; final browser rerun verified new download guidance. Print-specific excessive-content message is source reviewed, not separately clicked for that oversized pass. All ordinary pass content/layout unchanged.

Fresh commands/results:
| Command | Current result |
| --- | --- |
| npm run test --prefix apps/api | 8passed/0failed/0skipped; real MySQL1, mock HTTP1, mock transaction1, static SQL1, four config/validation/crypto/snapshot tests. Repeated on new schemas with each acceptance retry; final exit0. |
| npm run test --prefix apps/web | 28passed/0failed/0skipped; rerun after message fix. |
| npm run lint --prefix apps/web | exit0; rerun after message fix. |
| npm run build --prefix apps/web | first sandbox attempt EPERM realpath main.jsx; approved outside-sandbox retry passed; final after-fix build passed,2327 modules, dist/apps/web. |
| node tools/ayambil.integration.test.mjs | first sandbox startup failed; approved isolated retry59real PocketBase checks passed with mocked provider, not MySQL evidence. |
| node tools/ayambil.supabase.test.mjs | 4tests passed,49PGlite/PostgreSQL/Edge assertions; provider HTTP mocked, no hosted deployment verification. |
| node tools/ayambil-long-pass-check.mjs | passed both synthetic fixture variants,8widths,PDF generation/download/instrumented print. External artifact directory; loopback3017 because3005 already occupied. Not real backend evidence. |
| External run-tests.cjs + https-acceptance.cjs | final75browser assertions passed against actual HTTPS built frontend/Express/MySQL. Earlier retries stopped safely for incorrect selectors (text input type and main landing page lacks form); corrected harness to actual /manan-sanghvi route. No app bug from these selector failures. |

Runtime commands: bundled node.exe launches installed npm-cli.js run test --prefix apps/api; protected opt-in and local DB values passed only to child. MySQL initialise --no-defaults --initialize-insecure in newdirectory, secure named-pipe provisioning, then --bind-address=127.0.0.1 --mysqlx=OFF --skip-log-bin with verified availableport. OpenSSL req -x509 -newkey rsa:2048 -nodes -days2 -subj /CN=127.0.0.1 -addext subjectAltName=IP:127.0.0.1 creates only external test cert/key. Fixture command node node_modules/vite/bin/vite.js --config tools/ayambil-ui-preview.config.mjs --port3017. Long-pass command used AYAMBIL_PLAYWRIGHT_MODULE bundled module, AYAMBIL_CHROME_PATH installed Chrome, AYAMBIL_PREVIEW_ORIGIN=http://127.0.0.1:3017, AYAMBIL_ARTIFACT_DIRECTORY external fixture-long-pass. All artifacts/helper scripts/certificates/logs outside tracked source; no credential values in reports.

Changes this task: apps/api/server.mjs optional validated AYAMBIL_LISTEN_HOST (127.0.0.1 or existing default0.0.0.0) enables safe local binding; apps/web/src/components/AyambilDigitalPass.jsx corrects excessive-content guidance; tools/ayambil-long-pass-check.mjs accepts external artifact directory and validated loopback preview origin while preserving defaults; both authoritative reports updated. External helpers updated only outside Git. No other application source changed; no dependencies/migrations modified.

Cleanup: final named-pipe PID16644 exited0; ExpressPID36524 stopped and termination confirmed; MySQLPID2720 SQL SHUTDOWN exited0. HTTPS proxy/browser closed. Fixture3017 stopped via owned session; final listener check empty. Final process inventory confirms no mysqld or final owned PIDs remain. Final acceptance and regression database registration gates explicitly restoredFALSE; WhatsApp always disabled. Earlier stopped historical synthetic directories retained and not reused. No public endpoint/process/production gate was opened; no real messages sent.

Next task: finish targeted isolated gaps (second full form UI, populated pagination, browser HTML-failure injection, adversarial forwarding-header/rate-limit check and print-size error button) if required for release acceptance, then obtain verified Hostinger persistent Express runtime/entry/PORT/Node>=22.22, supported same-origin route, legacy lead routing, proxy trust topology and CDN no-store evidence. No production migration/bootstrap/deployment approved. Native/physical printing manual. **Ready for isolated testing / controlled-release preparation; not production-ready or approved for deployment.** No Hostinger/DNS/settings/data, live credentials, Git stage/commit/push/merge/deploy or public registration/WhatsApp state changed.

## Targeted local acceptance gaps A–E closed — 11 October 2026

Branch codex/ayambil-hostinger-deploy confirmed; status and staged/unstaged summaries reviewed before/after. Staged diff remained empty. All unrelated work preserved. Earlier results above remain historical; current evidence below supersedes the five-gap list.

Fresh SQL engine **MySQL8.0.46**, bundled **Node24.19.0**. New runtime data directory C:/Users/aagam/AppData/Local/AyambilMySQLTestRuntime/data_1791707453923; regression schema ayambil_test_1791707453923 and separate acceptance schema ayambil_test_1791707453923_https; MySQL bound127.0.0.1:49322. Both schemas created fresh, migrations only local, schema-restricted synthetic user and in-memory credentials. Actual apps/api/server.mjs and built dist/apps/web used over loopback HTTPS with prior test-only certificate-specific Chrome SPKI trust. Cookies/origin/CSRF unchanged. No remote backend or production systems used.

| Targeted gap | Status | Newly observed evidence |
| --- | --- | --- |
| A: second-evening rendered form | **Passed** | Navigated /500-akhand-ayambil-vijayollas/sairam-dave, selected2attendees, filled actual inputs, accepted terms/consent, reviewed and confirmed. HTTP200 receipt has2distinct private links; rendered confirmation shows2links; both attendee date/performer associations match3November/Sairam. Second capability returns only its intended attendee. No direct register fetch used for this booking. |
| B: populated pagination | **Passed** | 55additional one-attendee bookings created through real validated transactional store in disposable schema (not bypassing public rate limit). Total58bookings/59attendees. Page1=50/hasMoretrue; page2=8/hasMorefalse; page3empty; pages disjoint. Actual Next/Previous buttons show expected article counts. UI unfiltered CSV includes59attendee rows plus header. Search/date/status filters match27active second-evening synthetic bookings; filtered UI CSV27rows plus header. Gate closed immediately after seeding. |
| C: unexpected HTTP200HTML | **Passed** | Scoped Playwright response injection into actual built frontend transport for admin login, session restore, bookings and private download. Login displays sign-in failure/no signed-in state; restore displays restore error/no signed-in state; bookings displays load error/no booking articles; private download displays unavailable alert/no pass. Four scenarios, no page runtime exceptions. These injected responses are deliberately synthetic, not real backend responses or hosted evidence. |
| D: forwarding headers / rate limit | **Passed** | Six real loopback API login requests with six differing RFC5737X-Forwarded-For values received401,401,401,401,401,429. SQL showed exactly1bucket/6attempts. Responses no-store. Only local test rate rows cleared before/after for deterministic isolation. trust proxy remainsfalse; no production topology inferred. Added focused mocked-rate-store HTTP regression for the same socket-identity invariant. |
| E: excessive-content UI | **Passed** | Actual120-character synthetic attendee registered; Download safely refuses unreadable PDF and displays authorised-correction guidance. Actual Print clicked on same pass, displays print-specific excessive-content/correction guidance; no print iframe created. Does not suggest the rejected content can print successfully. No application change required in this task. |

Final external harness result: **105browser/HTTP assertions passed**, 0reported failures; all5gap outcomes passed in sanitized external gap-results.json. First attempt failed only at exact-label selector for filter select; corrected harness to existing .ay-admin-filters selects, reran entire suite using new data/schema. Partial initial results not counted as final passing acceptance. Gate/process cleanup ran for both attempts.

Fresh checks and exact commands:
- Process-only PATH selects bundled node.exe v24.19.0. `npm run test --prefix apps/web`: **28passed/0failed/0skipped**; `npm run lint --prefix apps/web`: **exit0**; `npm run build --prefix apps/web`: **exit0**,2327modules, outputdist/apps/web. Commands ran together under approved local execution; no source/dependency change in frontend.
- External `node.exe C:/Users/aagam/AppData/Local/AyambilMySQLTestRuntime/run-tests.cjs` invokes installed npm-cli.js `run test --prefix apps/api` with local process-only opt-in settings, then actual HTTPS harness plus targeted-gaps.cjs. Final API: **9passed/0failed/0skipped/0cancelled**, exit0. Breakdown real MySQL1; mock-store HTTP2 (including added forwarding-header test); mocked transaction1; static schema1; other config/validation/crypto/snapshot4. SQL migration/concurrency/rollback/auth/lifecycle genuinely executed, not skipped.
- Retained PocketBase/Supabase suites NOT run in this task, respecting no connection to those backends. Earlier results historical. Existing fixture long-pass harness NOT rerun; real-flow PDF/download/readability portions were rerun by HTTPS harness, no fresh physical-dimension/render inspection claimed in this gap task.

Only repository changes this task: apps/api/tests/api.test.mjs adds focused untrusted-XFF/login bucket HTTP regression with mocked rate persistence; docs/ayambil-mysql-backend-preparation.md and docs/AYAMBIL-HANDOFF.md update evidence/nextstep. Production application code, dependencies, migrations and security checks unchanged. External run-tests.cjs/https-acceptance.cjs/targeted-gaps.cjs and generated outputs stay outside Git. Output directory: C:/Users/aagam/AppData/Local/AyambilMySQLTestRuntime/https_1791707461282; includes sanitized gap-results.json and synthetic CSV/PDF artifacts. suite_1791707453923.log stores API test outcomes without credentials/capabilities. No credentials, sessions/private links or synthetic attendee details printed in reports.

Cleanup verified: provisioningPID21168 exited0; final ExpressPID5208 terminated; MySQLPID38320 SQL SHUTDOWN exited0. Browser/HTTPS proxy closed. Final Windows process inventory found none of these PIDs and no mysqld. Acceptance and regression gates explicitly restoredFALSE, messaging alwaysdisabled. Historical external data directories retained, never reused; no public listener or production registration activation. No Windows services/firewall/PATH/system-trust change.

Five targeted local gaps: **all passed; none remain open**. Native print dialog/physical printer stillmanual; certificate test exception and local origin no-store do not prove production TLS/CDN behavior. Production remains blocked on verified Hostinger persistent Express process, entryfile/PORT/Node>=22.22, supported same-originAPI routing, preserved lead backend routing, real proxy/client-IP/rate-limit topology, and CDN cache bypass for auth/admin/private/errors. Exact next task: read-only Hostinger deployment-readiness/configuration verification and an explicit reviewed production rollout/rollback proposal; no deployment/migration/bootstrap/Git publication authorised. Release classification: **local acceptance complete; ready for controlled-release review, production deployment not approved**.

## Hostinger deployment readiness and conditional rollout proposal — 11 October 2026

This is a fresh read-only configuration audit, not a deployment or a test rerun. Branch `codex/ayambil-hostinger-deploy`, HEAD `ad53ae63a329b26d176572908de7ba0271ee11e6`; staged diff empty. Existing tracked and untracked Ayambil/Updhan changes preserved. Only these two handoff reports changed during this audit. Earlier local acceptance counts remain historical.

### Fresh evidence and prerequisite decisions

Connected Hostinger read operations: `hosting_websites_list(domain)`, `hosting_orders_list(order_ids)`, `hosting_nodejs_build-settings(username,domain)`, `hosting_nodejs_list-builds(username,domain,per_page:2)`, and `hosting_nodejs_build-logs(username,domain,uuid)`. No mutation operation executed. Build logs were inspected without printing their raw contents or environment values. Operation schemas for Express settings/restart were read, not invoked. No live database, credentials, environment values, attendee records or private endpoints were read.

| Requirement | Decision | Evidence / exact missing evidence |
| --- | --- | --- |
| Existing hosting plan/site type | Confirmed | Active Business plan; enabled website classified `nodejs`, `horizons_uuid:null`. Classification does not prove a running Express process. |
| Current application settings | Confirmed | Node major22; `app_type:other`; `root_directory:null`; `entry_file:null`; `build_script:build`; `output_directory:dist/apps/web`; npm. No start command returned. |
| Persistent Express entry | Blocked | Current settings do not select Express/entry. Connector schema supports Express and an entry file, but site-specific `.mjs` support, restart/supervision and launch command remain unverified. Root `npm start` launches PocketBase, not Express. Do not activate this root start command for the migration. |
| Working directory and runtime files | Unverified | Schema permits repository root. Operator must confirm root package/workspace installation, retained mysql2/Express dependencies, shared web/PocketBase JSON source files and `dist/apps/web` paths in runtime deployment. Backend-only upload is insufficient. |
| Node patch and PORT | Unverified | Platform schema offers majors18/20/22/24, not patch versions. Obtain actual runtime `node --version` and confirm numeric injected PORT, listener interface and `.mjs` entry support. Source requires Node>=22.22.0 and numeric PORT1–65535, default bind0.0.0.0; do not guess a fixed port. Historical acceptance used24.19.0, not hosted22. |
| Latest completed deployment | Confirmed | Latest build created2026-10-11T06:34:01Z, completed06:34:39Z; GitHub main commit `83d9c3f427a2f61a0b41572b2e420ae53d01d265`. Logs show Vite build, no affirmative server-start evidence or exact runtime patch. Local HEAD differs; reconcile deployed main and local changes before any future publication. |
| Same-origin API/TLS/cookies | Unverified | Source mounts `/api/ayambil` before static/SPA, JSON404 for unknown `/api`, no-store and Secure/HttpOnly/Strict cookies. Public managed routing to this entry and TLS termination have not been verified. Need Settings & Redeploy plus actual generated routing inspection/support confirmation; no speculative Apache proxy. |
| Legacy lead preservation | Blocked | `pocketbaseClient.js` uses `/hcgi/platform`; LeadCaptureSection and ComingSoonPage create `leads`. Express currently returns503 for that namespace. Actual lead backend origin/process and a supported route preceding Express must be confirmed. Do not deploy whole-site Express with this permanent lead outage. No production lead submission tested. |
| Client IP / rate limiting | Unverified | `trust proxy:false`, socket-address buckets; local spoof tests historical. Shared platform proxy could aggregate all clients into one login bucket. Need documented proxy address ranges/hops, header overwrite behavior and direct-origin reachability before any trust change. No guessed hop or user-controlled XFF trust. |
| CDN API exclusion | Blocked pending verification | App no-store is correct locally, but public `.htaccess` still sets blanket public seven-day shared caching and SPA fallback. Whether this file affects managed Express/generated routing is unknown. Require effective edge headers/cache behavior for the entire namespace, including errors/private downloads, before activation. |
| Hostinger MySQL engine/grants | Unverified | No live SQL access performed. Operator must supply sanitized engine/version (MySQL>=8.0.16, not assumed MariaDB), schema privilege capability including TRIGGER and binary-log restrictions, connection limit/charset. Connector guidance says deployed Node connects locally via127.0.0.1:3306; verify assigned database context with operator before configuring server-only variables. |
| Long pass / branding | Confirmed from source and historical evidence | Layout90×200mm, one-page PDFs previously visually verified with Gujarati/credits/terms. Express disables X-Powered-By and repository Horizons directive removed. Host-injected headers not verified removed. Native dialog/physical printing unverified. |
| Functional rollback | Unverified | Retained source is not an operational backup. Previous API routing returned HTML; reverting frontend does not prove PocketBase registration works. Need verified previous runtime/configuration and an independently recoverable frontend artifact. |

### Official documentation and limitations

[Hostinger Node deployment guide](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/) describes Business/Cloud Express support, Settings & Redeploy and runtime Restart for server applications. It describes managed build directories and two retained successful versions; this is not proof of this site's file layout or a verified one-click rollback. Manual file edits may be overwritten. No additional hosting purchase is presently demonstrated necessary; existing plan generally supports Express. Available staging capacity and this monorepo's compatibility remain unverified.

[Hostinger CDN behavior](https://www.hostinger.com/support/how-hostinger-cdn-caching-works/) documents no-store/private exclusion and `x-hcdn-cache-status`, including HIT/Age and stale responses. Do not assume custom admin cookies get the WordPress-specific bypass. After separately approved staging configuration, repeat safe requests and check no-store with DYNAMIC/BYPASS, no shared HIT/STALE and no cross-session response reuse. Cover auth/session/admin/private, unknown routes, denials and server errors; use synthetic staging data only. Preserve hashed asset caching. Source blanket cache rules need a reviewed resolution based on actual managed routing, not speculative `.htaccess` changes. No purge/cache changes performed.

### Exact operator/support evidence needed next

In Websites → vardhmancreativestudio.com → Node.js dashboard → Settings & Redeploy, provide sanitized current/available framework, root, entry, build/output and launch settings without saving. Confirm Express entry `apps/api/server.mjs`, repository root workspace installation/runtime dependencies and numeric PORT/bind behavior with support. Obtain exact running patch version, process supervision/restart/log locations and supported restore procedure. File Manager inspection should confirm generated routing order and deployment file layout without editing files.

Ask support how existing `/hcgi/platform/api/collections/leads/*` reaches its backend and how that route can remain intact with Express; provide backend existence/origin mapping without credentials. Ask for trusted proxy/client-IP contract and CDN exclusion guarantees for all `/api/ayambil/*` responses, including cached prior HTML and errors. Obtain sanitized MySQL version/privilege confirmation from the database dashboard/operator; this task does not authorize connecting to it. If same-origin routing or lead preservation is unsupported, stop for topology review; do not buy another service or silently choose Supabase/PocketBase fallback.

Session/rate-limit maintenance: source has logout deletion but no periodic expiry cleanup worker. Before rollout, review a bounded maintenance command for expired sessions and old rate buckets with indexed/batched deletion, conservative retention beyond active windows, least privileges and monitoring. Never delete active buckets to reset protection. Confirm an included supported scheduling mechanism (hPanel cron or managed process); no cron was created and no cleanup executed.

### Proposed sequence — actions require separate approval

1. Resolve support evidence above and reconcile latest deployed main with local work while preserving Updhan changes. Review precise artifact/entry/start configuration; no automatic publication.
2. Operator backs up current deployed files, runtime/routing configuration and securely held environment settings; assess whether any existing registration data exists without exporting it into Git. Record tested restore instructions and retain an independent backup beyond the platform's two versions.
3. Review SQL migration order, actual engine/grants and rollback compatibility. Keep DB_HOST/PORT/NAME/USER/PASSWORD, origin and rate secret server-only; no VITE secrets. No startup schema creation. Assess historical records/consents/snapshots/status mapping separately; do not import plaintext private capabilities or promise old links survive.
4. With separate approval, use an included staging site or restricted smoke-test deployment with isolated database and synthetic admin only. Verify complete workspace/runtime/static paths, numeric PORT, lead route and edge cache exclusions before public cutover. If no safe staging capability exists, obtain a reviewed limited maintenance-window proposal first.
5. Only after approval apply reviewed production schema manually, secure backup first; provision approved administrator separately. Registration and WhatsApp stay closed. Verify JSON health, denial cases, session/CSRF cookies, revoked admin, private expiry/cancel/reissue, no-store at edge and PDF download. Confirm unrelated leads through approved safe testing.
6. Manual print pre-release: actual-size90×200mm, supported custom paper/printer, Gujarati and longest supported name/terms, no scale-to-A4 or extra page. Native/physical output still not accepted automatically.
7. Separate go/no-go approval for cutover, then separate explicit registration activation; WhatsApp requires its own integration/template/retry review and approval. No activation is implied by deployment.

Rollback: first close registration/messaging and quiesce writes; preserve and back up new MySQL data for reconciliation, never drop tables. Restore reviewed frontend artifact plus exact routing/runtime/configuration as one unit; verify JSON/lead/static routes and cache boundaries. Do not silently fall back to old backends. If PocketBase service/routing is not independently restored and tested, rollback means informational website with registration closed, not a recovered booking service. Handle reissued capabilities/transactions created during rollout through approved reconciliation; do not regenerate or expose raw historical private links. Platform build retention alone does not cover schema/data/environment rollback.

### Commands, results and scope

Fresh local read checks: `git status --short`, `git diff --stat`, `git diff --cached --stat`, `git branch --show-current`, `git rev-parse HEAD`; repeated with `git -c core.fsmonitor=false` after IPC warnings. `Get-Content` read both reports, package/build/server/config/routing files; `rg` traced cache, proxy, PORT and lead callers. Windows glob-path searches failed and were corrected to directory searches; no source mutation resulted. Fresh Hostinger reads listed above succeeded. Official documentation retrieved read-only. No test/lint/build/MySQL/browser/PDF command rerun; no new pass counts claimed. No production endpoint/private data probes made.

Current decision: **local acceptance complete; ready for controlled-release review only; live deployment blocked and not approved**. Single next task: obtain the sanitized Hostinger runtime/routing/lead/proxy/cache/MySQL compatibility answers above, then review a concrete staging deployment configuration and rollback package before requesting deployment approval. No Git publication, live database, hPanel/env/DNS/cache/proxy, registration or WhatsApp change performed.

## MariaDB 11.8.9 static compatibility and lead readiness — 11 October 2026

User-supplied latest phpMyAdmin SQL evidence reports VERSION()=11.8.9-MariaDB-log and no tables displayed in the selected assigned database. Earlier Hostinger evidence reported MariaDB10.5: discrepancy unresolved, potentially different server/context/time. Latest supplied result is the current observation, not a guarantee of application assignment or future version. No connection/query/table inspection of that database performed; database identifier omitted here intentionally. Historical MySQL8.0.46 acceptance does not establish MariaDB compatibility.

Branch codex/ayambil-hostinger-deploy preserved; status, empty staged diff and unstaged summary inspected. Files read: apps/api/migrations/001_ayambil.sql, store.mjs, server.mjs, config.mjs, tests/mysql.test.mjs, tests/schema.test.mjs, tools/bootstrap.mjs, app.mjs; frontend pocketbaseClient and actual lead callers traced. No application edits.

Static findings (not real-engine acceptance):
- Migration uses InnoDB, explicit composite foreign keys, unique indexes and utf8mb4_unicode_ci; no MySQL-only utf8mb4_0900 collation. Ordinal CHECK1..2 plus UNIQUE(booking_id,ordinal) prevents a third slot when enforced, but SQL alone does not ensure at least one attendee; application transactions do. Verify CHECK and foreign_key_checks enabled with actual negative writes; static string assertions are insufficient.
- JSON snapshots are serialized and parsed by a helper accepting string or object. MariaDB JSON is LONGTEXT with validation, unlike MySQL binary JSON. This appears compatible with the helper, but actual mysql2 prepared-query decoding/invalid JSON rejection and Gujarati round-trip remain unverified. No JSON extraction functions or binary-JSON reliance found.
- Stored generated IF(status='superseded',NULL,attendee_id), UNIQUE(current_attendee) and nullable unique semantics need real DDL/reissue tests. STORED is documented as a MariaDB alias for PERSISTENT; support is not a passing application test.
- Store uses UTC_TIMESTAMP(3), DATE_ADD/DATE_SUB, COALESCE, IF, LOCATE, CONCAT, UPDATE JOIN, LIMIT/OFFSET and ON DUPLICATE KEY UPDATE with VALUES(). MariaDB documents the upsert/VALUES constructs. List SQL uses double-quoted string literals; ANSI_QUOTES mode would interpret them as identifiers. Actual sql_mode is unknown; record this conditional portability risk, not a confirmed hosted failure. Verify mode and test listing with supported configuration before deployment.
- Transactions acquire pooled connection, begin, commit or rollback, then release; idempotency insert/SELECT FOR UPDATE and booking locks serialize concurrent writes. No deadlock retry exists; concurrent behavior/isolation and error propagation require real MariaDB stress/retry tests. No pool session SQL initialization enforces constraint/sql_mode settings. timezone Z handles driver conversion; expiry SQL uses UTC explicitly.
- DDL is executed statement-by-statement outside store transactions; CREATE/ALTER/TRIGGER can implicitly commit. Partial migration must not be described as atomically rolled back. Fresh-schema test and reviewed operator recovery are required. Bootstrap uses DML transaction only and must not be executed on live data here.
- Existing real suite checks VERSION against /^8\./. MariaDB11.8.9 would be rejected BEFORE migration. Keep localhost/name/empty-schema protections; a separately reviewed engine-aware test or MariaDB suite must verify exact engine/version rather than deleting the version assertion. It currently covers migration, four concurrent identical requests, payload conflict, third-attendee API rejection, rollback via SIGNAL trigger, login/logout, filtering, cancellation/restoration/reissue and expiry. It does not directly assert every FK/CHECK/index, session expiry/disabled admin, or invalid JSON insertion: add focused genuine negative SQL/lifecycle assertions in the later isolated run. Trigger setup needs schema TRIGGER and possibly binary-log-related restrictions; grant no global SUPER to bypass it. Local test-specific logging configuration must not be projected onto Hostinger.

Official references consulted read-only: [JSON](https://mariadb.com/docs/server/reference/data-types/string-data-types/json), [generated columns](https://mariadb.com/docs/server/reference/sql-statements/data-definition/create/generated-columns), [constraints](https://mariadb.com/docs/server/reference/sql-statements/data-definition/constraint), [upsert](https://mariadb.com/docs/server/reference/sql-statements/data-manipulation/inserting-loading-data/insert-on-duplicate-key-update), [SQL mode](https://mariadb.com/docs/server/server-management/variables-and-modes/sql_mode), [implicit commits](https://mariadb.com/docs/server/reference/sql-statements/transactions/sql-statements-that-cause-an-implicit-commit). These support feature review, not assigned-engine acceptance.

Local discovery: Get-Command mariadb,mariadbd,mysql,mysqld found no command; matching Get-Process output empty; common Program Files/Program Files(x86), MariaDB/mysql/XAMPP/Laragon, user Programs/Scoop and retained MySQL runtime directories searched; no MariaDB installation identified. Installed-program registry query found no MariaDB entry. Get-Service failed: Cannot open Service Control Manager; Get-CimInstance Win32_Service failed: Access to a CIM resource was not available. Thus service absence is NOT confirmed. No verified usable MariaDB11.8.x engine available. Stop before installation; no binaries downloaded/extracted/executed, no services/system changes. Existing MySQL runtime is not substitute MariaDB acceptance.

Lead source: apps/web/src/lib/pocketbaseClient.js fixes base /hcgi/platform; LeadCaptureSection.jsx:50 and ComingSoonPage.jsx:41 call collection('leads').create, producing /hcgi/platform/api/collections/leads/records. apps/api/app.mjs:39 intercepts the entire namespace with JSON503 before SPA fallback. If managed traffic reaches Express, these submissions fail; this is confirmed source behavior, not a newly measured production outage.

Preservation choices: existing callers/retained PocketBase source are confirmed; Hostinger general Express support does not confirm split-path routing. A platform route to the verified existing lead backend before Express REQUIRES written support confirmation. An Express proxy to a verified upstream would REQUIRE reviewed code, auth/header/timeout/cache rules and isolated tests; no upstream is known, so no proxy invented. An intentional lead API migration would REQUIRE separate scope/data/privacy/contract approval and tests. None is currently safe to activate; no fallback or live routing change implemented.

Commands actually used: Get-Content reports/source, git -c core.fsmonitor=false status --short / diff --cached --stat / diff --stat / branch --show-current; rg -n lead/hcgi callers and rg --files apps/api; Get-Command, Get-Process, Get-Service, Get-CimInstance, Get-ChildItem common directories and installed-program registry with selected non-secret metadata. Some missing-directory discovery commands returned nonzero without findings; service queries permission-blocked. Official docs searched through web tool. No test runner invoked: current real MariaDB/mocked/static test counts N/A, not zero successful tests; lint/build not rerun because only documentation changed.

Decision: local MariaDB availability Unverified (none located; service inventory blocked); static review Confirmed as completed, compatibility Unverified; actual MariaDB integration Unverified/not run; lead preservation Unverified/blocked by confirmed503 handler; production activation Unverified/blocked. Single next safe action: approve a separate official, isolated local MariaDB11.8.x runtime setup and engine-specific guarded test preparation, with no production connection. Written Hostinger lead-route confirmation remains a parallel external prerequisite; no messages sent. Only these two reports changed. No Git staging/publication, production database/settings, registration or WhatsApp changes. Local readiness investigation only; production not ready.

Repeated-request recheck — 11 October 2026: git branch/status/staged summary and latest reports re-read; branch unchanged and staging empty. Get-Command mariadb,mariadbd still returned no executable. rg reconfirmed the MySQL8-only test assertion, generated column/collation definitions and legacy503 handler. No new runtime or hosting evidence supplied; prior full static review above remains current. No tests invoked (counts N/A), installation or production access. Next action and blockers unchanged; this note does not claim a new full integration run.

## Approved real MariaDB 11.8.9 acceptance — 11 October 2026

This supersedes local-runtime/static-only blockers, not historical MySQL results or Hostinger deployment blockers. Branch codex/ayambil-hostinger-deploy and empty staged diff inspected; unrelated work preserved. Production database was never contacted.

Preflight: C free35856855040bytes (>2GB); no matching database process/command found, no3306/3307 listener observed. Official HTTPS archive source: https://archive.mariadb.org/mariadb-11.8.9/winx64-packages/mariadb-11.8.9-winx64.zip ; publisher checksum from same directory sha256sums.txt. Initial sandbox DNS failed; approved network execution retrieved HTTP200. ZIP PK signature and SHA256 **830c46727d9278eae212ae3eca44eeb9e71b2a68704e95f344a64fba7b1963f5** matched before extraction/execution. No third-party mirror/MSI/TLS bypass. No existing trusted publisher-signature verifier established (gpg command unavailable); signature not verified, official HTTPS+published SHA256 verified. Runtime C:/Users/aagam/AppData/Local/AyambilMariaDBTestRuntime/mariadb-11.8.9-winx64. Binary and actual SQL version **11.8.9-MariaDB**; matches release but local binary lacks production's -log suffix.

External run-mariadb.cjs creates fresh data/schema on every attempt; initializer no service/default user/remote-root option; owned server uses --no-defaults, explicit basedir/datadir, bind127.0.0.1, available ephemeral port, --skip-log-bin only locally. Initialization root account secured immediately through local SQL; generated passwords remain memory-only, no CLI password or skip-grant-tables. Initial privilege safeguard found MariaDB default PUBLIC test/test_% grants; stopped before migration and both early owned servers exited0. Fresh subsequent setup revoked only those default grants in its new isolated server. SHOW GRANTS then verified USAGE plus dedicated schema SELECT,INSERT,UPDATE,DELETE,CREATE,ALTER,INDEX,REFERENCES,TRIGGER; no global privileges/GRANT OPTION. Empty schema verified before test migration.

Final acceptance schema **ayambil_test_mariadb_1791710538581**, loopback port60734, data root/data_1791710538581. SQL mode **IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION**; CHECK and FK checks verified enabled. Test also explicitly sets ANSI_QUOTES on a dedicated connection and verifies real store listing works after the portable-literal correction, restoring mode before release. New tests/mariadb.test.mjs has independent AYAMBIL_DISPOSABLE_MARIADB_TEST=true opt-in; rejects simultaneous MySQL opt-in; verifies local host, dedicated ayambil_test_mariadb_ prefix, explicit AYAMBIL_MARIADB_VERIFIED_PORT equality BEFORE connection, empty tables and MariaDB11.8.x version. MySQL test file/guard unchanged.

Confirmed fixes:
1. First genuine MariaDB migration failed errno1901 on generated current_attendee IF expression. Changed only attendee branch to RTRIM(attendee_id), avoiding mode-dependent character padding and preserving active-pass uniqueness/superseded NULL. Later full DDL/unique/reissue tests passed on BOTH engines. Reference: https://mariadb.com/docs/server/reference/sql-statements/data-definition/create/generated-columns . Existing unapplied migration source revised locally; no live schema altered. Future deployment review must account for any already-applied schema independently.
2. List SQL used double-quoted string literals, which ANSI_QUOTES interprets as identifiers (negative SELECT test observed). Replaced them with standard single-quoted literals, parameterization unchanged; actual store list now passes ANSI_QUOTES test and both engines' default mode.
3. Initial Gujarati test incorrectly assumed mysql2 returns JSON as text; actual return was object. Corrected test to accept object/string as application already does. No application JSON decoding change.

Real suite covers actual migration/InnoDB, generated column/index inspection, ordinal CHECK rejection, foreign-key and duplicate ordinal rejection, second active pass unique rejection, invalid JSON rejection, Gujarati mysql2 round-trip, default/ANSI_QUOTES listing, four concurrent identical registrations, changed-key payload conflict, transaction rollback using schema TRIGGER SIGNAL, one/two/three validation, closed gate, admin password/session/disabled-admin/expiry/logout, filters, cancellation/restoration/reissue, old-key denial and private expiry/intended-attendee isolation. Registration closes in test finally; WhatsApp stays disabled. No browser/frontend-to-MariaDB or new PDF/native-print acceptance claimed. Those are still separate coverage from historical MySQL HTTPS acceptance.

Fresh commands/outcomes, bundled Node **v24.19.0**:
- Official Invoke-WebRequest checksum/archive, Get-FileHash -Algorithm SHA256, PK read, Expand-Archive; binary --no-defaults --version and initializer --help: passed.
- node.exe external run-mariadb.cjs invokes npm-cli.js run test --prefix apps/api with process-only local variables: final **9passed/0failed/1skipped/0cancelled**,10tests. Breakdown realMariaDB1pass, realMySQL1intentional skip; mocked HTTP2pass, mocked transaction1pass, static schema1pass, other config/validation/crypto/snapshot4pass. Earlier migration run8pass/1fail/1skip and test-decoding run8pass/1fail/1skip retained as historical failed attempts; not counted as final acceptance.
- node.exe external run-mysql-regression.cjs (reviewed copy of previous helper with HTTPS phase removed): fresh MySQL8.0.46 schema ayambil_test_1791710494863,127.0.0.1:60705; **9passed/0failed/1skipped**, realMySQL1pass/MariaDBskip, same mock/static breakdown. Schema fix and listing regression passed; no prior results relabelled.
- npm run test --prefix apps/web: **28passed/0failed/0skipped**; npm run lint --prefix apps/web completed quietly; npm run build --prefix apps/web first failed EPERM realpath src/main.jsx in sandbox, approved retry **exit0**,2327modules/outputdist/apps/web. No dependency/lockfile changes this task. Retained PB/Supabase, browser and PDF suites not rerun.

Cleanup: all setup/test servers shut down using exact owned connection SHUTDOWN, exit0 confirmed, never arbitrary-process termination. Final MariaDBPID6704 terminated0; MySQL provisioningPID25388 and TCPPID24328 terminated0. Listener/process inventory checked after completion. Runtime/data/server logs/suite logs and helper scripts retained outside Git; no credentials/capabilities included in reports. No services/firewall/PATH/system-trust/hPanel changes. Process-only PATH selected bundled Node; no global PATH edit.

Repository files changed this task: apps/api/tests/mariadb.test.mjs (new independently gated real engine coverage); apps/api/migrations/001_ayambil.sql (generated expression normalization); apps/api/store.mjs (portable quoted SQL literals); docs/AYAMBIL-HANDOFF.md and this report. Review limited changes against pre-existing untracked backend work; no blanket staging/publication. External helpers separate.

Decision: real local MariaDB11.8.9 compatibility **passed for tested scope**, independent MySQL regression retained. Assigned Hostinger engine/config/grants not programmatically verified; user-supplied production version11.8.9 versus prior10.5 discrepancy still applies. Lead route remains confirmed503 in Express and unsafe to activate; runtime/PORT/dependencies/proxy/CDN requirements remain unresolved. Single next task: obtain written supported Hostinger lead-routing/runtime/cache/proxy configuration and review a staging proposal; if frontend-to-MariaDB HTTPS acceptance is required, conduct it as a separate isolated task. Production remains blocked; no live DB, Git publication, public registration or messaging changes.

## Desktop schema import package and release gate recheck — 11 October 2026

Read current handoff and latest technical evidence, Git branch/status/diffs/remote inspected. Branch codex/ayambil-hostinger-deploy, HEAD ad53ae63a329b26d176572908de7ba0271ee11e6; origin https://github.com/aagam6/vardhman-creative-studio.git. Staging empty, all pre-existing Updhan/App/sitemap/remediation/backend edits preserved. Only both reports edited inside repository this task; no application/test/migration source changes.

Artifact folder resolved through PowerShell [Environment]::GetFolderPath(DesktopDirectory), not a hardcoded username: **C:/Users/aagam/Desktop/Ayambil-Hostinger-Import/**. Files: ayambil-initial-schema.sql, IMPORT-README.txt, SHA256SUMS.txt. SQL exact byte-copy of current apps/api/migrations/001_ayambil.sql, **4716bytes**, SHA256 **45bf374ec1e6da62738d786aaf9a58dc815d57d9badf08ead97ae0dba941eb29**. Hash unchanged before/after both engine validation and final check; RTRIM fix present. Artifacts outside Git, never staged. No CREATE DATABASE/USER, grants, DROP/TRUNCATE, credentials, fake/private records or administrator included. Only schema plus singleton closed setting and version1 tracking rows. Event table intentionally empty: approved programmes/admin are separate bootstrap, so API startup is not ready merely after schema import. Single-use, not rerunnable over existing tables; partial DDL errors require review, not blind retry or deletion.

Existing verified runtimes reused; no new download. External validate-import.cjs applies exact source migration to one fresh schema and finished SQL bytes to a SECOND fresh schema per engine. Guards require127.0.0.1 and ayambil_test_ names; verifies initial emptiness, 14tables, zero rows except1setting/1version, closed gate, version1 and RTRIM generated definition. Restricted schema users only; administrative local connections provision new schemas, never live DB. Results:
- MariaDB11.8.9,127.0.0.1:62302; clean source ayambil_test_mariadb_1791712815142_source_importcheck and clean artifact ayambil_test_mariadb_1791712815142_artifact_importcheck both passed. Separate regression schema ayambil_test_mariadb_1791712815142: **9pass/0fail/1intentionalMySQLskip/0cancelled**.
- MySQL8.0.46,127.0.0.1:62321; clean source ayambil_test_1791712818726_source_importcheck and clean artifact ayambil_test_1791712818726_artifact_importcheck both passed. Separate regression schema ayambil_test_1791712818726: **9pass/0fail/1intentionalMariaDBskip/0cancelled**.
Each engine's API run includes1realSQLpass,2mockHTTPpass,1mocktransactionpass,1staticSQLpass,4otherpass and1opposite-engine skip; do not aggregate as two extra real-engine successes per runner. Clean import checks are additional external assertions, not node:test counts. First external import attempt failed ER_PASSWORD_NO_MATCH because helper omitted account host in GRANT; stopped/shutdown before migration, corrected external helper only and reran with entirely fresh instances. No schema defect inferred.

Commands: PowerShell Desktop API/New-Item/Copy-Item/Get-FileHash; bundled Node24.19.0 executes external run-mariadb-import.cjs and run-mysql-import.cjs, each invokes npm-cli.js run test --prefix apps/api with separate guarded process-only local settings. Fresh frontend npm run test --prefix apps/web **28pass/0fail/0skip**; npm run lint --prefix apps/web **exit0**; npm run build --prefix apps/web **exit0**,2327modules, dist/apps/web. Retained PB/Supabase/browser/PDF tests not run. Helpers/runtime/data/logs outside repository. Final MariaDBPID4384, MySQLprovisioningPID38888 and TCPPID29676 exited0; process/listener check found none on62302/62321. Failed setupPID25428 also exited0. Registration restored closed in local suites; WhatsApp neverenabled. No global PATH/services/firewall changes.

Secure bootstrap review: apps/api/tools/bootstrap.mjs, security.mjs, config.mjs and migration inspected. Existing script requires explicit approval flag, validates server settings, reads password from stdin, uses random-salt scrypt, refuses existing admin and transacts snapshots/admin. No default credentials created. It loads authoritative programme JSON but does not explicitly validate saved programme snapshot shape; this remains a prerequisite to a reviewed production bootstrap. README describes a hidden-input/stdin launcher requirement, not a shell password pipeline. Actual secure Hostinger Node/stdin one-off capability is unverified; do not assume SSH npm/node or put bootstrap in build/startup. Official docs: https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/ (deployment-time npm, SSH limitation); https://www.hostinger.com/support/1884149-how-to-import-a-database-with-phpmyadmin-in-hostinger/ (selected database Import). No administrator provisioned and no DB environment values read/set.

Fresh connected Hostinger read calls hosting_nodejs_build-settings and hosting_nodejs_list-builds(per_page1): current Node major22, app_typeother, rootnull, entrynull, buildscriptbuild, outputdist/apps/web, npm. Latest completed Git build remains **main**, commit83d9c3f427a2f61a0b41572b2e420ae53d01d265,06:34UTC11October. Auto-build risk exists on publication to connectedmain; no push/rebuild triggered here. Exact runtime patch/PORT/supervision/runtime dependencies still unverified. Local rootstart is PocketBase; Express legacy namespace503 remains confirmed hard gate. No routing/upstream invented and no write/support message sent.

Production decisions:
| Gate | Status |
| --- | --- |
| SQL artifact/source imports on local MariaDB/MySQL | Confirmed |
| Git-connected deployment branch main | Confirmed from latest connected build metadata; webhook toggle not independently exposed |
| Persistent Express entry/root/dependencies/Node patch/PORT/supervision | Blocked by current unset entry/other mode; details Unverified |
| Same-origin API/TLS Secure cookies | Unverified hosted; local historical acceptance only |
| Existing lead preservation | Blocked: /hcgi/platform503; need verified supported split routing/upstream or separately approved tested adapter |
| Proxy/client IP/rate-limit topology | Unverified |
| Edge no-store/private/error caching | Unverified; source blanket public header remains risk |
| Backups/restoration/complete rollback | User reports backup completed; recoverability/DB/runtime restore Unverified |
| Secure production bootstrap runner and snapshot validation | Blocked pending supported procedure/review |

Operator instructions in Desktop IMPORT-README: hPanel website Databases Management → phpMyAdmin → select intended DB → Import/ChooseFile/Go only after separate schema approval and existing-table check. Verify14tables/closedsetting/version1 and other tablesempty. Do not delete database, retry partial import blindly or expect bootstrap/events in SQL. User considers old test records disposable, but no deletion authorised/performed by this task. Rollback preserves new MySQL data, closes gates, restores reviewed frontend/runtime/routing/environment together; old PocketBase route not proven working, so source retention alone is not full recovery.

Conclusion: **schema artifact locally import-validated; production release blocked**. No code committed/pushed/merged, no Hostinger build/deployment initiated or live SQL applied. Single next action: obtain verified Hostinger lead-preservation and runtime/proxy/cache/secure-bootstrap procedure, then review staged rollout configuration before publication or live import. Registration/WhatsApp remain disabled. No production database/settings/secrets touched.
