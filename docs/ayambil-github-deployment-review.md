# Ayambil GitHub review branch — 10 October 2026

## Scope and repository evidence

Origin fetch/push URL: https://github.com/aagam6/vardhman-creative-studio.git. Local main and freshly fetched origin/main matched at 347fe25 before branching (ahead/behind 0/0). The event routes, Ayambil components, hooks, migrations, tests and documentation were absent from origin/main. Review branch: `codex/ayambil-hostinger-deploy`; do not merge or deploy without separate approval.

The reviewed commit includes the event landing page, separate evening registration routes, admin/private-download routes, existing A4 pass implementation, six original event images and the two user-supplied portraits. PocketBase remains the frontend backend. Supabase source is retained as an isolated test backend; committing it does not authorize remote migration or deployment.

Unrelated Updhan files remain unstaged. Only the Ayambil additions to App.jsx and sitemap.xml were staged; the original working files retain the unrelated additions. Unused book photographs, an alternate portrait, local screenshots, generated dependency audit JSON, runtime databases, temporary PDFs and test records were excluded. Five reviewed PocketBase migration source files are explicitly allowed by .gitignore; runtime/data directories remain ignored.

## Build settings for later authorized deployment

- Install from repository root using the committed package-lock.json: `npm ci`.
- Build command from repository root: `npm run build --prefix apps/web`.
- Output directory from repository root: `dist/apps/web`.
- Supported dependency engine intersection requires Node 22.x **at least 22.22.0**. Current local Node 22.17.0 built successfully but does not satisfy the installed router's engine declaration. Verify the offered Hostinger runtime before deployment.
- The new portable `apps/web/tools/build.mjs` runs the optional metadata generator followed by the required Vite build and propagates build failure. The former shell expression returned success without invoking Vite on Windows; that defect is fixed.
- Preserve SPA fallback, static assets and existing HTTPS. Do not point Hostinger auto-deployment at this review branch. Existing hosting settings were not changed or verified in this sync task.
- `VITE_AYAMBIL_POCKETBASE_URL` may contain only the reviewed public PocketBase URL, never credentials. No live environment settings were changed. Do not switch to the Supabase test project.

## Executed verification

| Command/check | Actual outcome |
| --- | --- |
| `git fetch origin main`; `git rev-list --left-right --count HEAD...origin/main` | Successful; main matched origin/main, 0/0 |
| `npm run lint --prefix apps/web` | Passed |
| `npm run test --prefix apps/web` | 20 passed |
| `npm run build --prefix apps/web` | Actual Vite production build passed after portable script fix; output dist/apps/web |
| `node tools/ayambil.integration.test.mjs` | 59 disposable real PocketBase checks passed |
| `node tools/ayambil.supabase.test.mjs` | Four local suites passed; harness reports 49 SQL/Edge assertions; provider mocked |
| `git checkout-index --all --prefix=<isolated release-snapshot directory>/` followed by npm build/test/lint against its apps/web | Exact staged source snapshot built successfully (2,321 modules), 20 tests passed, lint passed |
| Staged text/path scan | 88 staged files scanned before adding this report; no flagged token/private-key patterns or excluded data paths. Pattern scanning is not proof of absence of every possible secret |
| `git diff --cached --check` | Existing trailing whitespace/EOF warnings in event source/test files; not build failures |
| `git check-ignore` on sample env/database/node_modules/PDF/runtime/Supabase temp paths | All samples ignored |
| `gh` availability | CLI unavailable; use connected GitHub tooling for draft PR after verified push |

Hosted Supabase checks, Deno checks, browser screenshots, mobile rendering, generated PDF visual inspection and native printing were not rerun in this sync phase. Historical results and blocked browser checks are distinguished in ayambil-complete-audit-results.md.

## Review blockers and safety

Release classification remains **isolated testing only**. Public PocketBase health previously returned HTML instead of JSON; no authorized server access exists to establish the real proxy upstream. Remaining dependency audit findings are 6 high and 3 moderate (0 critical), including unrelated XLSX and Tailwind dependency paths. Engine support, populated-database attendee-key migration/backfill and old-link redistribution need review. Actual browser/PDF/print verification remains blocked by the saved preview permission policy.

Do not automatically run migration rollback/reset or apply migrations on production. The attendee-specific private-link contract requires coordinated review of migration, hooks, frontend and messaging. Test capability expiry, cancellation and reissue revocation on staging before release. Supabase test fixture migrations are test-project-only and must not be applied to production.

No production DNS, Hostinger settings, remote migrations, secrets, live records, registration gate or WhatsApp gate were changed. No real messages were sent. This branch is for review, not production readiness or deployment authorization.

## Resumed Supabase review and authenticated inventory

The final workflow instruction specifies continuing `codex/ayambil-hostinger-deploy`; the earlier `codex/ayambil-deploy` mention was not used to rename or duplicate this branch. Current unstaged App.jsx and sitemap changes are exclusively the preserved Updhan additions.

Fresh commands executed on resumption:

- `node tools/ayambil.supabase.test.mjs`: four suites passed, 49 reported local SQL/Edge assertions. No hosted concurrency or provider calls in this suite.
- `npx --no-install deno check supabase/functions/ayambil-test/index.ts`: passed.
- `npx --no-install deno lint supabase/functions`: passed, four files checked. Workspace override-location warning remains informational.
- `npx --no-install supabase projects list --output json`: authenticated target confirmed `vardhman-ayambil`, reference `elixeakdejaqpuiaresr`, region `ap-south-1`, ACTIVE_HEALTHY.
- `npx --no-install supabase migration list --linked`: local/remote 001–004 matched; 005 (`ayambil_booking_terms`) pending remotely. No push/reset/repair executed.
- `npx --no-install supabase functions list --project-ref elixeakdejaqpuiaresr`: `ayambil-test` ACTIVE, version 6, verify_jwt false. Explicit Auth lookup and database administrator allowlist protect admin operations; disabling gateway JWT validation is required for public closed-status/private-capability operations.
- `node .ayambil-runtime/release-stage/review.mjs`: 89 staged files, zero flagged secret/path patterns before this report update.

Initial sandbox npx checks stalled without output and were interrupted; the authorized network retry returned the results above. The previous exact staged-source build, frontend 20-test pass, lint and disposable PocketBase 59-check pass remain valid; no implementation files changed on resumption.

### Security and compatibility assessment

Migration order is schema/RLS (001), transactional RPC (002), synthetic admin-only fixture (003), fixture execution revocation (004), then additive terms columns and updated authoritative max-two validation (005). RLS and explicit revocations deny browser roles access to event tables and private capability tables. Only the server service role calls privileged RPCs. Transactions, advisory locks and unique request hashes preserve same-key idempotency; local tests cover rollback and lifecycle, while independent-connection hosted concurrency was not rerun here.

Capabilities are attendee/pass-specific and expire after seven days; download checks active pass, attendee and booking plus expiry. Cancellation denies downloads; superseded passes remain invalid after reissue. Responses are no-store. Admin JWTs are checked against Auth and enabled database membership. Service-role credentials occur only in the Edge entrypoint, not VITE variables.

Public registration requires both Edge and database gates. Worker sending requires a separate explicit enabled flag, worker authorization, healthy provider account, approved event-specific template/language/parameter mappings and authorized test recipient. Uncertain provider results are retained for reconciliation; no real messages were sent or provider configuration verified here.

Open findings: the public rate bucket is shared per operation and permits one caller to exhaust the shared 30/minute allowance; salt validation only requires nonempty configuration. Review scoped throttling and strong salt validation before release. Rotate the previously chat-exposed rate-limit salt and Hostinger token securely in their owning secret stores, without pasting replacements into chat. No secret values were read or changed here.

Hosted schema 001–004 lacks migration 005's database max-two/terms enforcement. The deployed version-6 function was inventoried, not downloaded or proven byte-identical to current source. No hosted Auth/RLS/registration/flags test was rerun, and no secret inventory was requested. Historical hosted checks remain historical; live safety flags were not modified or independently confirmed through this inventory.

The production frontend imports the PocketBase SDK and calls `/api/ayambil/*` under `/hcgi/platform` (or its public URL override). Supabase uses POST operation envelopes and different result contracts; its returned pass snapshots are rendered by an isolated preview adapter. The current live private-download route is a PocketBase client, so Supabase WhatsApp pass URLs require an approved compatible preview/frontend adapter before any messaging test. No silent adapter cutover was made.

Remote migration 005, any function update, secure backups and rollback/version compatibility require separate review using the existing test deployment guide. Leave fixture RPC 003 revoked by 004. Do not blindly run hosted harnesses that require temporarily restoring fixture execution. Supabase source is ready for Git review and isolated local testing, not live release.
