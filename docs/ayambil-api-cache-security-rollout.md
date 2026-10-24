# API cache and dependency security update

The Hostinger `.htaccess` default overwrote Express `no-store` with `public,
s-maxage=604800`, allowing stale registration status and private API responses
to reach the CDN cache. The final header exception protects `/api`, the legacy
lead API, the Ayambil admin page and pass pages, clearing both Apache header
tables. Static page and hashed asset caching stays enabled. Express also sends
CDN/surrogate no-store headers before API routing, authentication or readiness
failures. No registration gate, schema, signing key or message-worker change.

## Dependencies

- DOMPurify 3.4.16 -> 3.4.17 (jsPDF transitive dependency; root/web override).
- body-parser 2.3.0 -> 2.4.0 (Express transitive dependency; root override).
- qs 6.16.0 -> 6.16.1 (required by body-parser 2.4.0).
- Zod 4.4.3 -> 4.6.6 (existing direct web dependency).
- postcss-selector-parser 6.1.4 -> 7.1.6 (Tailwind/PostCSS transitive dependency;
  pinned security override). The 6.1.5 upstream backport is still reported by
  the current advisory range; 7.1.6 clears that advisory and passes the full build.

Current upstream advisories:
[DOMPurify](https://github.com/cure53/DOMPurify/security/advisories/GHSA-cg2g-xh64-v4q7),
[DOMPurify hooks](https://github.com/cure53/DOMPurify/security/advisories/GHSA-mrv2-3pqr-j5jr),
[DOMPurify XHTML](https://github.com/cure53/DOMPurify/security/advisories/GHSA-c6gr-qvv4-5v3f),
[body-parser](https://github.com/expressjs/body-parser/security/advisories/GHSA-27r3-jxmh-p828),
[Zod](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5),
[selector parser](https://github.com/postcss/postcss-selector-parser/security/advisories/GHSA-rj75-hqrm-r3gf).
Hostinger documents `.htaccess` header control in its
[CDN header guide](https://www.hostinger.com/support/8052370-advanced-cdn-header-management-at-hostinger/).

## Validation and rollout

Clean lockfile install, Node 24 full-site build and 187 tests passed (3 opt-in
database tests skipped). Separate fresh disposable MySQL 8 runs passed the full
registration/auth/idempotency/deduplication/pass lifecycle suite and the guarded
Trash/rollback/concurrency/preserved-record suite. All providers were mocked.
The status test changes a synthetic gate on the same URL; never close live
booking just to test cache freshness.

The final npm audit has only the pre-existing `xlsx` high findings
(GHSA-4r6h-8v6p-xvw6 and GHSA-5pgg-2g8v-p4x9); npm reports no registry fix.
That unrelated package is unchanged and needs a separate reviewed remediation.

Before merge, record current hosting configuration, normal API headers and a
fresh read-only DB baseline. Main auto-deploys. After deployment completes,
clear the old website/CDN cache once, then request normal URLs repeatedly and
verify `no-store`, no increasing CDN Age/HIT, authenticated bookings 200, runtime
readiness, both public forms and existing single/combined downloads. Compare
protected table counts/checksums and inspect genuine intervening registrations
or operator audit events if they changed. Never resend messages, process queues,
delete Trash or restore/reset live data. Booking remains open throughout.

Recovery: roll back only this application's release if needed; keep booking
state, database and message flags unchanged. Do not disable website-wide caching.
Private baseline and rollout evidence is kept in ignored
`tmp/cache-security-20261024/`, outside the PR.
