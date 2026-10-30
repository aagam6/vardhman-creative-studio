# Final existing-user configuration

User explicitly requires the existing database AND existing database user. This supersedes restricted-principal proposals, related support requests and old separate-credential activation blockers. No new DB user or hosted grant change is required or requested.

Runtime now uses existing DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD as one set. The Updhan-owned pool is bounded to4 connections; it never closes or changes the Ayambil pool. Identity adapter uses that same principal through an exact SELECT-only SQL wrapper. The application boundary is reviewed SQL and separate updhan tables, not database-enforced permission isolation; the existing broad principal remains unchanged by explicit user choice. Runtime still verifies database identity, engine and all20 tables before serving Updhan.

Production WhatsApp uses existing VARDHMAN_FLOW_* credentials/channel. Updhan sending/worker controls remain separate and off until explicitly activated. No support provisioning should proceed. Historical restricted-grant SQL is reference only, not part of final migration.

Remaining external release steps: encrypted database and private-media backup; reviewed additive Updhan migration only (no Ayambil DML/DDL); secure missing Updhan-specific crypto/storage/config values; hosted acceptance; GitHub review/push and deployment when authorized. Existing DB/provider credentials do not need duplication. No new privacy/retention policy was approved; do not invent one or weaken existing consent.

No live migration, push, deployment or real message is authorized by this local finalization.

## Final verification evidence

- Current-main API/web regression:312 total,309 passed,3 opt-in engine skips,0 failures. Dedicated MariaDB integration ran separately and passed.
- Real disposable MariaDB11.8.9 shared-principal preflight passed with the same pool. Identity write rejected before reaching SQL. Registration retry, manual status workflow,300-seat concurrent boundary, duplicate pagination, private photos, auth/CSRF and database/media restore passed. Synthetic Ayambil DDL/rows/queue hash unchanged.
- Current-main production build passed. Node24.22.1. API/provider network defaults off and no real send performed.
- Public/mobile browser receipt regression previously verified UPD-2027-0026 with correct applicant acknowledgement; receipt name-erasure crash fixed and covered. This final database-config-only edit did not repeat mobile visual testing.
- Logs in authoring workspace tmp/updhan-final-shared-user-tests-20261030.log, tmp/updhan-final-shared-user-integration-20261030.log, tmp/updhan-final-shared-user-build-20261030.log.

## Release sequence still to execute, not falsely marked complete

1. Push review branch/PR after user authorization; never push old authoring root or direct main.
2. Capture and restore-test encrypted shared DB backup plus private-media backup, then apply only reviewed additive schema001 + operations007 + notification_reviews008 + worker_ownership009. Do not run local seed/reset/old PDF schemas or restricted-grant SQL. Never restore the entire shared DB over ongoing Ayambil.
3. Existing DB_* and VARDHMAN_FLOW_* values remain. Securely supply only missing Updhan-specific encryption, rate secret, private-path and version/retention settings, preserving all live env keys; verify hosted path/writeability. No values or policies are invented. Review hosting restart/deployment as part of release, not local testing.
4. Keep intake and provider/worker disabled during deployment acceptance. Verify hosted login, upload, receipt, queue and rollback. Enable intake and later the receipt worker only under explicit reviewed activation. No decision templates/PDFs are activated. Shared budget must not be falsely certified merely because events are expected not to overlap; current provider guard remains fail-closed until its reservation is supplied. User chose to defer combined budget work.
5. Code rollback disables/reverts only Updhan on current main; retain tables/media/outbox and never replay uncertain or submitted jobs.

Local implementation verification is complete for the checks above. Hosted acceptance and actual sender activation cannot be claimed before the deferred migration/deployment. The runtime's current production composition does not start an acknowledgement sender automatically; reviewed worker wiring/supervisor activation remains a release task, not proven by mock tests.
