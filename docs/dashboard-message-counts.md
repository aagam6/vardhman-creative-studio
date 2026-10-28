# Dashboard message counts and read-only awaiting audit

The primary pending card uses `legacyActionablePending` only, never the old historical `pendingMessages` metric. Original pending/resolved/held/failure history lives in a collapsed history section. `pendingNotifications` is labelled modern awaiting/held records because its SQL unit includes held, ready, processing and uncertain records; it is not a send-ready audience.

WhatsApp workspace → Advanced tools → Modern awaiting records exposes authenticated `GET /api/ayambil/admin/notification-outbox?audit=pending`. It reads every awaiting row (bounded1000), not the latest20 page. It performs existing authoritative source checks in short read transactions; it never validates against the network, prepares/claims, polls provider receipts, changes outbox state, changes owner, or sends. Attempts/claims/uncertainty, answered/revoked/expired reviews, stale sources, inactive/consent/pass/duplicate holds and not-due schedules are explained. Source eligible still requires fresh provider preflight and is not permission to send.

Only record IDs, purpose/round/state, attempt count, presence of provider/claim and sanitized reason are exposed. Encrypted envelopes, raw capability tokens, phone numbers and payloads are omitted. No migration or configuration changes. Healthy automation/reminders retain their original owner/cutoff.

Tests cover authenticated GET/no-store/no-mutation paths and actionable/history count units. Disposable MySQL audits17 synthetic rows across states with unchanged full outbox contents and zero additional provider calls.
