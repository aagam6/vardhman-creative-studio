# Ayambil evening registration — Phase 2 (no QR)

Historical Phase 2 guide. For the current single-evening booking and official
WhatsApp integration, use [Phase 3 deployment](ayambil-phase3-deployment.md).
Phase 3 supersedes combined registration and the absence of private download links.

Existing landing page: `/500-akhand-ayambil-vijayollas`. Admin: `/admin/ayambil`.
Registration covers only 2 and 3 November 2026 evening presentations. No payment,
QR, verification route, public pass lookup, public attendee URLs or check-in records exist.

## Implemented storage and permissions

PocketBase 0.38.0 is the repository runtime version. Deploy the additive migration
`apps/pocketbase/pb_migrations/1791590400_ayambil_registration.js` and the entire
`apps/pocketbase/pb_hooks/ayambil/` directory plus `ayambil-registration.pb.js`.
No existing collections are modified. The down migration refuses destructive rollback.

- `ayambil_bookings`: contact name/mobile, random booking number, hashed idempotency
  key and canonical payload hash, registration status, timestamps.
- `ayambil_attendees`: booking relation, full name, permitted evening dates, status.
- `ayambil_passes`: attendee relation, unique server-issued random pass number,
  immutable content snapshot, active/cancelled/superseded status, timestamps.
- `ayambil_admins`: separate auth collection with an `enabled` flag; no default accounts.
- `ayambil_audit`: administrator, booking, action and timestamps.

Data collections allow reads only for enabled event administrators. Direct public
and regular administrator writes are locked; mutations use explicitly authorized
custom endpoints. Superusers retain normal PocketBase privileges and should not
use the frontend admin panel. Administrator authentication is memory-only, cleared
on sign-out/navigation and does not reuse the site's existing PocketBase auth store.

Registration saves booking, attendees and passes in one transaction. Client retries
retain the same 256-bit request identifier while the form remains open. The unique
database hash guarantees repeat/concurrent requests return the existing booking;
a changed payload with the same key is rejected. Mobile numbers are not unique.
The identifier is submitted in the body, never in URLs or printed on passes.
Reloading the browser discards that identifier and the receipt: save PDFs first.
If a submission result is uncertain after losing the page, contact an administrator
to search the booking before registering again. No fake persistence is used.

Cancellation/restoration applies to a booking and all its attendees/latest passes.
Reissue retains the previous number as superseded and generates a new saved pass.
Without verification/scanning, paper/PDF copies cannot be remotely revoked or
distinguished at entry. Staff must use the current authenticated attendee list.
Pass number possession never grants database access.

## Production deployment requirements

1. Back up PocketBase data and inspect existing collection names for conflicts.
   Migrate against staging first; deploy only this reviewed additive migration.
2. Start PocketBase with the existing encryption environment and persistent data,
   migration and hooks directories. Disable automatic schema migration generation
   (`--automigrate=false`); restart after deploying hooks (`hooksWatch=false`).
   `AYAMBIL_REGISTRATION_OPEN=true` enables public registration; unset/false keeps it
   closed. Status endpoint also requires the migrated collections.
3. Serve PocketBase over HTTPS at `/hcgi/platform`, proxying the prefix away so
   `/hcgi/platform/api/ayambil/status` reaches `/api/ayambil/status`. Alternatively,
   set `VITE_AYAMBIL_POCKETBASE_URL` to the HTTPS backend URL **at Vite build time**.
   This variable is a public URL only, never a secret. Configure allowed origins.
4. Verify health returns JSON, and status returns `{ready:true,open:true}` before
   opening the form. At implementation time production `/hcgi/platform/api/health`
   returned HTML, and no production collection inventory/admin access was available.
5. Using a trusted PocketBase dashboard/operator, provision an `ayambil_admins`
   account with a unique strong password and `enabled=true`. Do not share a
   superuser credential, put passwords in source, or create a default public account.
   Use PocketBase's auth rate limiting and appropriate password/MFA policies.
6. Enable PocketBase rate limiting for public submission and login endpoints and
   enforce an operational reverse-proxy body size/time limit. The registration API
   has a 1 MiB body limit (technical abuse protection, not event capacity).
   Protect backend error logs and restrict access to attendee exports/backups.
7. Configure backups and an organizer-approved retention policy for private contact
   data. Keep production payloads/credentials out of application logs.

Shared programme source: `pb_hooks/ayambil/config.json` (also imported by React).
Capacity, closingDate and passExpiry are null: no seat limits/closing/expiry claims.
ClosingDate is enforced when an ISO timestamp is configured. Capacity and expiry
remain unconfigured; any future policy needs a reviewed implementation and tests.

## PDF, print and sharing

Pass content/number comes only from saved server records. Existing html-to-image
and jsPDF produce an A4 PDF from the saved pass, preserving Gujarati glyphs.
Print targets the selected attendee pass. PDF generation is local to the browser;
the database stores the issued content snapshot, not a PDF file.
WhatsApp is a user-initiated draft containing the pass details; attach the PDF manually.
After download, capable devices offer native PDF sharing with a user gesture.
Unsupported sharing/clipboard APIs leave download, print and selectable-text fallbacks.
No public private-pass URL is created.

## Local verification

The checked-in PocketBase executable is Linux ELF. On Windows use the official
matching 0.38.0 Windows executable in ignored `.ayambil-runtime/pocketbase.exe`.
Integration runner provisions random test-only credentials in isolated databases,
never production, and terminates the test server. Test databases remain in the
ignored runtime directory for inspection; delete them manually when no longer needed.

```
node tools/ayambil.integration.test.mjs
node tools/ayambil.browser-preview.mjs
```

The preview uses real local data on 8091 and Vite on 3002; it creates no administrator.
No production admin account has been provisioned or migration applied.

## Changed file inventory and validation

- Backend: `pb_hooks/ayambil-registration.pb.js`, `pb_hooks/ayambil/config.json`,
  `pb_hooks/ayambil/service.cjs`, and the additive migration listed above.
- Frontend: `AyambilRegistration.jsx`, `AyambilDigitalPass.jsx`,
  `AyambilRegistration.css`, `AyambilAdminPage.jsx`, `ayambilRegistration.js`,
  `ayambilPassUtils.js`; integration edits to `AyambilPage.jsx`,
  `ayambilProgramme.js`, `App.jsx`, and `vite.config.js`.
- Tooling: `.gitignore`, web `package.json` and `eslint.config.mjs`,
  `tests/ayambilPassUtils.test.js`, `tools/ayambil.integration.test.mjs`,
  `tools/ayambil.browser-preview.mjs`, and this deployment guide.
- Local checks: 32 real PocketBase integration checks, 4 browser capability/CSV
  unit tests, ESLint, and direct Vite production compilation passed.
  The existing npm build script returned successfully without running Vite on
  this Windows shell; direct Vite compilation was run separately to verify it.
- Browser checks: saved combined registration, actual PDF download, 390px mobile
  and 1440px desktop without horizontal overflow, and all six original brochure
  images loaded. Native mobile sharing and physical printing were not exercised
  on an actual mobile device/printer. Production persistence and admin provisioning
  remain unverified pending the secure deployment setup above.
