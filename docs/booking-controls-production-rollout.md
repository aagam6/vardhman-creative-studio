# Booking controls production rollout

This release adds event-level booking modes, whole-group waiting, duplicate-review proposals and attendance proposals to the existing admin. Existing pass records/capabilities are not migrated or regenerated. Dispatch is deliberately unavailable.

## Activation gates
- `AYAMBIL_BOOKING_CONTROLS_ENABLED=true` and `AYAMBIL_BOOKING_CONTROLS_PRODUCTION=true` are separate, default-off gates.
- `AYAMBIL_NOTIFICATION_DISPATCH_ENABLED=false`; startup rejects `true`. Runtime suppresses automatic queue/reminder workers whenever booking controls are enabled, independently of historical environment flags. Messaging mutation endpoints are denied.
- The actual pool must match configured host/database/port; production accepts only the canonical HTTPS origin and loopback MySQL. Disposable fixtures retain their strict independent checks.
- Explicit migrations 009, 010, 011 are required. Startup performs readiness reads only. `ayambil_booking_controls_release.enabled` must be true after schema and event settings are ready.
- Manan: Open / 1800 / approval_capacity_configured=true. Sairam: Waiting / 0 / approval_capacity_configured=false. Zero is an unconfigured placeholder, not an organiser capacity; approval is rejected while waiting intake remains available.
- New production registrations and approvals write held notification intents transactionally, without legacy confirmation/pass queue jobs. No dispatcher exists in this release. Waiting/approval use distinct purposes; purpose/subject/round deduplication is unique. Future dispatch must resolve booking/reference and secure capability context, revalidate fresh template evidence and eligibility, exclude answered attendance contacts, preserve uncertain-provider state and never blindly retry.

## Operator order
1. Complete disposable policy/concurrency/auth/CSRF/old-pass/template tests, build and local UI inspection. Record hosting revision and non-secret flags; main auto-deploy is enabled.
2. Fresh read-only live baseline and private duplicate audit. Capture protected tables, event totals, Trash, message jobs/attempts/provider identifiers. Do not expose private data in PRs.
3. Set maintenance_active=true with maintenance_until approximately 10 minutes ahead, and registration_open=false in the existing server-side settings row. Verify public status and direct registration rejection. Expiry must not reopen. Drain in-flight writes.
4. Export a complete fresh live SQL backup, hash it, and restore only to a new isolated loopback disposable schema. Verify table counts/relationships and rehearse 009 -> 010 -> 011. No live restore.
5. Review scoped PR. Apply additive migrations explicitly after successful rehearsal. Configure both events as above, then enable the release row. Keep maintenance in effect.
6. Set feature flags while preserving all existing secret/environment values. Main merge may auto-deploy; activation must never precede schema/settings readiness. Notification dispatch remains false.
7. Verify exact deployed revision, health and authenticated booking/control endpoints, no-store, registration rejection during maintenance, event rules, private routes, old single/combined downloads and unchanged protected data/message attempts. Do not create a live test booking.
8. Explicitly remove maintenance and set registration_open=true only after checks pass. Verify normal status URLs: Manan Open/1800, Sairam Waiting/unconfigured approval. Check both public forms without submitting.

## Recovery
Keep maintenance explicit on a failed activation. Fix forward or revert code to the previous verified revision, turn new feature flags off, and retain additive tables; restore original registration settings only once the original API is healthy. No healthy live database restore, pass regeneration, message processing or Trash deletion. Report any remaining maintenance immediately.

## Evidence
Local run artifacts belong under ignored `tmp/booking-controls-release-20261025/`. Customer audit and complete backup are private local artifacts and must never be staged. Historical PDF evidence (8 files/34 pages) is reusable because the PDF renderer is unchanged; verify relevant actual existing downloads after deployment.
