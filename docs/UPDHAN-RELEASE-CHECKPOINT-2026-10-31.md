# Release checkpoint — 31 October 2026

Authorization: current-main integration, backup/restore rehearsal, additive Updhan migration, PR merge/deployment; final intake CLOSED and real sending OFF. Later user permits a brief maintenance window if required. No dummy production applications, manual message tests or Ayambil record/queue modifications.

## Verified so far

- Fresh Git fetch and Hostinger deployment agree on main `5d0828a803a24852da25c6c49ee11b7a11284155`, PR47. Auto-deploy is enabled. Merged main into review branch locally, merge `4067089`; no conflicts. No main push or deploy yet.
- Root workspace now includes pinned nested `apps/api/updhan` dependencies and root lockfile. Clean dependency installation succeeded. Existing dependency versions were not bulk-upgraded. npm audit reports seven moderate findings propagated from minimatch in development lint tooling; no force fix applied.
- Production receipt sender composition added, separate ownership/lease, single in-flight tick, graceful drain, import/start disabled by default. All three activation flags plus explicit owner and externally coordinated provider request reservation are required. No shared reservation is installed or falsely certified; actual sender remains OFF.
- Missing/invalid Updhan configuration does not throw from shared startup. Shutdown attempts Ayambil pool close even if Updhan close fails.
- Current-main regression:329 total,326 passed,3 opt-in skips,0 failures. Production full-site build passed. Logs in authoring workspace `tmp/updhan-current-main-20261031-tests.log` and `tmp/updhan-current-main-20261031-build.log`. Tests preceded the final shutdown catch-only change; repeat focused checks before merge.
- Downloaded phpMyAdmin gzip at10:20 IST: SHA256 `1cf7a4434473aa96876ef254ce8401d1f4682220f84e1a547b8472ace6109800`. Encrypted DPAPI CurrentUser copy at authoring workspace `output/updhan-release-20261031-private/database.sql.gz.dpapi`, encrypted SHA256 `a8a433c4909bd51f54588f20a03655bb12d6eed0a00da369fdd5df89d0399269`. Recovery requires the same Windows user; this is not a portable disaster-recovery key.
- Backup restored successfully into a fresh isolated local MariaDB11.8.9:28 tables. No provider import/worker/network or production database connection. Aggregate counts manifest saved privately beside the encrypted copy. Source transaction snapshot consistency not independently proven; do not certify it from successful restore alone. Plain downloaded gzip remains in Downloads, not Git.
- Hostinger official on-demand FILES AND DATABASES backup requested via hPanel, status IN PROGRESS. Do not request another. Screenshot saved privately at `output/updhan-release-20261031-private/host-backup-started.png`. Need completed state, downloadable fresh backup/hash/restore and private-media coverage before live mutation.
- Existing SSH is ACTIVE but existing local authentication is denied. No password reset, key addition or access weakening performed. Temporary SSH key requires action-time access approval; question pending. Do not bypass Chrome blocked export endpoint.

## Not yet executed

No maintenance mode, live migration/configuration, main merge, deployment or real send. Need consistent backup and private-media recovery evidence; schema collision/protected-state baseline and20-table manifest; current-base database rehearsal; current provider metadata; secure per-key configuration; hosted private-path verification; PR review and exact deployed-commit acceptance. Sending remains blocked by unverified shared request budget and activation remains unauthorized. Existing photo-retention/privacy configuration requirements need reviewed values; do not invent policy to pass startup.

Rollback remains Updhan-only; retain tables/media/outbox. Never restore the shared database over ongoing Ayambil bookings or resend submitted/uncertain jobs. Preserve Manan1 Nov18:00 IST and Sairam2 Nov18:00 IST reviewed reminders, original cutoff and48-hour Attendance delay.
