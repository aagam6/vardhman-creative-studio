# Ayambil complete implementation Continue from the existing Ayambil complete audit report at `docs/ayambil-complete-audit-results.md`.

Execute a remediation phase for the confirmed blockers. Inspect the current working tree and existing changes before editing anything.

### 1. Fix PocketBase API routing

- Inspect Apache virtual hosts, `.htaccess`, the existing proxy template, public URL configuration and the actual PocketBase service configuration.
- Identify the correct upstream from verified configuration; never guess a port or host.
- Correct API routing without breaking SPA routes, static assets, SSL or unrelated websites.
- Verify the public health endpoint returns the expected JSON content type and valid health response.
- Test authentication, registration preflight and a harmless API request against the isolated test environment.
- Do not enable production registration.

### 2. Remediate dependency advisories

- Inspect `tools/ayambil-audit-dependencies.json`, package manifests and lockfiles.
- Trace each critical/high advisory to its direct dependency and dependency path.
- Determine whether the affected package is used at runtime, during builds or only in development.
- Apply the smallest compatible, supported upgrades that resolve the actual advisory paths.
- Do not use `--force`, indiscriminate dependency upgrades or unnecessary dependency replacement.
- Run frontend tests, lint, build and the existing PocketBase/Supabase test suites after changes.
- Report advisories that remain unresolved and explain why.

### 3. Review private pass authorization

- Document the current PocketBase booking-level download capability and compare it with the required attendee-level privacy model.
- Propose the smallest secure design change.
- Implement only if the intended access scope is unambiguous; otherwise request approval before changing the contract.
- Test active, cancelled, reissued, missing and unauthorized pass keys using synthetic records.
- Ensure private pass responses are not publicly cached.

### 4. Complete visual and PDF verification

- Inspect both Manan Sanghvi and Sairam Dave photographs in the rendered UI.
- Verify their event associations, beneficiary information, organiser/inviter sections and venue links.
- Test mobile layouts and the existing single-page portrait A4 PDF.
- Verify Gujarati glyphs, long text, page boundaries and bilingual pass terms.
- Test download and print functionality where browser permissions allow.
- Clearly identify tests that remain blocked. Never claim screenshots, PDF inspection or native printing passed unless actually verified.

### 5. Safety constraints

- Keep PocketBase as the live frontend backend.
- Keep the separate Supabase test backend isolated.
- Do not change production DNS, Hostinger settings, live data, remote migrations or secrets.
- Do not open registration or enable WhatsApp messaging.
- Do not send real messages or use real attendee data.
- Preserve unrelated user changes and review the final diff.

### 6. Final deliverables

Update `docs/ayambil-complete-audit-results.md` with the remediation evidence, exact commands, test outcomes, remaining risks and deployment recommendation.

Finish by stating whether the project is ready for isolated testing, controlled release review or production review. Do not claim production readiness while any critical blocker remains unresolved.audit

Audit date: 10 October 2026. Scope: current working tree, disposable local test databases, build output and read-only public health request. No production writes, deployment, migration, messaging or registration enablement occurred.

## A. Executive summary

**Recommendation: ready for isolated testing only; not ready for production deployment.** Local validation and permission/lifecycle regressions pass. The actual public backend health URL returns HTML, dependency advisories remain unresolved, and current browser/PDF/hosted security checks were not independently executed. A passing build does not establish release readiness.

Confirmed critical/high items are dependency advisories and the production backend routing failure. Advisory severity is reported by npm, not proof of an exploitable event endpoint. No unauthorized public attendee read was demonstrated in the isolated tests. Production authorization, secrets and deployed rules remain unverified.

The existing frontend calls PocketBase, not Supabase. Supabase is explicitly a separate test implementation. Production registration and WhatsApp configuration were not changed; their actual remote flag values cannot be certified from this repository. Fail-closed defaults are present in code.

## Implementation inventory

| Files | Responsibility and evidence |
| --- | --- |
| `apps/web/src/App.jsx` | React/React Router routes for landing, two evenings, private passes and `/admin/ayambil`; existing privacy and terms routes exist. |
| `apps/web/src/pages/AyambilPage.jsx`, `AyambilEveningPage.jsx`, `AyambilPage.css` | Landing and fixed-date evening layouts, Helmet metadata, source brochure gallery, responsive styling. |
| `apps/web/src/components/AyambilEventDetails.jsx` | Shared portraits, date-specific beneficiary panels, map links, registration choices, event footer. |
| `apps/web/src/components/AyambilBookProgramme.jsx`, `lib/ayambilOfficialCredits.js` | Source-derived prose and separately labelled credits. Book photographs were removed from rendered content as requested; source assets remain. |
| `lib/ayambilProgramme.js` | Page programme data, six artwork references, photos, two supplied map URLs. |
| `components/AyambilRegistration.jsx`, `lib/ayambilBookingValidation.js`, `lib/ayambilTerms.js` | One/two attendee selector, fixed evening, review, separate consents, confirmation and retained in-memory retry key. |
| `lib/ayambilRegistration.js` | PocketBase SDK with memory-only event-admin auth; public URL override `VITE_AYAMBIL_POCKETBASE_URL`, otherwise `/hcgi/platform`; 15-second request timeout. |
| `AyambilAdminPage.jsx` | Authenticated search/date/status filters, paginated export, cancellation/restoration/reissue and failed-message retry. |
| `AyambilPassDownloadPage.jsx`, `AyambilDigitalPass.jsx`, `AyambilDigitalPass.css`, pass utilities/presentation | Fragment capability removed from address bar, server snapshot preview, raster PDF, print selection and share/copy fallbacks. |
| `apps/pocketbase/pb_hooks/ayambil-registration.pb.js`, `ayambil-messaging.pb.js`, `ayambil/*.cjs` | Validation, transactional save, gated messaging worker, explicit enabled-admin checks, private downloads. |
| `apps/pocketbase/pb_migrations/1791590400_*` through `1791636000_*` | Bookings, attendees, passes, event admins, audit, messages, single-evening and terms changes. Direct mutations locked; privileged endpoints enforce roles. |
| `supabase/migrations/202610100001_*` through `202610100005_*`, `supabase/tests/security.sql` | Dedicated test tables/private schema, denied browser grants/RLS, service-role RPCs, test fixture then revocation, local terms/max-two amendment. |
| `supabase/functions/ayambil-test/index.ts`, `_shared/{handler,contracts,vardhmanflow}.mjs` | Test-project guard, hosted Auth lookup plus enabled membership, CORS, limits, closed defaults, server-only service role/provider secrets. |
| `tools/ayambil.integration.test.mjs`, `ayambil.supabase.test.mjs`, hosted/phase4b harnesses; `apps/web/tests` | Real disposable PocketBase tests, PGlite SQL/handler tests, separately opt-in hosted harnesses, frontend logic tests. |
| `apps/web/public/.htaccess`, `deployment/apache/pocketbase-proxy.conf.template`, deployment docs | SPA fallback, uninstalled proxy template requiring verified upstream, deployment prerequisites. |

Working tree contains extensive pre-existing tracked edits and untracked event/Supabase/docs/assets plus unrelated Updhan files. None were removed or reset. `git status` initially reported an fsmonitor IPC warning; inspection with `core.fsmonitor=false` worked. Tracked diff alone excludes the numerous untracked implementation files. `git diff --check` reports an existing extra blank line at sitemap EOF; no broad cleanup performed.

## B. Findings

| Severity | Finding / evidence | Affected files | Impact / safe next action | Status |
| --- | --- | --- | --- | --- |
| High | Public `/hcgi/platform/api/health` independently returned HTTP 200, `text/html`, non-JSON. `.htaccess` has SPA fallback and no backend proxy. | `.htaccess`, PocketBase client, proxy template | Registration backend unavailable through expected public path. Operator must verify upstream and install an approved routing solution; retest JSON health/auth before opening. No guessed upstream. | Open |
| Critical (advisory) | npm reports `shell-quote` command-injection advisory, propagated critical classification to `concurrently`; actual exploitability not demonstrated. | Root dependency tree/lockfile | Separate dependency remediation and command-construction review. No automatic audit fix or lockfile change. | Open |
| High (advisory) | npm lists high advisories affecting brace-expansion, braces/chokidar/micromatch, js-yaml, source-map-js, fast-glob/tailwindcss and xlsx. | Dependency tree | Determine runtime versus build-only exposure and patch in controlled change. xlsx is direct and npm reports no automatic fix. | Open |
| Medium | PocketBase download capability authorizes the **whole booking**, not one attendee. `messaging.download()` returns all active booking passes. Reissue does not revoke this booking capability; it returns the current pass instead. | PocketBase messaging/download page | This differs from attendee-specific Supabase downloads and the requested attendee-isolation criterion. Decide/document intended access scope or prepare reviewed capability redesign; do not claim old booking links are superseded attendee links. | Awaiting approval |
| Medium | No explicit application-level PocketBase registration/download rate limiter found in the inspected custom routes. Platform limiter configuration not available. | PocketBase hooks/deployment | Verify actual platform limits and add reviewed abuse controls if absent. Do not claim deployed limiting is enabled. | Open |
| Medium | Supabase public limit bucket is shared per operation (`actor || 'public'`), 30/minute; one client can exhaust availability for others. Salt only checked for nonempty value in handler. | `_shared/handler.mjs`, RPC migration 005 | Suitable conservative test safeguard, not established production policy. Review scoped abuse limits and salt strength validation before production consideration. | Open |
| Medium | RPC migration 005 introduces terms and max-two validation locally. Current remote history/deployed function version was not queried. | Supabase migration 005 | Hosted results from older reports do not establish current hosted rules. Review dry-run/history and rerun safe hosted boundary checks separately. | Blocked |
| Medium | Page data and saved-pass session configurations are separate; PocketBase/Supabase config still contains `Vijayollas` and `Chandramauleshwar`, while page/pass display uses Gujarati branding/`Chandramaulishwar`. PDF renderer applies a venue string replacement. | Programme/config/Pass JSX | Confirmation/template snapshots can diverge from visible branding. Coordinate approved future config changes without rewriting existing records. | Open |
| Medium | Credit display falls back to current frontend defaults when saved snapshots contain no credits. | `ayambilPassPresentation.js` | Old PDFs regenerated later can change credits independently of issued snapshot. Approve snapshot/version policy before claiming full historical immutability. | Open |
| Low | English Tagore locality is `Kocharab`; requested audit spelling is `Kochrab`; supplied Gujarati reads કોચરબ. | Programme and backend configs | Obtain preferred official English romanization; no silent correction. Address/location association otherwise matches source. | Awaiting approval |
| Low | Manan inspiration honorific/spelling uses user-confirmed `પ.પૂ.આ.` and `સૂરી`; small poster text appears `પ.પૂ.આ.શ્રી ... સૂરિ`. | Official credits | Confirm exact transcription/punctuation before publication; names retained rather than guessed. | Awaiting approval |
| Low | Sairam subtitle `માતૃપૂજની વિશેષ પ્રસ્તુતિ` is inconsistent with source `માતૃપૂજા પુસ્તક`. Day 3 category still displays `Vijayollas & Parna Mahotsav`. | Programme data | Approve simple copy normalization; headline identity already uses વિજયોત્સવ. | Open |
| Low | Unhashed portraits/posters are served under `/assets`; Apache marks all assets immutable for one year. | `.htaccess`, public assets | Future replacement at same URL can remain stale; use versioned filenames or reviewed cache policy. | Open |
| Low | Build npm script uses POSIX `|| true`; Windows portability is questionable. Actual Vite command passed. | web package scripts | Make portable in a separate reviewed scripts change. | Open |
| Informational | Browser preview remains blocked by a saved browser permission setting. No workaround attempted. | Current UI/PDF validation | Clear setting or perform operator visual checks; current portrait crops/contrast/overflow cannot be certified. | Blocked |
| Informational | Hindi switcher translates instruction block only, not whole UI. | `AyambilInstructions.jsx` | Document partial scope; English/Gujarati remain paired. Actual all-language browser rendering pending. | Open |

Full dependency result: 15 affected packages: 2 critical, 9 high, 3 moderate, 1 low. Moderate: postcss-nested, postcss-selector-parser, tailwindcss-animate; low: dompurify. These counts include transitive propagation. Sanitized raw npm audit retained in `tools/ayambil-audit-dependencies.json`.

## C. Content and feature verification

- Dates are 2 November Monday / 3 November Tuesday / 4 November Wednesday 2026. Both evenings use 8 PM; programme titles and performer associations match the supplied posters. Evening passes exclude mornings and 4 November in both server validation implementations.
- Both exact map strings are present: `https://maps.app.goo.gl/bXgLhbJ1cLfvdxqA6` for Chandramaulishwar Hall and `https://maps.app.goo.gl/szzzN9cXE8dWJW7r7` for Tagore Hall. Links use new-tab safe attributes and descriptive direction labels. Destination resolution was not independently tested in a permitted browser.
- Source Day 02 poster distinguishes morning Navpadji Puja from Sairam's evening. Credits preserve `રંતાબેન`, `બસ્તીમલજી`, and `માતૃપૂજા પુસ્તક`; these differ from earlier typed `રમાબેન`/`માતૃપૂજન` suggestions. Current source-backed values were not replaced. Beneficiaries, organisers and inviters remain separate panels; duplicate families across roles reflect the source. Manan credit data is only selected for 2 November.
- Book-page gallery is absent from current JSX, as recently requested. Source-derived Gujarati/English paraphrase remains; it is not represented as verbatim book quotation. Both source photo files remain intact. Requested source-note and homepage Digital Pass Information/rules section are absent. Dedicated forms and PDFs retain terms.
- Manan asset: `manan-sanghvi-portrait.png` (108,413 bytes), user supplied. Sairam: `sairam-dave-portrait.png` (388,408 bytes), user supplied. Shared `PerformerPortrait` renders these in programme cards, registration choices and dedicated hero. No initials/music substitute is used when portrait exists. Manan has 1.35 scale/78% origin crop; Sairam standard cover. Real DOM loading, face crop quality, mobile layout and console requests remain **not tested** this audit. Existing older Sairam webp is unused, not deleted.
- All six original invitation images remain, approximately 0.51–0.67 MB each. Lazy brochure loading is present. No measured page performance score, CLS, or accessibility score was obtained.
- Main/individual routes, canonicals and Helmet metadata exist; admin/private pass pages are noindex. Privacy and terms links resolve to defined application routes. Google-hosted Gujarati font is configured on event pages; pass generation waits for font loading. Offline/cross-origin font capture reliability needs actual PDF inspection.
- CSS includes responsive rules, focus outlines and event palette/footer; code inspection cannot establish pixel-level contrast or no overflow at 320, 360, 390, 430, 768, 1024, 1366 or 1920 px. Those viewport checks are blocked, not passed.

### Registration and security boundaries

Frontend count defaults to one, selector allows one/two; both consents and review confirmation required. Failed submissions do not show success. Client locks repeated clicks and retains key in memory across retry, but page reload loses recovery state. Admin auth is memory-only and cleared on navigation/sign-out. CSV export escapes cells and spreadsheet formulas.

PocketBase tests independently exercised same-key replay, changed-payload rejection, four simultaneous requests, closed gate, two dates, max-two, locked direct writes, disabled/unauthorized admins, cancellation/restoration/reissue, private/invalid/expired booking downloads and transaction rollback. Writes use parameterized filters and transactions; unique request/pass indexes prevent duplicates. Rate-limit deployment remains a gap noted above.

Supabase local tests execute migrations using PGlite and exercise denied browser grants/RLS, RPC validation, lifecycle and actual injectable Edge handler. RPC uses empty search_path, service-role-only execution, advisory transaction lock and transactional issuance. Ordinary and enabled-admin database browser roles cannot directly mutate test tables. Edge admin authorization verifies Auth user then enabled membership; revoked test fixture RPC remains revoked by migration 004. `verify_jwt=false` is intentional for public status/capability operations, not evidence of bypassing admin checks. Local PGlite checks do **not** prove independent hosted connection concurrency.

Supabase service-role and provider credentials are accessed server-side through Deno env; frontend exposes only URL configuration in the inspected event client. Checked conventional `.env`, `apps/web/.env`, `.env.local`, `apps/pocketbase/.env`, `supabase/.env` locations are absent. This does not mean remote secrets are absent. A complete credential-leak certification across unrelated repository history/logs was not performed.

Private capability fragments are removed from address bar and download responses set no-store. Supabase uses attendee-specific random keys with expiry and active attendee/booking/pass checks; PocketBase uses a booking key as above. Previously downloaded paper/PDF copies cannot be remotely revoked by this no-scanning system. No QR/check-in/payment implementation was introduced.

### PDF/download/print/sharing

Code defines one portrait A4 PDF (210 × 297 mm), with 720 px raster capture at 2x resolution. Image fits 190 mm wide inside 10 mm margins or scales proportionally to 277 mm height; no second-page call. Text glyphs are rasterized rather than embedded searchable font text. Dense credits/rules may become small after proportional scaling; readability is unverified.

Pass rendering uses saved attendee/pass/session data, distinct event programme panels and active status. Eight bilingual rules remain. Download creates blob/file, print marks only selected pass and calls window.print, share uses capability detection and download/copy fallbacks. Mock utility tests passed. **No new PDFs were generated or visually inspected, no download button clicked, no print action/native dialog/physical print verified in this audit.** Earlier Phase 4B reports are historical evidence only and predate current design/assets. No actual WhatsApp request was sent.

## D. Commands and actual outcomes

| Command/check | Result |
| --- | --- |
| `git status --short`; `git -c core.fsmonitor=false diff --stat` | Inspected pre-existing changes; initial fsmonitor warning. |
| `git -c core.fsmonitor=false diff --check` | Existing sitemap EOF blank-line warning; no destructive cleanup. |
| `npm run lint --prefix apps/web` | Passed. |
| `npm run test --prefix apps/web` | Passed 19 tests. |
| `node tools/ayambil.supabase.test.mjs` | Passed four suites; harness reports 49 SQL/Edge assertions; mocked provider only. |
| `node tools/ayambil.integration.test.mjs` | Sandbox attempt failed to start local server; approved disposable retry passed 52 real PocketBase checks. |
| `npx -y deno check supabase/functions/ayambil-test/index.ts` | Passed; warning: nested package overrides only honored at workspace root. |
| `npx -y deno lint supabase/functions` | Passed, checked four files; same overrides warning. |
| `node ../../node_modules/vite/bin/vite.js build --outDir ../../dist/apps/web` from apps/web | Passed: 2,325 modules, 8.07 seconds; no production deployment. |
| `npm audit --json > tools/ayambil-audit-dependencies.json` | Advisory report obtained; wrapper subsequently summarized counts. npm vulnerability findings are not a clean dependency result. |
| Read-only `Invoke-WebRequest` to existing public `/hcgi/platform/api/health` | HTTP 200, text/html, non-JSON: failed API health acceptance. Body/headers containing credentials not logged. |
| Hosted Auth/RLS/migration history/function tests | Not executed anew. Historical Phase 4/4B reports reviewed, not counted as this audit's passes; fixture is deliberately disabled. |
| Browser responsive/console/assets/maps/PDF/download/print | Blocked by existing saved permission. No alternate browser or raw automation workaround. |
| Physical print, live provider/template acceptance | Not tested; live sending prohibited. |

Some initial rg commands used Windows-incompatible wildcard path arguments and returned errors. Corrected directory/glob searches were used; failed searches were not treated as verification. No performance benchmark or automated contrast measurement was run.

## E. Files changed during this audit

1. `docs/ayambil-complete-audit-results.md`: this evidence and limitations report.
2. `tools/ayambil-audit-dependencies.json`: npm dependency advisory artifact (no credentials).

No source, dependency, lockfile, schema, production configuration or pass data edits made. Vite regenerated the existing local build directory. Ambiguous religious copy and authorization/capability changes were deliberately left for review, not silently fixed.

## F. Remaining blockers and deployment recommendation

Before controlled release: resolve backend routing with verified upstream; review dependency advisories; establish booking-versus-attendee private-link policy; verify effective production closed/message flags, rate limits and approved provider setup without sending; inspect actual screenshots at all requested sizes; regenerate both A4 PDFs and inspect glyphs, long names, credits and rules; test downloads and native print manually; confirm exact religious spelling and locality transcription; verify current hosted migration/function versions and permissions through approved read-only access then isolated synthetic checks.

The separate Supabase test project must not be used as an implicit production cutover. Fixture re-enablement or migration application needs a separately reviewed test procedure. No live frontend/Hostinger/DNS/PocketBase data was changed, no registrations opened, no real attendees created and no WhatsApp messages sent.

**Ready for isolated testing only. Production deployment is not recommended on the evidence currently available.**

## Remediation phase — 10 October 2026

This section supersedes the earlier dependency counts and booking-capability finding for the **local implementation only**. Historical audit and user-added text above have been preserved. Existing unrelated working-tree edits were not reset. No live service, DNS, hosting setting, secret, database or remote migration changed.

### Routing: blocked by missing verified server configuration

Re-inspected `.htaccess`, `apps/web/vite.config.js`, browser client initialization, PocketBase package scripts, `deployment/apache/pocketbase-proxy.conf.template` and `docs/pocketbase-apache-proxy.md`. Repository scripts prove an intended `0.0.0.0:8090` listener, not the production machine/container address or connectivity from Apache. There is still no actual VirtualHost, service unit/container network mapping, server access target or module inventory. No local service definition establishes production colocation. Consequently the upstream was not invented and no ProxyPass rule was placed in `.htaccess`.

The existing template already maps public `/hcgi/platform/api/…` to verified-upstream `/api/…`, requires placement inside the existing HTTPS VirtualHost, and restricts dashboard/superuser/settings routes. Its placeholder remains intentionally unresolved. Operator must supply the active HTTPS vhost, actual PocketBase listener/network mapping and enabled proxy/proxy_http/headers modules, then verify direct upstream JSON health from that server. An approved install/reload and public retest are still required; this task did not authorize or perform them.

Read-only public recheck: HTTP **200 text/html**, JSON-object check **false**. Routing is **not fixed** and remains a high release blocker. SPA routes, SSL and static asset configuration were not modified.

Disposable PocketBase integration harness independently verified root `/api/health`: 200 application/json, `API is healthy.`; event administrator password auth succeeds; unauthorized/disabled admin access denied; `/api/ayambil/status` reports closed without verified messaging. These are **direct isolated backend checks**, not evidence that Apache forwarding works. Only the disposable fixture opens synthetic registration and uses a copied provider gate for test records; deployed hooks/gates remain unchanged. All provider calls in the harness are mocked.

### Dependency remediation and exact paths

No force flag, audit-fix command, broad upgrade or package replacement was used. Updated existing root/workspace overrides, added one source-map-js override, installed with lifecycle scripts disabled, then explicitly updated three stale resolved overrides. Initial npm install alone left those three old nodes invalid; `npm ls` exposed that and targeted npm update corrected them. Final npm ls reports the patched versions without invalid-node errors.

| Advisory path from direct dependency | Use in this project | Actual installed change | Result |
| --- | --- | --- | --- |
| root `concurrently -> shell-quote` | Development/start/build command orchestration; not browser attendee UI | 1.10.0 → 1.12.0 (minimum override 1.11.0) | Critical shell-quote and propagated concurrently findings resolved |
| web `eslint-plugin-import -> minimatch -> brace-expansion` | Lint/development | 5.0.9 → 5.0.12 | High findings resolved |
| web `eslint -> @eslint/eslintrc -> js-yaml` | Lint/development | 4.3.1 → 4.3.2 | High finding resolved |
| root/web `vite -> postcss -> source-map-js` | Build source-map processing | 1.2.1 → 1.2.2 | High finding resolved |
| web `jspdf -> dompurify` | Browser PDF library transitive dependency; actual vulnerable hook use not demonstrated | 3.4.14 → 3.4.16 | Low findings resolved |

Remaining audit: **9 affected packages, 0 critical, 6 high, 3 moderate, 0 low** (was 15/2 critical/9 high/3 moderate/1 low). Advisory counts include propagated dependency classifications, not nine independently demonstrated vulnerabilities.

| Remaining path | Why not automatically changed |
| --- | --- |
| `tailwindcss@3.4.19 -> chokidar@3.6.0 -> braces@3.0.3` | Build/watch path; latest published braces remains 3.0.3 and advisory covers it. No supported patch supplied by registry. Major watcher/CSS pipeline replacement is outside a minimal compatible fix. |
| `tailwindcss -> fast-glob@3.3.3 -> micromatch@4.0.8 -> braces` and direct micromatch path | Same unresolved braces root. npm labels fast-glob automatically fixable but does not establish a supported advisory-free Tailwind 3 tree. Do not force incompatible majors. |
| `tailwindcss -> postcss-nested@6.2.0 -> postcss-selector-parser@6.1.4`, plus Tailwind's direct parser | Moderate parser advisory fixes at 7.1.6; latest published 6.x is 6.1.4. Review major parser/CSS output compatibility separately. Propagates to postcss-nested/tailwindcss-animate. |
| web `xlsx@0.18.5` | Runtime Excel parsing in unrelated `AdminPassGeneratorPage.jsx`, not Ayambil CSV export. npm offers no patched replacement on its current package channel. Needs separate supported SheetJS distribution/licensing/update review and malicious-file regressions; unrelated uploader not replaced. |

Tailwind/chokidar/fast-glob/micromatch advisory paths execute during build/development, regardless of npm workspace metadata marking some nodes production. XLSX runs in an existing browser admin importer. No exploit was attempted. Original artifact remains; latest sanitized result is `tools/ayambil-audit-dependencies-remediation.json`.

npm reported a pre-existing Node engine mismatch: react-router 8.3.0 requires Node >=22.22.0; current runtime is 22.17.0. Build/tests pass here but do not override that support requirement. Use an approved supported runtime for release/build review. No hosting Node setting changed. npm also refreshed lockfile classification metadata; inspected diff retains prior user dependency/config changes and introduces only the five targeted resolved version changes, rather than a general dependency upgrade.

### Attendee-specific capabilities: approved local contract change

User explicitly approved **local implementation only**. Former PocketBase message-level capability returned all current passes in a booking; it remained usable after one attendee reissue. New smallest design attaches opaque random 64-character key, SHA-256 hash and seven-day expiry to each saved pass. The fields are hidden from ordinary collection responses. Download validates pass, attendee and booking active status plus finite unexpired expiry, then returns exactly one snapshot; an arbitrary supplied bookingId cannot expand access. Old message/booking capabilities are no longer accepted.

Prepared migration `1791640000_ayambil_attendee_downloads.js` adds hidden pass fields and a unique nonempty hash index, backfills active passes without changing existing numbers, snapshots or statuses, and refuses destructive down migration. **Not applied remotely.** Tested against disposable empty test databases followed by synthetic issuance; backfill of a pre-existing populated deployment has not been independently exercised and requires a backed-up staging rehearsal.

Pass issuance creates capability in the same transaction as the pass. Cancellation denies it; restoration permits an unexpired current active pass; reissue supersedes old pass/key and creates a new distinct pass/key. Messaging worker builds one link per active attendee, refreshing expired individual keys server-side. Existing message key columns remain for schema compatibility but are not accepted by the download endpoint. Private keys do not enter public booking confirmation or saved display snapshots. Replies remain `Cache-Control: no-store`, `Referrer-Policy: no-referrer`. URL keys remain fragments, removed from the browser address bar after capture.

Frontend private-download copy now describes one attendee's pass. Registration receipt can still show both attendee PDFs to the booking contact; this is intentional contact-booking authority, not permission for one private download key to list another person's pass.

Deployment implications: schema and matching hooks/client must be released as one reviewed change while gates remain closed; previously delivered booking URLs will cease working. Organisers must plan secure redistribution of attendee links. Reissue does not silently resend an accepted message: admin can save the newly issued PDF; any approved new-link delivery/reconciliation must follow the existing authorized messaging rules. No real template/message test was performed. Rollback requires a reviewed backup/code plan; reverting to booking-wide access would undo the approved privacy model. Do not apply this migration automatically to production.

### Actual post-change commands and results

| Command | Result |
| --- | --- |
| `npm view shell-quote@1.11.0 version`, `js-yaml@4.3.2`, `brace-expansion@5.0.12`, `source-map-js@1.2.2`, `dompurify@3.4.16`; parser 6.x inventory | Registry versions confirmed; braces latest is 3.0.3 |
| `npm install --ignore-scripts` | Succeeded; installed shell-quote/source-map patches, stale other overrides detected afterwards |
| `npm update brace-expansion js-yaml dompurify --ignore-scripts` | Succeeded; three targeted nodes corrected; no force |
| `npm ls shell-quote brace-expansion js-yaml source-map-js dompurify --all` | Final installed versions confirmed, no invalid nodes |
| `npm ls braces chokidar micromatch fast-glob postcss-nested postcss-selector-parser tailwindcss tailwindcss-animate xlsx --all` | Remaining paths traced as table above |
| `npm audit --json > tools/ayambil-audit-dependencies-remediation.json` | Final 0 critical / 6 high / 3 moderate; findings remain, not a clean audit |
| `npm run lint --prefix apps/web` | Passed after source/dependency edits |
| `npm run test --prefix apps/web` | Final **20 passed**, including two private links in one mocked confirmation |
| `node tools/ayambil.supabase.test.mjs` | Four suites / 49 reported SQL/Edge assertions passed; Supabase unchanged and isolated |
| `node tools/ayambil.integration.test.mjs` | Final **59 passed** on disposable real PocketBase after fail-closed expiry patch. Includes two-attendee isolation, fake bookingId ignored, active/missing/random/expired/cancelled keys, legacy booking denial, superseded denial, new reissued key and no-store, rollback/concurrency/auth/health/preflight |
| `node ../../node_modules/vite/bin/vite.js build --outDir ../../dist/apps/web` from apps/web | Passed, 2,325 modules, 9.48 seconds |
| `git -c core.fsmonitor=false diff --stat`, `diff --check`; lockfile/version review | Reviewed; existing sitemap EOF blank-line warning remains. Many event files remain pre-existing untracked files and thus do not appear in tracked diff. |
| Read-only public health Invoke-WebRequest | Still 200 text/html/non-JSON; live routing blocked |

No new Deno/hosted tests were required by unchanged Supabase source in this phase; previous audit Deno pass remains historical. No remote test fixture re-enabled.

### Browser/PDF limitations and final files

Saved browser permission still blocks the isolated preview. No screenshots, mobile 320–430/tablet/desktop inspection, face-crop verification, Maps destination resolution, newly generated PDF visual inspection, download-button interaction or native/physical print were performed in this phase. No alternate browser, raw CDP or headless workaround was used. Portrait paths, date/credit associations and A4 generator were preserved, but code inspection/build is not visual verification.

Changed in this phase: root/web package manifests, root lockfile; PocketBase service (per-pass issuance), messaging (per-attendee payload/download), new additive local migration; private download page (one-attendee wording); integration harness and frontend messaging regression; latest dependency artifact; this report. Existing proxy template/.htaccess remain unchanged because no verified upstream was available. No dependencies were replaced, no unrelated UI changed and no new QR/check-in feature added.

**Recommendation remains ready for isolated testing only.** Not ready for controlled release or production review until public JSON routing is established, remaining high advisories/engine support are resolved or explicitly risk-reviewed, attendee-key staging/backfill and redistribution are reviewed, and actual responsive/PDF/download/print checks complete. Production registration and WhatsApp gates/settings were not changed; no real messages or attendee data used.

## Final blocker-resolution recheck — 10 October 2026

User confirmed no authorized server connection is currently available and explicitly instructed that production configuration remain unchanged. The user also reported clearing preview permission; the actual browser policy continued to reject access. These external blockers remain unresolved, rather than being marked fixed.

### Exact operator information required

Provide sanitized, read-only outputs from the actual production hosting environment:

1. `apachectl -S` (or the actual platform's equivalent) identifying the HTTPS VirtualHost for vardhmancreativestudio.com, its included configuration files, DocumentRoot, SPA rewrites, existing proxy mappings and cache directives. Preserve SSL settings; do not send private certificate keys.
2. The PocketBase service/container definition or hosting process configuration: executable/working directory, listen argument, binding address, port, persistent data directory, process/network mapping and restart mechanism. Omit all secret environment values. If using systemd, sanitized unit content plus listener/process inventory; if containerized, sanitized port/network mapping instead. Do not assume either platform.
3. Apache module inventory (`apachectl -M` or equivalent): proxy, proxy_http, headers, rewrite; ssl if Apache terminates HTTPS. Confirm whether the hosting plan actually exposes server-level proxy configuration.
4. Verify whether Apache and PocketBase share a host/network; identify a reachable private upstream address **from Apache's network**. Repository `0.0.0.0:8090` is a listen declaration, not a valid verified proxy destination.
5. From that environment, direct GET to the verified upstream `/api/health`, reporting status/content type and expected health message. Supply public proxy/CDN ownership and current prefix stripping rules. No credentials or private records.

Only after those facts are established may the existing reviewed template be adapted inside the actual HTTPS vhost and installed/reloaded by an authorized operator. Then public JSON health, unauthenticated admin denial, status/preflight and static/SPA routing must be retested. No upstream was guessed and no hosting change was attempted here. Public recheck still returned **200 text/html, JSON false**.

### Fresh dependency/runtime and regression results

- `npm audit --json > tools/ayambil-audit-dependencies-final.json`: **0 critical, 6 high, 3 moderate, 0 low**, unchanged from remediation. Existing remaining paths were reviewed; `npm view braces version` still returns 3.0.3 and `npm view postcss-selector-parser@6 version` still tops out at 6.1.4. No newly available compatible patch resolves those paths; no force/major replacement performed. XLSX remains the separately documented unrelated admin import dependency.
- `node --version`: 22.17.0. Installed react-router 8.3.0 engines require >=22.22.0; Vite 6.4.3 permits >=22 and ESLint 9.39.5 permits >=21.1.0. A Node **22.x runtime at least 22.22.0** satisfies the inspected intersection. Configure an approved build/runtime environment accordingly; current successful tests do not erase its engine mismatch. The react-router-dom 7.18.2 / router 8.3.0 override is pre-existing and remains unchanged, pending broader routing compatibility review.
- `npm run lint --prefix apps/web`: passed.
- `npm run test --prefix apps/web`: 20 passed.
- `node tools/ayambil.supabase.test.mjs`: four suites passed, harness reports 49 local SQL/Edge assertions; provider mocked, hosted/multi-session checks not rerun.
- `node tools/ayambil.integration.test.mjs`: 59 real disposable PocketBase checks passed, preserving attendee-specific isolation, expiry, cancellation, reissue, no-store, authentication, direct JSON health and closed preflight.
- `node ../../node_modules/vite/bin/vite.js build --outDir ../../dist/apps/web` from apps/web: passed, 2,325 modules, 18.21 seconds.
- `git -c core.fsmonitor=false status --short` and `diff --check`: inspected current edits; existing sitemap EOF blank-line warning persists. Unrelated changes preserved.

### Actual browser attempt and limits

The computer-use/PDF instructions were read. `cua.getState()` returned the existing in-app browser. The approved synthetic fixture was started with `node node_modules/vite/bin/vite.js --config tools/ayambil-ui-preview.config.mjs`; initial sandbox dependency-resolution attempt failed, approved retry started loopback port 3005 successfully. No real backend or provider was used.

Despite the user's “preview permission cleared” confirmation, `cua.createBrowserTab('iab','http://127.0.0.1:3005/500-akhand-ayambil-vijayollas',{visible:true})` returned **“Browser Use rejected this action due to browser security policy… A saved user permission setting blocks this action.”** The denial explicitly forbids alternate browser/raw/indirect workarounds. None was attempted. The synthetic Vite session was stopped.

No new portrait/credit browser inspection, viewport checks at 320/360/390/430/768/1024/1366/1920, generated PDFs, glyph/page-boundary inspection, download clicks or native print checks succeeded or ran past this denial. They remain blocked. The saved site-specific denial must actually be removed in the owning browser permission UI; if it still persists, application support/settings diagnosis is required before another authorized attempt. Available plugin-permission tools do not control this browser URL setting, so no unrelated/global permission mode was changed.

Changed this recheck: this report and `tools/ayambil-audit-dependencies-final.json` only, plus existing local build output. No source/migration/lockfile change, server connection, live registration, provider sending, production DNS/settings/data or Supabase cutover occurred.

**Release classification: isolated testing only.** Controlled release review and production review remain blocked by actual API routing, remaining advisory/runtime review, staging capability-backfill review, and current visual/PDF/print verification.
