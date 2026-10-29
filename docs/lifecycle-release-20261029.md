# Ayambil lifecycle release — 29 October 2026

Scope: derived duplicate worklist/KPIs, current attendance counts, strict 48-hour attendance eligibility, opt-in automatic attendance after existing activation cutoff, new five-field Entry timing revision, held-only audited hash refresh, known-receipt status-only observation.

No schema migration. No booking/pass/response deletion or source edits. Existing review history retained. Manual cancellation makes obsolete overlap disappear from active worklist. Current applied/reviewed scopes resolve holds; new overlap is held again.

Attendance delay is 48 hours after latest current family booking creation, waiting approval or successful confirmation claim timestamp. Final source checks run at preparation and immediately before submission. Automatic Attendance is opt-in: AYAMBIL_BILINGUAL_ATTENDANCE_ENABLED=true. Existing unanswered campaigns are not repeated; prepared zero-attempt post-cutoff drafts are reused after restart. New links are only for eligible never-invited contacts and are encrypted with the outbox atomically.

Entry activation flags (do not alter v1 snapshot flags):
AYAMBIL_ENTRY_REVISION_POLICY=ayambil-entry-reviewed-2026-10-28-v2
AYAMBIL_ENTRY_REVISION_SHA256=4ec8dc5f63a5ab8844f16791b040c762e126d6192263b26e93a1049ae7625164

The operator-reviewed provider UI definition matched exactly; current authenticated unique UUID/name/en/APPROVED/UTILITY/channel verification is still mandatory. API supplied components must match including footer/button; omitted components use only this explicit versioned reviewed snapshot. New reminder uses five fields and one existing deterministic combined-pass suffix. Dates unchanged: 1 Nov18:00 IST for Manan, 2 Nov18:00 IST for Sairam. No early/catch-up sends.

Held draft refresh requires exact IDs, state held, attempts0, no claim/provider ID, matching old hash and current authoritative source. It changes only revision_hash, audits old/new hashes, preserves envelope/ID/round/schedule. No send endpoint called by preview/refresh.

Receipt observation selects only known pending provider IDs, maximum20, two batches/minute plus shared provider budget. No queue state writes, send or retry. Observations are separate from persisted receipt states.

Before release: 278 tests passed/3 opt-in DB skipped; build passed; isolated MySQL25 checks passed, real provider calls0. Final rerun recorded in tmp/final-lifecycle-audit-20261029. Activation and live verification must be read back before completion claims.

Rollback: revert code to previous deployed commit ee3bd521ebaa87c9502e9fb6ab4e40db2926ceb5; remove only new flags if required. Do not restore shared database or erase outbox histories. After any submitted new-revision message, preserve attempts/provider IDs and never regenerate rounds.
