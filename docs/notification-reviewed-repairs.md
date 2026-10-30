# Reviewed notification repair

No migration, environment change or startup data repair. Existing worker/cutoff,
reminder windows and submission guards remain unchanged.

## Blocked Attendance

Advanced tools accepts one exact blocked outbox ID. Preview requires approved
template validation, a valid original encrypted link, zero attempts, no provider
ID/claim, no answers/decisions, current consent/passes, the 48-hour delay and all
contact holds. Any related attempted/uncertain invitation blocks repair.

Explicit save rechecks source and owner inside the shared lease/event transaction.
It compares both old and target snapshot/revision hashes, updates only the review
snapshot and blocked draft hash/state, and audits the transition to Held. Envelope,
token, expiry, round, dedup key, booking/pass/capability records stay unchanged.
Sending remains a separate exact-ID guarded action. No automatic retry.

## Wrong country code

An explicit admin correction requires the exact saved number, the corrected
Indian number and identical final ten digits. Documented authenticated provider
contact-history GETs must be complete; the corrected recipient must have no template history. Only explicitly typed
non-template messages are allowed; unknown types and template markers block correction. Each old attempted legacy message requires encrypted recipient
evidence or membership of the old recipient's provider history. Missing evidence
blocks correction; no fabricated sent/delivered state or deletion is used.

Under shared owner/event locking only the canonical booking mobile is changed.
Pass numbers, names, capabilities and download links are retained. Unanswered
review links associated with the wrong recipient expire; their old receipts and
responses are preserved. An audit records the exact wrong-recipient legacy IDs.
Only these unchanged IDs are distinguished from messages to the corrected number;
any new/unrecognised legacy attempt still blocks initial sending. A modern
confirmation carries the combined-pass CTA, so a second standalone pass message
is refused. Attendance must still satisfy its 48-hour confirmation delay.

## Release and rollback

Run full API/web regression, build and disposable MySQL repair/country suites.
Release through scoped PR; keep unrelated work unstaged. No queue activation or
configuration edits. Verify health and current sender ownership after deployment.
Use supported UI actions only; save exact prepared/submitted IDs in private local
evidence. Reconcile a timed-out action before doing anything else. A code rollback
must never erase a submission, restore a database, or replay an old message. Do
not reverse a recipient correction automatically after a message was submitted.
