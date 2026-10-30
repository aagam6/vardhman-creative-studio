# Uncertain Attendance terminal-failure reconciliation

An explicit authenticated admin action may associate one otherwise lost provider
receipt with an existing single-attempt uncertain Attendance job. It performs
only provider GETs: bounded complete original-recipient history (maximum50), then
status by the discovered provider ID. Exactly one failed receipt must match the
approved Attendance template and original durable claim time (-1s to +15s).
Missing/ambiguous timestamps, incomplete history or a non-failed status fail
closed. UI evidence alone cannot resolve the database record.

The shared dispatch lease and compare-and-swap preserve the original encrypted
envelope, claim, attempts, round and deduplication key. A previously associated
provider ID is rejected. An audit records the prior uncertain state, terminal
failed state, provider ID and authenticated evidence source. No retry, resend,
owner activation, new link or booking/pass mutation occurs. A second invocation
is rejected; the failed attempt continues to block replay.

After all uncertain/in-flight records are reconciled, explicit existing ownership
handover may restore healthy transactional/reminder processing. Automatic
Attendance remains OFF; remaining foreground campaigns require exact IDs and
fresh source eligibility. No migration or new environment variable is required.
