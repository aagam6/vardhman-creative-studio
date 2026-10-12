# Operational improvements — local proposal, 12 October 2026

Branch: codex/express-mysql-production-integration. Base HEAD: dad1c7d09ad7bf2eb23a6d3dd49dd9e5d97492cc. Changes are uncommitted and not deployed.

## Implemented
- New/reissued pass links expire 24 hours after the selected reviewed evening start: November 3 20:00 IST for November 2; November 4 20:00 IST for November 3. Existing capability rows, tokens, snapshots, dates and downloaded PDFs are unchanged. Hash, revocation, expiry and booking/attendee ownership checks remain intact. No hosted extension/reissue occurred.
- Authenticated booking lists show real per-booking queue status counts and processing attempts when the queue is enabled. Current queue snapshots are explicitly not historical delivery timestamps. Disabled queue is reported as not loaded with unknown attempts, not fabricated zeroes. Public booking receipts do not query/expose private queue metadata.
- Removed full channel number from inspection JSON/UI, preserving health indication. BODY/template validation policy is unchanged.
- Production build omits development error/fetch/console/navigation instrumentation. Verified generated HTML contains no error-forwarding instrumentation. Development editor behavior remains available.
- Admin/pass SPA responses carry no-store and no-referrer, with regression checks. Other public routes/assets retain normal behavior.
- Added GET /api/leads/health: read-only zero-row schema/access check, no-store JSON ready boolean, 503 on missing fields/table or unavailable initialization. It does not INSERT, migrate or expose schema/driver errors. Actual lead POST security/compatibility unchanged. vcs_leads hosted availability remains unverified until an authorized post-deployment GET; do not apply 003 automatically.

## Queue ownership assessment (read-only)
Root runtime/start/workspaces use Express; no new automatic Express worker, startup send or cron added. Normal processing HTTP action retains explicit approval and authenticated CSRF gate. PocketBase cron source apps/pocketbase/pb_hooks/ayambil-messaging.pb.js still defines ayambil_whatsapp_outbox every minute for the legacy store. Hostinger account cron listing returned zero jobs. This does NOT prove an independent PocketBase process/internal cron is stopped. Sole queue ownership remains BLOCKED.

Required Hostinger/support evidence: identify all running application/daemon services and their executable/startup configuration; confirm whether any PocketBase instance loads this hook, and whether any external scheduler calls message processing. Report only service identity, owner and scheduler status, never credentials/records. Retire legacy worker only through a separately approved recovery/ownership plan after preserving uncertain/provider references. No worker was stopped here.

## Verification
- API: 50 passed, 0 failed, 2 intentional engine skips.
- Frontend: 35 passed, 0 failed.
- Lint and full production build: exit 0, 2325 modules.
- Real disposable local MariaDB 11.8.9: 51 passed, 0 failed, 1 MySQL skip.
- Real disposable local MySQL 8.0.46: 51 passed, 0 failed, 1 MariaDB skip; HTTPS 105 assertions.
- Engine expiry assertions read actual stored timestamps and retain legacy-token/revocation/idempotency tests.
- Fresh local test schemas only, schema-restricted users and owned processes; providers mocked. No hosted SQL, migration/bootstrap, record writes, message sends or setting changes.
- git diff --check passed. Production browser/live verification remains blocked by saved permission.

Release notes: reviewed feature-branch changes; commit/push authorized on 13 October 2026. No merge or deployment. Production WhatsApp BODY validation remains unresolved by explicit request. Keep normal-processing and BODY override flags false. Existing expired links are not repaired automatically; that would require a separate authorization and reviewed exact-record procedure.
