# Updhan release execution checkpoint

## Completed before merge

- Main integration includes `5d0828a` (PR41–47). PR: https://github.com/aagam6/vardhman-creative-studio/pull/48.
- Final regression332 tests:329 passed,3 opt-in skips,0 failures. Current-main disposable MariaDB production-contract integration passed separately; full-site build passed. Root workspace installs pinned nested Updhan runtime dependencies. Native sharp0.35.5 generated a JPEG under Node24; Express5.3.0/mysql driver loaded successfully.
- Production supervisor has separate Updhan ownership/lease and stop/drain. No externally coordinated provider budget has been installed or certified: real sending and worker flags remain false. Never start another Ayambil worker or replay submitted/uncertain jobs.
- Closed admin runtime can start without inventing privacy/retention policy; missing reviewed policy keeps public intake closed before photo decoding, even if a database mode were opened. No default retention number or policy approval was invented. Opening remains a separate authorization/configuration step.
- Private writable preflight runs from the actual production Node process before Updhan requests are served, creates/removes only its own private probe, and fails Updhan closed without changing Ayambil startup/readiness.

## Fresh backup and restore

Hostinger official files/database backup completed31 October10:26. Independently, a consistent `mariadb-dump --single-transaction --skip-lock-tables` snapshot of all28 InnoDB tables was taken through the existing authenticated SSH session. Database, private-media and host configuration were encrypted with AES256-GCM into owner-only storage outside public_html/hbuilds. Existing database/user were reused.

Server backup directory: `/home/u531246927/domains/vardhmancreativestudio.com/updhan-release-20261031051953`.

Encrypted recovery bundle SHA256: `80bf799659cc1bb1f3cd6dced78f9b2fc685960f20297686257d3bbdb2d93b7f`.
Manifest SHA256: `5d432a49e97bd9f112871b6275ad4a7687ec6d96bf5033fd30e0b65f5c264548`.
User downloaded the bundle into Downloads after browser automation download was blocked. Local hash matches server evidence. Recovery key was RSA-OAEP protected, with local private key encrypted using Windows CurrentUser DPAPI. Backup recovery requires that Windows user or the retained owner-only server recovery material; no key or secret is committed.

Authenticated local decryption passed for all three artifacts. Fresh database restore into isolated MariaDB11.8.9 passed (28 tables), followed by the exact20-table additive migration rehearsal with existing DDL/data fingerprint unchanged. Private-media restore contains only the empty `updhan-private/` directory. No customer application was submitted to production. Sanitized artifact/migration hashes are in `updhan-migration-rehearsal-2026-10-31.json`; private evidence is in authoring `output/updhan-release-20261031-private/`.

## Applied live migration/configuration

At `2026-10-31T05:33:20.306Z`, collision check found no pre-existing Updhan objects. Explicitly applied base001,007,008,009 and recorded their exact artifact hashes in `updhan_schema_version`:20 tables. No reset, seed fixture, restricted grants, new user/database, or Ayambil DDL/DML. Protected Ayambil schema fingerprint unchanged (live AUTO_INCREMENT counters excluded). Do not claim all changing live records remained byte-identical during genuine traffic.

Real event configuration only: Achalgarh26 April–14 June2027; manual admission; shared capacity300; intakeClosed; acknowledgement owner disabled. Zero Updhan applications. Category eligibility/dates are not silently approved by this configuration.

Added only nine missing `UPDHAN_*` values through hPanel single-key editors and one Apply: runtime enabled, site origin, private directory, queue encryption key, rate secret, acknowledgement owner, and three explicit false sender/worker/activation flags. No masked value was copied into an API full-replace request. Compared decrypted pre-change configuration privately to the actual new `.env`: all44 pre-existing values unchanged, including every AYAMBIL/DB/provider value. Private directory realpath outside public storage,0700, SSH write probe passed; actual-process preflight is required during hosted acceptance.

## Still to verify after merge

Exact expected commit Completed/Current, runtime restart/health, closed Updhan status, login/session isolation, private no-store routes, desktop/mobile UI and Ayambil read-only protection/worker/pass checks. Main auto-deploys. Do not call release complete before these checks. Public intake and real sending remain unauthorized and OFF. Shared provider budget and reviewed policy/category settings remain explicit prerequisites for later activation.

Rollback: Updhan-only flags/runtime/code; preserve tables, media and durable outbox/provider IDs. Never restore the shared live database over newer bookings or reset Ayambil queues/capabilities. No maintenance was necessary for single-transaction backup/additive migration; existing bookings continued. Preserve original cutoff,48-hour Attendance delay and reviewed reminders (Manan1 Nov18:00 IST; Sairam2 Nov18:00 IST).
