# PocketBase legacy inventory and migration readiness — 12 October 2026

Branch: codex/express-mysql-production-integration. Base HEAD remains 83d9c3f427a2f61a0b41572b2e420ae53d01d265. All integration changes are local/uncommitted. Original staging checkout and user assets preserved.

Decision: **NO-GO / BLOCKED**. No authentic private source export, file bundle or freshly verified destination schema was supplied. Collection counts are UNKNOWN, not zero. This phase performs repository inspection and synthetic offline validation only. No hosting connection, SQL query, migration003/bootstrap/import, database/user/assignment change, queue processing, send, runtime removal, commit/push/PR/deployment.

## Remaining dependencies — repository evidence

| File/location | Classification | Replacement still required |
|---|---|---|
| package.json dev/start, workspaces apps/*; apps/pocketbase/package.json | Active configured startup/workspace | Switch reviewed root startup/development workflow to Express only after route/data cutover; preserve full normal frontend build |
| apps/web/package.json and package-lock.json pocketbase package | Installed runtime dependency; retained SDK regression usage | Remove runtime SDK only after remaining consumers/test dependency separation; no removal this phase |
| apps/web/src/lib/pocketbaseClient.js | Unreferenced frontend source after lead replacements (source search) | Retire after final import/build audit; no current active source caller found |
| apps/web/plugins/vite-plugin-pocketbase-auth.js and apps/web/vite.config.js | Active development-only injection/configuration, not production plugin | Retire database_preview_auth parent-message/localStorage superuser flow and PB filesystem allow path, replace required editor auth functionality separately; do not silently broaden access |
| apps/pocketbase/pb_hooks/ayambil-registration.pb.js; ayambil/service.cjs | PB status/register/admin-bookings/change/auth business runtime | Selectively ported Express app/store/auth handles new SQL data; migration/collision/capability checks still incomplete |
| apps/pocketbase/pb_hooks/ayambil-messaging.pb.js; ayambil/messaging.cjs/vardhmanflow.cjs | Internal minute cron, PB queue/retry/download/reconciliation | Explicit source-worker retirement and sole SQL ownership after preserving histories/references; Express false normal gate does not control PB cron |
| apps/pocketbase/pb_hooks/builder-mailer.pb.js | SMTP-disabled fallback onMailerSend to private builder mail API | Determine actual password-reset/verification/operational email requirements; reviewed mail/re-enrolment replacement needed if used; no sender/key read |
| apps/pocketbase/pb_hooks/external-dashboard.pb.js | PB root dashboard HTML from version-specific Hostinger CDN | Admin/editor infrastructure, not a lead form; determine required usage, then retire or replace securely |
| apps/pocketbase/pb_hooks/custom-migrations-cmd.pb.js; PB migrations and .pocketbase-version/binary metadata | Operational PB hooks/commands | Archive evidence/fixtures outside deploy; never execute migration/update/revert to perform this audit |
| deployment/apache/pocketbase-proxy.conf.template | Historical/proposed routing template, not proof of installed upstream | Replace verified route ownership only in later reviewed cutover; placeholder host is not runtime evidence |
| tools/ayambil.integration.test.mjs, browser-preview.mjs, ui-preview.config.mjs, flow-inspect.mjs | Local regression/preview/legacy operator tools | Keep evidence/fixtures independently; not production start dependencies |
| tools/ayambil.supabase.test.mjs, supabase/*, tools/supabase-pass-preview/* | Legacy alternate test/backend evidence | No active frontend Supabase import found. Actual remote use unknown; not proof absent |
| apps/web/src/lib/ayambilRegistration.js, leadClient.js; LeadCaptureSection/ComingSoonPage | New Express callers | Lead callers replaced; no active frontend import of PocketBase SDK found outside unused client file |

All hook deployment/worker execution is UNKNOWN without actual source runtime evidence. Empty hPanel cron listing from earlier audit does not exclude PocketBase's internal cron or external consumers.

## Confirmed source schema — repository, not live collection confirmation

Sources: apps/pocketbase/pb_migrations/1791590400_ayambil_registration.js, 1791621000_ayambil_single_evening.js, 1791622000_ayambil_vardhmanflow.js, 1791636000_ayambil_pass_terms.js, 1791640000_ayambil_attendee_downloads.js; corresponding service/messaging hooks.

- **leads**: name/email/company/message confirmed as request fields by two frontend callers. No tracked lead collection schema found: actual types, required flags, limits, extra fields, record counts, collection ID and files UNAVAILABLE. Preflight's four-field minimum is a proposed normalization contract, not a claim about live schema.
- **ayambil_admins**: auth collection; enabled bool; email/password auth, timestamps; enabled auth rule. Built-in auth fields/export access must be verified live. Password hashes/token keys not needed in the normalized export; do not transfer credentials or superusers as application admins.
- **ayambil_bookings**: number/contact_name/mobile/request_hash/payload_hash/status, created/updated; later event_date, whatsapp_consent, consent_at; terms_version/terms_accepted_at. Unique number/request hash. Hashes are SHA256; private request token itself is not stored. Live application of all revisions UNKNOWN.
- **ayambil_attendees**: booking relation, full_name, dates select (historically up to two), status/timestamps. Current hooks require one evening/max two attendees; older records may violate current target rules, never assume otherwise.
- **ayambil_passes**: attendee relation, number, snapshot JSON, status/timestamps. Active-pass uniqueness; later hidden download_key/download_hash/download_expires. Hook generates random alphanumeric64 key and SHA256 hash, seven-day expiry. Saved snapshot includes event/attendee/number/session/issuedAt.
- **ayambil_audit**: actor admin relation, booking relation, action/timestamps. Actual extra fields/action values/counts unknown.
- **ayambil_messages**: booking relation, unique booking/download_hash, status, provider_ref/failure/provider_history JSON/attempts/attempted_at/accepted_at/delivered_at; download_hash/hidden download_key/download_expires; later provider and sent status. Old booking capability is deliberately NOT accepted by current per-attendee download hook.
- No file fields in tracked Ayambil migration definitions. That does not establish zero actual files; exported live schemas must enumerate file fields, including any custom lead/other collection fields.

Source current download checks pass/attendee/booking active, capability hash and expiry; cancelled/superseded/expired links fail. Do not recreate or issue fresh capabilities as a migration shortcut.

## Private export workflow — prerequisite artifacts

Do not export through public booking/admin APIs: their responses intentionally redact hidden fields. Operator must use an approved authenticated read-only backup/export mechanism for the actual PocketBase service, preserving its database/files consistently. No deployment/migration command is required. Obtain:

1. Complete collection definitions (IDs/names/types/field definitions/relations/hidden flags/indexes/rules), application collection list and known system exclusions; unexpected application collections stop review.
2. Complete paginated records for the seven supported collections, including hidden capability/hash/expiry, consent/terms, request/payload hashes, audit relations and message provider/history/attempt timestamps. Include empty arrays only when independently verified source counts are zero. Do not export passwords, API settings or tokens unrelated to pass capability retention.
3. Consistent capture metadata: stable non-secret sourceInstance identifier, capture timestamp, complete flags, per-collection verified count. These are operator-supplied assertions; the offline tool checks internal consistency, not live authentication or snapshot provenance.
4. Associated bytes and private manifest for every declared file field/reference; SHA256/byte sizes. Record unreferenced files separately for manual retention review; do not delete them. Missing or unknown fields/files block migration.
5. Private immutable backup and SHA256 manifest, actual worker/route/deployment identities and evidence of consistency during capture. No write pause, worker setting change or export access grant is authorized by this phase.

Normalized private JSON contract (store outside Git/public web folders; no real examples in source):

```json
{
 "formatVersion":1,
 "metadata":{"sourceInstance":"<stable private source identity>","capturedAt":"<ISO timestamp>","schemaComplete":true,"recordsComplete":true,"filesComplete":true,"recordCounts":{"leads":0,"ayambil_admins":0,"ayambil_bookings":0,"ayambil_attendees":0,"ayambil_passes":0,"ayambil_audit":0,"ayambil_messages":0}},
 "schema":[{"id":"<actual collection ID>","name":"<collection name>","fields":[{"name":"<field>","type":"<actual type>","collectionId":"<actual relation target if applicable>"}]}],
 "collections":{"leads":[],"ayambil_admins":[],"ayambil_bookings":[],"ayambil_attendees":[],"ayambil_passes":[],"ayambil_audit":[],"ayambil_messages":[]},
 "files":[{"collection":"<name>","recordId":"<source ID>","field":"<file field>","filename":"<original name>","path":"files/<private relative path>","size":0,"sha256":"<64 hex digest>"}]
}
```

Zeros/empty arrays above are structural examples, not real counts. Every schema/required field must exist, every record must include created/updated and required hidden fields (empty values only where valid). File-bearing unknown fields intentionally remain unmapped blockers even if bytes verify; the current target has no file storage mapping. Do not suppress them to make preflight green.

Run only after receiving that authorized private artifact:
`node apps/api/tools/legacy-export-preflight.mjs <private-export.json>`.
CLI exits0 for internally consistent supported inventory; exits1 with sanitized aggregate issues on failure. Both retain migrationReady:false. No private identities, unknown-field names/values, provider references, filenames/paths, email, phone or capability strings are printed. Files read only below the realpath-confined files/ subdirectory; traversal/symlink escape and hash/size mismatch fail closed. There is no SQL/HTTP/import mode.

## Mapping specification — proposal, not an implemented importer

| Source | Proposed MySQL mapping / preservation condition |
|---|---|
| Source collection identity and record ID | Stable UUID mapping from a fixed namespace/sourceInstance/collection/ID. Keep exact source IDs and private crosswalk. Do not reuse PB15 IDs in CHAR36 or choose random IDs on rerun |
| leads fields/timestamp | vcs_leads UUID,name,email,company,message,created_at; preserve original text/time after length/collation checks. File/custom fields need explicit mapping, not dropping |
| admin email/enabled/source identity | ayambil_admins mapped UUID and unique normalized email; collision against existing admin is a manual decision, never overwrite. Imported admins disabled until secure re-enrolment. Do not import incompatible password hashes, default passwords or existing sessions |
| booking number/contact/mobile/event/status/terms | ayambil_bookings retains exact number/date/status/terms timestamp. Preserve source consent_at in dedicated reviewed provenance because target has no column. No invented consent/time/terms version |
| attendee booking/name/dates/status | ayambil_attendees mapped booking/UUID/full_name; ayambil_registrations exact single evening. Ordinal1/2 must reflect verified original order; older multi-evening or >2 bookings blocked |
| pass attendee/number/snapshot/status | ayambil_passes mapped UUID, exact snapshot/number/history; deterministic verified revisions. Check unique current_attendee covers both active AND cancelled, whereas original PB index covers active only |
| capability hash/key/expiry | ayambil_capabilities maps SHA256 to exact pass/expiry and reviewed revocation state. Never log raw key or reissue it automatically. Existing Express hex-only validation rejects legacy alphanumeric tokens: runtime compatibility needs a separately reviewed fix before preservation can be claimed |
| request_hash/payload_hash | ayambil_idempotency.key_hash preserves request_hash. Preserve legacy payload hash in immutable/provenance record; derive target hash only after verified reconstruction. PB validate serialization puts attendees before eventDate, Express puts it after other fields; copying payload_hash blindly breaks retries. Verify original attendee ordering by source hash (at most2 permutations) and fail if reconstruction ambiguous/impossible |
| audit actor/booking/action/time | ayambil_audit mapped actor/booking UUID, preserved action/created time; check target VARCHAR24 and source action semantics. Never invent actor IDs or omit unmapped audits |
| queue provider_ref/status/attempts | ayambil_message_queue retains valid unique provider ID, booking mapping, attempt count and source history; current schema lacks several source timestamps/history and raw legacy status provenance, so preservation requires separately reviewed archive/provenance mapping |
| old queued/attempted/uncertain jobs | Do not reconstruct and auto-send as new notifications. Need an explicit persistent import hold/eligibility mechanism plus preserved original status/history. Existing queued rows are selectable by generic runOne; disabled normal flag alone is not a permanent per-row safeguard. Do not fabricate delivered/cancelled state to avoid schema work |

Ledger: proposed vcs_imports(source_key,content_hash,imported_at) alone is insufficient for the full identity/provenance requirement. Before any importer, review a persistent sourceInstance/collection/sourceID/targetTable/targetID mapping and encrypted preservation of unmapped historic fields (or a reviewed equivalent immutable archive/crosswalk). No DDL added in this phase. Content hash must cover a versioned canonical source representation; same key/hash verified target identity and constraints -> no-op; same key/different hash -> conflict, never UPDATE silently. Target writes and ledger insertion in one transaction, no dual write. Collision preflight covers booking/pass numbers, email, request hashes, capability hashes, provider refs, source IDs, collation-equivalent values, current passes and ordinal relations. No hosted target comparison occurred.

Re-enrolment: existing approved operator-only private-input scrypt flow must be extended separately for exact migrated disabled admin IDs, after identity verification, with hashed bounded-expiry single-use authorization, no public unauthenticated bootstrap. Password never in command arguments/logs/source/chat. Invalidate old sessions; enable only after verified secure password completion. Preserve original email/enabled state in provenance. Actual reset/re-enrolment implementation and provider/email delivery remain BLOCKED, not assumed functional.

## Destination compatibility — repository definitions only

Inspected apps/api/migrations/001_ayambil.sql and 002_whatsapp_queue.sql:15 expected InnoDB Ayambil tables, versions1/2, CHAR36 identities, CHAR10 dates, max2 attendee ordinals, FK relations, unique current passes/capabilities/idempotency/provider IDs; utf8mb4_unicode_ci. CHAR/VARCHAR collation/case folding may collide with case-sensitive source IDs/values; compare before import. Source timestamps must normalize losslessly to UTC DATETIME(3); retain originals in provenance when precision differs.

Inspected 003_website_data.sql proposal: vcs_leads/vcs_imports separate namespace. It was NOT executed or modified. No actual local SQL server was queried or initialized this phase; prior disposable-engine results are historical evidence, not a current destination comparison. Actual hosted versions/definitions/counts/grants are UNVERIFIED under this task's exclusion. Existing database/user/schema versions1/2 unchanged.

## Verification and go/no-go

Changed only apps/api/tools/legacy-export-preflight.mjs, apps/api/tests/legacy-export-preflight.test.mjs and this report. Pre-existing integration/staging changes preserved. Offline tests:5pass/0fail/0skip,exit0; node --check exit0. git diff --check exit0. Synthetic fixtures only; no real export was opened. No API/build/engine rerun required because runtime/SQL code was unchanged.

PASS: remaining-source inventory, strict offline validator, synthetic field/file/hash/relationship/message tests, repository mapping analysis.
BLOCKED: genuine source export/schema and source counts; complete file bytes; destination live metadata/record collisions; capability/runtime compatibility; payload-hash/order migration; ledger/provenance/import holds; secure admin re-enrolment; sole queue ownership; backup/restore/rollback acceptance.
NOT RUN: private real-export validation, SQL queries/migrations/imports, runtime removal, hosted writes/sends/cutover, commit/push/PR/deployment.

Before GO: authenticate/verify source and target identities privately, capture consistent schema/records/files/counts; all unknown mappings resolved; capability/idempotency retention demonstrated offline; import ledger/holds reviewed; admin enrolment approved; rollback preserves new records; old worker retirement/unambiguous queue owner; no automatic sends; supported whole-site Express routing and cache/TLS checks. STOP now at missing artifacts. No migration completed and no production-ready claim.
## Later feature-delivery scope change — 12 October 2026
Operator now approves Express/MySQL as active backend with legacy PB records outside this delivery. Rootstart/dev and workspace remove PB runtime; frontend SDK/client/dev auth plugin removed, SDK retained dev-only for historical tests. These supersede the earlier active-runtime inventory status, without deleting hosted data. Pass validation now accepts exact64alphanumeric with unchanged hash/expiry/revocation/ownership checks, so nonHexPassTokens is inventory-only, no longer a runtime blocker. New engine tests prove mixedcase/revoked/invalidkeys. All other legacy import/hash-order/consent-history/crosswalk/admin migration gaps remain; no migration claimed. Unverified live source worker and targetschema/cutoverbackup remain production blockers.
