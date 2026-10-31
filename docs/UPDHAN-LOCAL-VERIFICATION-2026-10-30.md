# Updhan local verification — 30 October 2026

Scope: disposable MariaDB 11.8.9, synthetic applicants, mock provider only. No live database writes, deployment, push or real WhatsApp.

## Verified this run

- 28 focused tests passed: form validation and retry reference preservation, private media, shared admin authentication and password-change revocation, no-store/CSRF, encrypted transaction enqueue, consent withdrawal, mock template mapping, unknown provider outcome/no-resend and delivery distinctions.
- Production contract passed again after extending the test to the actual shared capacity of 300: seed exactly 299 synthetic approved applicants, submit two more, move both through under-review, approve concurrently. Exactly one approved and one waitlisted; total approved remained 300.
- Existing contract also verifies closed/open/waiting enforcement, cancellation and restore, duplicate evidence pagination/shared-family-number behavior, attendance, database/private-photo backup and restore with closed intake and no restored sessions.
- Synthetic Ayambil schema/row/queue hash remained identical before and after Updhan operations, including the 300-seat test.
- Review-only production build passed. This root build is not a deployable replacement for current Ayambil.
- Restarted local preview on port 3118 with a fresh disposable database; realSending=false. Existing production activation remains closed/off. Preview process availability after this session is not guaranteed by this test.

Evidence logs: tmp/updhan-verification-20261030.log (28/28), tmp/updhan-capacity300-20261030.log (extended integration 1/1), tmp/updhan-build-20261030.log.

The new test initially failed because its fixture skipped mandatory review and then assumed one approval survived earlier cancellation/restore tests. Corrected fixture setup to count existing approvals and explicitly assert 299 before the race; no production logic was changed to make this pass.

## Limits and activation blockers

No fresh browser mobile submission or hosted staging acceptance was performed this run; earlier screenshots are not new evidence. Automated API/service checks do not establish current live provider metadata or host configuration.

Before activation: reverify current deployed revision and connection metadata; provision reviewed restricted runtime/identity grants and private storage; review additive migration and backup/restore on hosted staging; verify exact provider UUID/language/template/channel and combined Ayambil/Updhan rate budget; confirm organizer eligibility/minors/privacy/retention policies; complete final browser acceptance. Migration, deployment, intake opening and real sends require separately scoped approval. New approval/rejection WhatsApp templates remain inactive.
