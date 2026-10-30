# Hosted setup inspection — 30 October 2026

Current Hostinger completed production revision is 5549bed932627313dd42db3c317b392e65835470 (PR40), build 01a18a66-a189-7260-bea3-a04a2da01903, Node24 Express, main auto-deploy enabled. The local review branch base a21832b is now behind: refresh/rebase and rerun before any merge.

Existing database u531246927_vcs remains assigned to the website. Existing principal has broad DDL/DML permissions and must not be repurposed or revoked. The app-side DB host must be 127.0.0.1:3306; srv906.hstgr.io is the external-access address only.

No UPDHAN_* environment keys are currently configured. The available Hostinger environment operation is full replacement, deletes omitted keys, only returns masked values, and restarts the shared app. Therefore do not call it with masked values or omit existing Ayambil flags/secrets. Additive UI configuration or an independently provisioned Updhan process is required to avoid disturbing live Ayambil; exact topology and operator access remain to be verified.

Proposed runtime: UPDHAN_ENABLED=false initially; UPDHAN_DB_HOST=127.0.0.1; UPDHAN_DB_PORT=3306; UPDHAN_DB_NAME=u531246927_vcs; separate table-granted UPDHAN_DB_USER/PASSWORD and SELECT-only UPDHAN_IDENTITY_DB_USER/PASSWORD; UPDHAN_PRIVATE_PHOTO_DIR outside public_html and release directories; UPDHAN_SITE_ORIGIN=https://vardhmancreativestudio.com; separate queue encryption and rate-limit secrets. Privacy/retention values require an explicit organizer decision and are not guessed. Runtime preflight rejects broad grants.

Vardhman Flow signed-in UI: channel aa40827e-8239-49b0-bee4-3045bb3d95d7, active/healthy, LIVE, GREEN, TIER_2K, availability LIMITED. Plan shows 300 API requests/minute and unlimited monthly requests. This is UI evidence, not an authenticated API response or proof of a safe combined rate budget. Ayambil code locally caps one process at50/min and reports documented per-key60/min; other instances/consumers must be inventoried before allocating Updhan capacity. Keep Updhan sends off until a coordinated reservation or reviewed independent-key budget is established.

Prepared read-only provider key proposal: Vcs channel, account.read and templates.read only. No key has been created without per-action confirmation. Metadata verifier issues only two GETs and fails exact template verification when components/Meta-ID evidence are absent. It never calls a message endpoint.

No hosted credential, environment, database, storage, deployment or live sender change was made by this inspection. A restricted-grant rehearsal already passed in disposable MariaDB; that is not hosted provisioning.
