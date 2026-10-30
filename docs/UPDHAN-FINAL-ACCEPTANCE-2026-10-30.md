# Final local acceptance follow-up

- Browser found a real receipt-rendering defect: form state was erased after saving, then the acknowledgement preview tried to format the erased name and crashed. The receipt now captures only its acknowledgement display text before clearing editable data. A regression verifies name/reference survive without copying health/contact fields.
- Local browser submission after the fix displayed UPD-2027-0026 and Synthetic Mobile Receipt Check in the acknowledgement preview. No real WhatsApp was sent. The photo was selected by the user after browser-extension file access prevented automated selection.
- Form category date display now uses the supplied public programme schedule instead of stale reference-day placeholders. This does not approve/open backend options.
- Localization uses React.Children.toArray to preserve child keys.
- Current candidate: 304 tests, 301 pass, 3 opt-in skips, zero failures; production build passed.
- A separate disposable MariaDB rehearsal proved table-scoped runtime grants and SELECT-only identity grants pass preflight and deny Ayambil read/write, identity writes, unrelated reads and ALTER. Live permissions remain unchanged.
- Signed-in Vardhman Flow UI currently shows updhan_registration_received_v1 APPROVED, hi, UTILITY, exact bilingual body with name/reference slots, header, footer and static UTM button. Provider API docs confirm the existing payload/header/status endpoint shape. API metadata/UUID and numeric shared rate budget are not independently verified; no credentials created or messaging activated. Provider template edit was inspected and cancelled without saving.
- User explicitly deferred new organizer policy. Existing consent/private-media protection remains; no invented minors/retention policy was applied.
- Browser interruption closed the test tabs and the loopback server became unavailable before final dashboard-record verification and closing intake could be confirmed. Do not claim this browser tail completed or keepalive reliable. Restarting the existing disposable preview initializes a fresh closed intake; previous synthetic state is disposable.

No push, deployment, live database write or real message. Existing activation blockers in the push handoff remain where not resolved above.
