# Controlled Empty Trash and booking maintenance deployment

Status: code tested locally; live maintenance, fresh backup, migration, merge, enablement and reopening NOT performed. Draft PR is safe to review; do not merge before the registration pause and backup are verified. Historical local backups are never restored over production during normal deployment.

## Before merge (operator gates)

1. Verify Hostinger access, target domain/database and existing application settings. Record current `registration_open`, application registration flag, worker flags and runtime version. Do not change workers or send messages.
2. Existing live schema already has `registration_open`. On the exact live DB, set it FALSE in a transaction (the register transaction locks the same settings row). Verify status reports closed and a valid new register request cannot create a booking. Pass download routes stay available. Do not restore old dumps. Do not promise an exact automatic reopen.
3. After gate closure has committed and in-flight registrations have drained, export a fresh consistent complete database backup, save its SHA-256 and all table counts. Verify the downloaded export; ideally restore it in a disposable local schema and compare counts. Keep source secret data out of Git. External backups may continue; their management is not part of this release. Preventing new registrations, not disabling backups, is the data consistency requirement.
4. Apply `008_trash_backup_maintenance.sql` only after inspecting schema/absence of its objects. This is additive and intentionally not run at application startup. Verify the table and columns exist. Do not mark schema version 4; current readiness supports existing version 3.
5. Set `maintenance_active=TRUE, maintenance_until=DATE_ADD(UTC_TIMESTAMP(3),INTERVAL 10 MINUTE), registration_open=FALSE` on the single settings row. Until new code is deployed, the old form will show closed rather than the new countdown.

## Deploy / verify

6. Merge the reviewed PR to the actual deployment branch, keeping newer main-branch security changes. Deploy/restart through Hostinger. Enable `AYAMBIL_MAINTENANCE_SCHEMA_ENABLED=true` and `AYAMBIL_TRASH_PURGE_ENABLED=true` only after migration. Leave all messaging flags unchanged; no queue process/send/retry calls.
7. Verify runtime/health, both Manan and Sairam forms show maintenance, status has `open:false` and the timer metadata, new registration fails, existing pass and combined downloads work, dashboard/auth/CSRF/Trash preview work. Expired estimate must still block bookings. Estimate is not an automatic reopen timer; final checks can take longer.
8. Empty Trash feature can be enabled without purging. If an actual live purge is requested, take a current backup and review exact count/revision; require typed confirmation. Only cancelled trashed passes and their download-key rows are removed. Booking/attendee/registration/queue history remains. Each pass/key record is archived transactionally in `ayambil_trash_backup`; original audit retained. Any error rolls back all deletion.
9. Compare active booking/pass hashes, message queue/provider rows, date counts and download validity before/after. Audit is expected to gain records. No queue rows or sends should be created. Confirm the latest deployed commit and logs.
10. Only after successful checks: set `maintenance_active=FALSE,maintenance_until=NULL,registration_open=<previous approved value>`; keep the original application registration flag unchanged. Verify both public forms/status reopen and pre-existing downloads work. Do not create unsolicited live test bookings or messages.

## Failure

Keep registration closed and show maintenance. Roll back application code if necessary; additive columns/table can stay. Do not automatically restore a full database because it can overwrite valid newer data. Targeted recovery requires inspection and explicit operator action. Backup is disaster recovery, not a normal post-deploy step.

## Validation

Real MySQL 8 disposable test covers local and production archive paths, forced deletion rollback, concurrent repeated deletion, active downloads and unchanged protected records. Migration + expired maintenance still block registration; explicit reopen restores status. Client tests cover purged history without relaxing public registration response requirements. Original-backup MariaDB rehearsal verified 13 archives/purges, 56 unchanged bookings, 149 unchanged active passes, exact queue equality.
