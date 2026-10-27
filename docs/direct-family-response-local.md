# Direct family responses and unified Bookings — 27 October 2026

Local implementation; no migration, production connection/config/data write, customer message or sender activation is part of this change. Push to a feature branch only; no main merge/deployment.

## Response behavior

`AYAMBIL_DIRECT_FAMILY_RESPONSES_ENABLED=true` enables atomic reduction-only final responses. Default is OFF, so uploading source cannot retroactively apply saved proposals. Existing responses are never replayed. Default-off deployments retain proposal behavior and disclose it honestly in the form. No schema migration is needed.

With the flag ON, Yes retains selected original identities; Reduce group cancels only removed attendees/active passes and revokes their current capabilities. No cancels all bookings in the private review scope. Duplicate response requires choosing one existing booking; other scoped duplicate bookings are cancelled. No attendee renames, additions, replacement names, pass reissues or extra capacity are permitted. Existing snapshots, history, retained pass numbers and capabilities are preserved. Download access checks enforce cancellations; already downloaded PDFs cannot be recalled. No WhatsApp job is created or legacy queue modified by response application.

The event control, review and scoped source bookings are transaction locked; saved participant scope must still match. Ambiguous/repeated names or stale source details fail closed. Concurrent identical submissions return the saved result with no repeated mutation. A changed response requires organiser correction. Decisions are audited as `family_response_applied` in the existing control audit, not forged as an administrator action. No privileged administrator account is used.

## UI

The private form owns a light cream/white surface, readable dark text, selected-state styling and mobile controls. Existing names are checkboxes rather than a free-edit textarea/count. Removal/cancellation consequences appear before Submit. Saved historical proposals are distinguished from applied final responses.

`/admin/ayambil` Bookings now paginates confirmed, waiting and cancelled together in database order. Status and message type/status filters are on the same screen; Waiting has no pass/reissue/restore action and offers whole-group approval through the existing authenticated/CSRF/capacity endpoint. Waiting counts are shown on the main dashboard. Separate primary Waiting tab removed. Legacy queue and new outbox counts are separately labelled to avoid adding unlike counters. Message cards include new outbox purpose/status alongside legacy history; modern confirmation CTA also supplies the pass-link status. Duplicate/Attendance remain specialised tools in the same route.

## Local testing

Run the bundled Node 24 runtime with `--test apps/api/tests/*.test.mjs apps/web/tests/*.test.js`. Real disposable MySQL integration: `node tools/family-response-direct-test.mjs`; legacy behavior: `node tools/booking-controls-test.mjs`. These tools create fresh `ayambil_test_*` databases, never read production .env, and reject real messaging. Local visual preview: `node tools/booking-controls-preview.mjs --direct-responses` on loopback port 3140. Its access links are synthetic and ephemeral.

## Production follow-up, outside this push

Before enabling the direct-response flag, organiser must understand the cancellation behavior. Reconcile the currently paused campaigns separately; do not resume sends as a side effect of this UI release. Live response mutation and sender activation were not authorised in this task. Keep the flag OFF until a reviewed production activation.
