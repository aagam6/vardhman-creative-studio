# Ayambil final release review — 13 October 2026

Decision: **NO-GO for production activation or deployment.** This review authorizes a Draft PR only. No hosted SQL, forms, data changes, messages, settings changes, merge or deployment were performed.

## Branch alignment and scope

Verified origin/main: `085979aac47a5a2235871eb3207fd06cb5d3ebec`.
Original feature: `227f5ef24f6d6e6fc349bedc4826806d462fb3c7`; original merge-base: `dad1c7d09ad7bf2eb23a6d3dd49dd9e5d97492cc`; two ahead/two behind.
New branch: `codex/ayambil-release-review-20261013`, based on verified origin/main. Cherry-picks produced `80ad9ef` and `c413acb1d59d5db6dee4193e0f15513f3c64374b`, without conflicts. The resulting binary diff exactly matched the original feature diff. Existing feature and staging worktrees were preserved. This report is an additional documentation-only commit; tests below ran on c413acb's unchanged application source.

Changes retain event-lifetime pass expiry, accurate queue summaries, masked channel inspection, production instrumentation restrictions, private response headers and lead-table health. The pass uses two 205 × 105 mm landscape pages with approved terms/credits retained. The dashboard has compact filters/cards and expandable private attendee/pass details. No production BODY-validation policy or processing approval was changed.

## Fresh local verification

Supported runtime: Node 24, invoked through the installed Codex runtime. npm commands used the installed npm CLI with Node 24. All provider calls were mocks; browser acceptance blocked non-localhost traffic. Generated files and local runners remain ignored, outside the PR.

| Command | Exit | Result |
| --- | --- | --- |
| `npm run test --prefix apps/api` | 0 | 52 total; 50 PASS, 2 intentional engine skips |
| `npm run test --prefix apps/web` | 0 | 39 PASS; no skips |
| `npm run lint` | 0 | PASS |
| `npm run build` | 0 | PASS, full production frontend and normal router |
| `node tools/ayambil.design-acceptance.mjs` | 0 | 32 browser/PDF assertions PASS, including both evenings and two landscape pages |
| `node --test tools/production-postinstall.test.mjs` | 0 | 5 PASS |
| `node "C:/Users/aagam/.codex/worktrees/ayambil-production-integration/Vardhman Creative Studio/tmp/run-mariadb.cjs"` | 0 | Real MariaDB 11.8.9: 51 PASS, 1 MySQL-only skip |
| `node tmp/run-mysql.cjs` | 0 | Real MySQL 8.0.46: 51 PASS, 1 MariaDB-only skip; HTTPS acceptance 104 assertions PASS |
| `git diff --check` | 0 | PASS before report; repeated before commit |

Initial API run failed the static-route test because the fresh worktree had no frontend build. Building and rerunning the unchanged assertions resolved it. Initial HTTPS run failed an old portrait-fixture expectation that a valid 120-character name must overflow. That name now legitimately fits the landscape pass. The copied, ignored local acceptance runner now injects genuinely oversized synthetic content before the existing refusal assertions. No application assertions were removed or weakened; the valid maximum-length name downloads successfully. The final 104 count differs from the historical 105 because that valid-name branch now downloads rather than entering its old error branch.

Database isolation: engines ran in owned local disposable data directories with loopback-only random ports, generated restricted schema users and verified grants. MariaDB fixture schema was `ayambil_test_mariadb_1791830475376`; HTTPS schema was `ayambil_test_1791830573715_https`. Only reviewed 001/002 fixtures were initialized there. Migration 003 remained unapplied. All owned database/server processes were stopped and test gates closed. No connection to the hosted business database occurred. Lead health coverage is mocked; real hosted lead persistence is NOT RUN.

## Read-only Hostinger evidence

Connector metadata reviewed around 2026-10-12 18:38–18:43 UTC (13 October IST):

- Production website is an enabled regular hosting Node.js website.
- Latest build `01a13127-5e45-719e-ad01-913a0ce22815` is completed, Git main commit `085979aac47a5a2235871eb3207fd06cb5d3ebec`, created 2026-10-12T17:27:06Z, completed 17:28:06Z.
- Settings report Express, Node 24, npm, entry `apps/api/server.mjs`; root/output/build-script fields are null.
- Runtime log has two sanitized `Ayambil API readiness verified.` entries at 17:28:08.774Z and 17:28:10.993Z. These prove startup readiness logging, not full website health, lead-table existence, delivery or a deployed review revision.
- Account cron listing is empty. This does NOT establish absence of an internal PocketBase cron or another external consumer.
- Environment names exist for DB_HOST/PORT/NAME/USER/PASSWORD, AYAMBIL_SITE_ORIGIN, queue encryption/rate-limit keys, Flow configuration, PORT, production/staging build flags, registration, WhatsApp enablement, normal-processing approval and test BODY override. Values are masked; this audit cannot independently verify false/true values. No bootstrap approval key was observed. No values were changed.
- Available regular-hosting connector operations did not expose daemon inventories, proxy-chain identity or database backup/restore evidence. VPS and Agency operations are not evidence for this regular Node hosting product.

No live response smoke checks were performed in this review phase. Deployed metadata points to main, not this new review branch. No live integration success is claimed.

## Release-critical findings and required manual evidence

**BLOCKED — queue ownership.** Repository Express startup has no automatic queue interval. The authenticated normal-processing HTTP route checks approval, but `message-queue.mjs` execution method `runOne()` does not itself enforce it. A future direct caller could bypass that route guard. This existing gap needs a separately reviewed focused fix before messaging activation. Exact test selection requires test type, null booking/provider reference, zero attempts and server-configured recipient; intent is durable before POST and uncertainty is not blindly retried.

Historical `apps/pocketbase/pb_hooks/ayambil-messaging.pb.js` registers internal `ayambil_whatsapp_outbox` every minute and polls/processes PocketBase `ayambil_messages`. MySQL uses `ayambil_message_queue`; both could duplicate business notifications if independently active. Hostinger/support must provide active service identities/start commands, loaded hook versions, internal scheduler status and external scheduler/worker ownership, without payloads or credentials. Empty account cron is insufficient. Uncertain provider acceptance must be reconciled by provider reference; reference-less uncertain acceptance requires operator/provider investigation, not another POST.

**BLOCKED — legacy pass-message compatibility.** Queue pass-link preflight still requires lowercase hexadecimal 64-character keys while download validation accepts mixed-case alphanumeric legacy keys. Capability hashing, expiry and revocation remain enforced. This focused compatibility gap must be reviewed before legacy pass delivery; no hosted capability was reissued.

**BLOCKED — hosted lead readiness.** There is no separately authorized exact-database schema/grants access. No hosted SQL was requested or executed. Ayambil startup readiness does not prove `vcs_leads` exists. Obtain explicit authorization for a schema-only identity/column/grant check through the operator's existing administration access. Do not submit an enquiry, create a database/user or execute 003. Missing-table local tests fail closed.

**BLOCKED — route/proxy/cache compatibility.** Frontend source has migrated same-origin callers; Express retains the lead compatibility alias but other `/hcgi/platform` requests return 503. Historical Apache proxy configuration documents additional legacy health, booking, admin and pass contracts. External consumers and actual production upstream ownership are unverified. Obtain deployed proxy/routing configuration and consumer inventory before retiring legacy behavior. Public `.htaccess` retains shared-cache/SPA rules; whether it is active for Node and whether private/API no-store headers survive the actual CDN/proxy chain are unverified. Obtain read-only response headers and exact proxy chain before changing trust-proxy settings. Current socket-based rate-limit tests resist spoofed X-Forwarded-For, but proxy aggregation impact remains unverified.

**BLOCKED — backup/rollback.** No database backup timestamp, scope, retention, integrity or isolated restore evidence is available. Obtain existing backup metadata and a documented, independently tested restore procedure. Identify a known-good compatible application revision and code-only rollback that preserves newly created records, capabilities, consent and provider references. Never restore an old database snapshot over new writes merely to roll back code. No backup, restore or rollback was performed.

**BLOCKED — legacy data preservation/cutover.** Required old-record migration and authenticated service/data-source evidence are not established by this review. Do not assume missing source access means empty collections or completed migration.

## Review and deployment boundaries

PASS: clean selective branch alignment, local regression matrix and unchanged full website build. BLOCKED: operational queue ownership, hosted lead readiness, route/cache/proxy compatibility, legacy data preservation and backup/restore readiness. NOT RUN: hosted persistence, real messaging/delivery, hosted SQL and production acceptance of this review revision.

Keep `AYAMBIL_WHATSAPP_NORMAL_PROCESSING_APPROVED=false` and `AYAMBIL_WHATSAPP_TEST_BODY_OVERRIDE=false`; confirm through authorized operator controls because connector values are masked. Do not enable bootstrap or staging test approvals in production. Draft PR only; no merge, auto-merge, deployment or messaging activation is authorized. Production decision remains **NO-GO**.
