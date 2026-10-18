# Booking reminder scheduler — prepared 18 October 2026

## Approved behavior

- Manan, 2 November: start 1 November 2026 at 18:00 IST (12:30 UTC).
- Sairam, 3 November: start 2 November 2026 at 18:00 IST (12:30 UTC).
- Separate reminder-only worker; normal confirmation/pass worker remains disabled.
- One booking-contact reminder, irrespective of 1–6 participants. Existing attempted/submitted/failed/uncertain reminders prevent another automatic attempt.
- Process one eligible booking every 15 seconds; messages start at 18:00 and are not all simultaneous. Only the previous-day 18:00–midnight IST window is allowed. No next-day catch-up.
- Active, WhatsApp-consented booking and active untrashed attendee pass required; eligibility is checked again before provider submission.
- No writes to bookings, attendees, passes, capabilities or schema. Queue rows are created/claimed only inside the due window. Duplicate untouched queued reminder rows may be cancelled; submitted history is preserved.
- Timeout/uncertainty/preflight failure pauses scheduler and requires review; no blind retry. Restart never repeats a claimed reminder.
- General manual preview/send remains available under its existing approvals; reminder duplicate guard also applies there.

## Activation (not performed yet)

Deploy reminder backend files only (exclude unrelated local dashboard changes), then set AYAMBIL_WHATSAPP_REMINDER_SCHEDULER_ENABLED=true for vardhmancreativestudio.com. Keep AYAMBIL_WHATSAPP_AUTO_WORKER_ENABLED=false. Existing sending, queue-owner and reviewed-template settings are required; do not change secrets or template mappings.

Read-only admin/whatsapp response includes worker.reminder.enabled/active and time=18:00, timezone=Asia/Kolkata, daysBefore=1. Verify readiness and scheduler status after deployment. On 18 October the due-date gate prevents all reminder database work and provider requests even when enabled. No test message is authorized.

Rollback: set the reminder scheduler flag false and restart/redeploy the same app. No schema rollback or booking/pass changes needed. Prior message intent remains recorded and must not be resent blindly.

## Validation

103 API tests passed, zero failed. Two real database integration suites remain opt-in/skipped (no disposable database engine available in this session). New mocked-provider tests exercise both evening boundaries, no early/startup send, one booking-level contact, repeated ticks/restart deduplication, invalid/cancelled/prior attempt exclusions, uncertainty handling, and no booking/pass writes. No live message or queue processing was invoked.
