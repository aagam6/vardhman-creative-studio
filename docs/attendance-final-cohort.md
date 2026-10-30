# Final Attendance cohort and response follow-up

Automatic Attendance is disabled independently of transactional updates and
previous-day reminders. `AYAMBIL_ATTENDANCE_FINAL_CUTOFF` is an explicit ISO UTC
registration/approval cutoff. Configuration rejects this policy while automatic
Attendance is ON. Without it, the existing 48-hour policy is unchanged.

The cutoff policy removes only the delay for the fixed admitted cohort. Every
active booking in the current contact-event scope needs valid creation/approval
timestamps at or before the cutoff. A later family booking holds the contact.
Current consent, valid passes, response, overlap and repeated-name checks run at
preparation, claim and immediately before provider submission. No bookings,
passes or historical responses are updated by this policy.

Initial invitations retain their original initial deduplication key. A response
follow-up requires the exact original delivered/read initial outbox ID. It reuses
the encrypted original response token and existing review, without extending its
expiry or changing scope. Pending, uncertain, answered, revoked, expired or stale
records are held. The follow-up round is deterministically bound to the configured
cutoff date; repeated preparation produces one contact-event outbox record.
The approved Attendance template and live provider preflight remain mandatory.

Both initial backlog and follow-ups require explicit foreground batches of up to
20 exact IDs. Follow-ups are never selected by the transactional worker. Shared
exclusive ownership, durable claim dedup and 17-second pacing stay unchanged.
Unknown acceptance stops the batch; delivery pending is not retried. Secure
manifest/progress files stay private outside Git. No migration is required.
