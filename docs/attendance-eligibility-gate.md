# Attendance invitation safety gate

Attendance review creation, durable outbox preparation, claim validation and a fresh
post-claim check immediately before provider submission use the same contact-event
policy. The existing default-off dispatch and worker controls are unchanged.

- Active confirmed same-contact bookings are grouped by normalized mobile and event.
  Same phone with distinct names is legitimate; another event remains separate.
- An overlapping attendee set without an explicitly Reviewed, current complete family
  snapshot is held. An open or Follow-up duplicate review also holds the contact.
  A family response alone does not resolve it.
- Repeated normalized names inside any active booking hold that contact-event,
  including the repeated-name cases found in the private audience audit. This rule
  is derived from current records, not committed customer IDs or personal data.
- An Attendance response excludes the contact across follow-up rounds. Source scope,
  consent, active passes, private link expiry/revocation and snapshot revision must
  still pass the existing sender checks.
- Admin cards expose hold reasons and disable preparation controls. Counts use
  contact-event units; reason counts may overlap. Provider submission history remains
  a separate check, and audience approval is still required before any campaign send.

Event-first transactional locking serializes preparation with registrations and
approvals. Unique review communication keys and outbox dedupe keys retain one record
per contact/event/purpose/explicit round. Existing unsent duplicate reviews reuse their
IDs without rotating private links; replacing a link remains an explicit action.

Sender transactions use READ COMMITTED so a wait for the event lock cannot retain
an earlier eligibility snapshot. Eligibility is checked again after the durable claim
and immediately before calling the provider. A changed hold blocks submission with
`eligibility_changed_before_submit`; it is not automatically retried. A post-claim
block may have one local claim attempt but no provider submission. No exactly-once
delivery guarantee is implied; existing uncertain-acceptance handling is unchanged.

No schema migration, startup migration, production fixture bootstrap, messaging flag
change or worker activation is required. This release changes no bookings, attendees,
passes, capabilities, legacy queue, Trash or reminder settings.

Validation: focused policy tests, disposable loopback MySQL concurrency/race tests
(`tools/attendance-eligibility-test.mjs`), production sender rehearsal and existing
booking-control regression. All provider submissions in rehearsals are injected
in-memory mocks; production transport/network is not used.
