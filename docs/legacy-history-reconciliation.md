# Legacy history reconciliation

Authenticated `GET /api/ayambil/admin/legacy-history` audits all bounded legacy pending history, not the old latest-50 list. No provider request, prepare or send occurs. The response omits encrypted payloads/private capabilities. Keep booking/provider-reference exports private.

`POST .../legacy-history/resolve` accepts only 1–50 exact reviewed IDs and existing admin Origin/CSRF. Each original queued zero-attempt/provider-absent row is locked, and coverage is re-read before appending `legacy_history_superseded` to the existing notification audit table. Concurrent/repeated requests reuse the first resolution. A mixed unsafe batch rolls back atomically. No migration, queue status rewrite, payload clearing, fabricated delivery, deletion, booking/pass update or sender-configuration change.

Coverage requires the same booking, matching saved recipient/event, an accepted/sent/delivered/read equivalent purpose and a provider reference. Bilingual confirmation/approval includes combined-pass CTA and covers a legacy pass job. Plain legacy confirmation does not prove pass-link delivery. Uncertain/failed/attempted or recipient-mismatched history fails closed. Phone equality alone does not prove coverage or a duplicate booking.

Missing candidates additionally require active confirmed booking, consent, valid active non-trashed passes/capabilities, and no unresolved duplicate/repeated-name hold. They still require the modern sender's current eligibility/template/revision/dedup checks before any submission. Reminder candidates retain the existing due window. This feature never sends or enables a legacy worker.

The dashboard retains the historical pending metric, adds unresolved raw-history/resolved/actionable counts, and explains their different units. A resolution removes no original evidence; its referenced provider receipt may subsequently advance monotonically. The authenticated workspace's Advanced tools exposes a no-send audit and exact covered-row resolution action. Existing pending-history filters remain historical, not a replay instruction.

Validation: classification/Origin/CSRF tests, fresh disposable MySQL concurrent resolution/atomic rollback, immutable queue/bookings/passes and zero real-provider calls; frontend build. Runtime rollout must first save private current audit evidence, resolve only the reviewed covered IDs, re-read counts, and leave original automation/reminder/cutoff/owner settings unchanged.
