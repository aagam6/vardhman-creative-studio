# Notification sender release package — 25 October 2026

## Status
Production-capable source, additive migration 012, server wiring, authenticated admin controls, optional worker and local verification implemented. All flags remain default-off; NOTHING has been pushed, migrated or enabled live in this task. No real provider messages or live data access. No import-time migration or sending. Existing pass/PDF layout unchanged.

This supersedes earlier reports saying production wiring had not been implemented. Those reports describe earlier snapshots, not this package. This is code ready for review/release, not proof of real-provider delivery or a claim that Git push alone activates the service.

## Components
- notification-sender.mjs: encrypted durable production outbox; canonical initial admission-confirmation key shared by confirmed/approved; waiting acknowledgment key; event/contact/purpose/round review keys; per-booking/round gate notices. Current authoritative recipient, consent, names, active capabilities and review token/expiry/response are revalidated. Prepared revision changes block rather than silently replace messages.
- notification-service.mjs + vardhmanflow.verifyBilingual: existing provider API contract, exact template ID/name/en/APPROVED/UTILITY and full body/header/CTA definition comparison. Missing provider full definition fails closed; no operator-snapshot fallback for actual sending. Authenticated successful definition refresh updates in-memory approval evidence only.
- 012_notification_sender.sql: new owner/outbox/audit tables only. No changes to existing bookings/passes/queue. Owner starts paused. Provider IDs unique, private inputs AES-GCM encrypted with existing queue key, key rotation requires deliberate re-encryption/recovery planning.
- All legacy queue manual/worker/reminder/test dispatch entries reject under booking-controls mode, plus final submit boundary check. This is independent of HTTP route guard. New service is the only supported owner; legacy queue is neither imported nor replayed. Prior attempted/uncertain confirmation blocks new initial admission confirmation.
- Bilingual dispatcher/handover share a MySQL advisory lease for the whole external-send window; owner revision and in-flight/uncertain jobs checked under row locks. Handover waits/fails rather than cancelling an in-flight request. Dead process releases its lease; stale processing is held uncertain after five minutes, never reset to ready. Unknown receipt persistence/collision holds uncertain. No retry/resend endpoint.
- Delivery reconciliation uses authenticated provider status GET and locks/rechecks provider ID/current status before update. Delivery/read never regress. Known-ID accepted/sent jobs can be polled by optional worker once per minute per job; unknown-ID uncertainty remains operator-review only. No unauthenticated webhook: provider webhook contract was not verified and is unnecessary for the supported polling path.
- Main /admin/ayambil Event settings has Notification queue & delivery: paused owner/revision, held intent preparation, private-review-token input, prepared status/attempts, explicit one-message confirmation, no-resend status check, and bounded entry-notice preparation for up to 20 selected main-list bookings. Private payloads/tokens excluded from list. Existing admin auth, CSRF, Origin and rate limits apply.
- Optional notification-worker.mjs is separately off. Only new transactional intents created after an explicit reviewed activation timestamp are eligible. Duplicate/attendance invites remain deliberately manual. It stops on uncertainty/error/ownership change, serializes ticks and never replays historical queues.

## Final checks
- Full suite: 210 total / 207 passed / 0 failed / 3 pre-existing opt-in suites skipped.
- Production service fresh MySQL: 35 assertions passed. Migration applied over pre-existing synthetic passes, old capability download preserved, concurrent sends one mocked post, default-off and stale-owner rejection, exact metadata/category checks, Waiting/approval, answered review exclusion, timeout hold, entry-notice replay dedup, auth 401/CSRF 403/read API 200/dispatch-off 403.
- Supporting fresh MySQL suites: 26 ownership/reconciliation, 52 real-adapter/queue contract, 42 sender lifecycle assertions passed.
- Production API test used five in-memory mocked POSTs; external network/provider calls ZERO. Supporting suites also use in-memory transports, not actual delivery.
- Frontend build passed; syntax/diff whitespace checks passed. Existing normal protected queue/pass records unchanged except explicit synthetic fixture setup (approval/cancel/Trash/rejection scenarios). No production DB accessed.
- Latest desktop/mobile screenshot QA is NOT possible in this chat: browser inspection tool absent. Frontend builds; visual acceptance still requires the connected-browser chat. Do not claim screenshots were verified.

## Defaults / activation fields
AYAMBIL_NOTIFICATION_SERVICE_ENABLED=false
AYAMBIL_BILINGUAL_DISPATCH_ENABLED=false
AYAMBIL_BILINGUAL_WORKER_ENABLED=false

Service true requires existing booking-controls safety boundary and matching actual MySQL pool/canonical origin. Dispatch true additionally requires AYAMBIL_BILINGUAL_DISPATCH_APPROVAL=reviewed-v1, existing WhatsApp credentials/encryption configured, old normal/manual/auto/reminder flags all false. This release keeps the earlier AYAMBIL_NOTIFICATION_DISPATCH_ENABLED guard untouched; never set that obsolete flag true.

Worker true additionally requires service+dispatch and AYAMBIL_BILINGUAL_ACTIVATION_AT exact ISO timestamp. Choose a fresh timestamp at reviewed activation, not a historical default. It must not silently send previously accumulated intents. Owner must be explicitly assigned bilingual through audited admin operation. Manual-only operation may leave worker false.

## Reviewed deployment procedure (NOT performed)
1. Review exact scoped diff/file list. Do not stage all files; existing unrelated dirty work remains.
2. Stop/drain any OLD binary's sender processes before cutover. Flags in new code cannot fence an already-running obsolete binary. Record legacy attempts/provider IDs; reconcile any preparing/sending/uncertain jobs. Do not reset them to queued.
3. Fresh complete live backup and integrity/isolated restore check; preserve hosting config securely. Do not restore over healthy live data.
4. Push/PR/merge under authorization. Keep all new flags false during auto-deployment. No existing booking maintenance required for additive tables alone unless the release operator chooses a short controlled window.
5. Apply migration 012 explicitly after backup; no startup migrations. Validate new tables and paused owner. No booking/pass/queue rewrites or backlog import.
6. Enable service management only, dispatch/worker false. Check admin queue API 200 and UI; verify exact current provider definition read-only. If API does not expose body/header/button metadata, keep dispatch blocked and resolve provider access; do NOT weaken verification.
7. Reconcile protected counts/old pass access and API no-store/readiness, booking rules preserved (Manan1800, SairamWaiting with organiser's current capacity). Deploy rollback is previous app revision + new flags false; retain additive tables/audit. Never restore backup for a normal successful deployment.
8. Sending requires separate explicit authorization for a controlled recipient/intent. Then set reviewed independent dispatch approval, keep legacy flags false, assign bilingual owner. Worker remains false until separately reviewed cutoff/automatic operation approved. Do not treat this file/user's current local-only request as send authorization.
9. Actual provider acceptance/delivery cannot be certified without this controlled send. This external acceptance check remains a release operation, not unfinished local implementation.

## Limitations and invariants
No exactly-once external-delivery guarantee: a crash after accepted POST but before storing provider ID can leave unknown acceptance. It stays Uncertain and blocks automatic continuation/owner transfer; never blindly resend. Delayed cancellations/responses after a claim cannot revoke an external submission already in flight. Claims and current data are checked immediately before submit; UI must report provider acceptance separately from delivery. Provider permission/template-body availability are runtime preflight dependencies, not assumed from mocks. No production manual retry override, webhook, or historical bulk-send shortcut was added.
