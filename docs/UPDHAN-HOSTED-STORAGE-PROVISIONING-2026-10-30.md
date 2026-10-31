# Hosted private storage and database access outcome

## Completed hosted action

Created only a new empty `updhan-private` directory in the vardhmancreativestudio.com website-scoped file-manager root, alongside (not inside) `public_html` and `hbuilds`. Set and read back permissions `drwx------` (0700), non-recursive, owner-only. No existing directory/file permissions changed and no applicant photo uploaded. Evidence: authoring workspace `docs/updhan-hosted-private-storage-2026-10-30.png`.

The expected absolute path from the previously verified domain root is `/home/u531246927/domains/vardhmancreativestudio.com/updhan-private`. File-manager UI establishes sibling placement, not the running Node process's realpath/writeability. Verify that absolute path from the hosted runtime before setting `UPDHAN_PRIVATE_PHOTO_DIR`. Do not put storage inside a release or expose it through express.static. No environment variable was applied and no process restarted.

## Database blocker, independently inspected

Existing database `u531246927_vcs` and existing same-named principal remain unchanged. hPanel Management exposes creation of a NEW database plus user, and existing-user Repair / Change password / Change Permissions / Delete. It does not expose adding a separate principal to the existing database. Changing that user's permissions would affect active Ayambil and was not performed. The available connector search likewise did not expose shared-hosting table-scoped principal provisioning.

Required privileged operator/support operation (prepared, not sent):

> For existing database u531246927_vcs, provision two NEW distinct localhost/127.0.0.1 principals without changing existing user/grants/data. After the reviewed additive updhan tables are installed, runtime principal requires SELECT/INSERT/UPDATE/DELETE only on the 20 explicit updhan tables listed in runtime-grants.REVIEW.sql; no DDL or GRANT OPTION. Identity principal requires SELECT only on ayambil_admins. Do not change ayambil tables, running application credentials, queue ownership, or existing grants. Supply credentials through a secure secret channel, never an issue/commit/chat. Confirm whether this shared-hosting plan supports these grants.

Table grants cannot be applied before additive migration creates those tables. No production migration is authorized/executed in this step. Existing MySQL environment keys do not supply the missing least-privilege isolation.

## Remaining verification

Privileged grant provisioning, approved additive migration, hosted runtime write/read/photo restore check, encrypted backup destination and environment integration remain pending. This file does not assert hosted readiness. Existing provider credentials are reused for production per user decision; provider read-only testing key remains verification-only. No deployment, push, message send, environment replacement or Ayambil mutation occurred.
