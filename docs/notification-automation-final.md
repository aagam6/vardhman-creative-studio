# Transactional messaging, selected registrations and reminders

This release does not migrate or modify existing booking/pass data. Legacy queue rows remain historical and are never bulk processed by the new sender.

## Automatic behavior

Existing activation cutoff is retained. New confirmed registrations receive one confirmation with the combined-pass CTA; waiting forms receive one waiting acknowledgement. Whole-group approval creates one approval with the combined-pass CTA, sharing the admission-confirmation dedupe identity. Do not also send a separate confirmation/pass link when that CTA has already been submitted. Cancel/restore does not authorize replay.

## Reminder activation

Set `AYAMBIL_BILINGUAL_REMINDERS_ENABLED=true` only after deploying this release and verifying the approved `ayambil_event_reminder` / en / Utility contract through authenticated no-send inspection. Keep the legacy reminder scheduler, legacy normal/manual processing and auto-worker OFF. Keep the existing bilingual worker, owner and original activation cutoff.

The new worker shares existing ownership, lease and 17-second pacing. It selects reminders only during the previous calendar day 18:00–23:59 IST: Manan starts 1 November 2026 18:00 IST; Sairam starts 2 November 2026 18:00 IST. No early send or next-day catch-up. One initial reminder per active, consented booking with valid passes. Legacy attempts/provider histories block replay. Unresolved duplicate/name holds, cancellation and stale envelopes are checked again before submission. Unknown outcomes stop processing without automatic send retry. No test customer message is required to activate a future schedule.

## Manual operation

In `/admin/ayambil` Bookings, select up to20 confirmed/waiting registrations. Open WhatsApp workspace → Send messages to selected registrations. Choose confirmation+combined link, waiting acknowledgement, approval+combined link, missing standalone pass link, or due reminder. Review → Prepare eligible (no send) → explicit reviewed Send. Previously submitted, ineligible and uncertain records are excluded. Stop button finishes the current request. Successful batch preserves a healthy automatic worker; error/uncertain result pauses ownership. Do not use legacy Send/Retry controls.

## KPI meaning

Old queue pending is historical, not a count of unique people still needing a message. Compare modern history before acting. New outbox blocked holds are separate from provider failures. Sent/accepted is not delivered. Receipt checking must never resubmit.

## Rollback

Turn OFF only `AYAMBIL_BILINGUAL_REMINDERS_ENABLED` to disable the new reminder schedule, preserving transactional automation. For an actual sending safety incident pause the owner and disable dispatch/worker with a saved checkpoint; preserve all attempt/provider IDs. No database schema rollback.
