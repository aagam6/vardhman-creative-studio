# PocketBase Apache proxy deployment preparation

Status: configuration prepared, NOT installed or verified in production.
No settings, credentials, migration, registration flag or service was changed.

## Verified evidence and unresolved infrastructure

- apps/pocketbase/package.json starts PocketBase with --http=0.0.0.0:8090,
  --dir=/data, the existing encryption environment, and hooksWatch=false.
  This establishes the intended listener port, not a reachable upstream address.
  0.0.0.0 is a bind address; do not use it as a proxy destination.
- tools/ayambil.browser-preview.mjs uses localhost:8091 exclusively for development.
- Both website clients use /hcgi/platform by default. The Ayambil client optionally
  accepts VITE_AYAMBIL_POCKETBASE_URL at build time; the existing lead client does not.
- No production VirtualHost, service unit, container/network manifest, SSH target,
  Apache module inventory or upstream hostname is present in the repository.
  Apache/PocketBase colocation and the actual hosting software remain unverified.
- The audited public API health response was identical to the frontend homepage.
  apps/web/public/.htaccess has a catch-all rewrite to index.html and no backend
  proxy. The response proves frontend fallback; server configuration is needed to
  locate the missing routing rule. A CDN can also retain that HTML response.

## Operator investigation (read-only first)

On the actual hosting server obtain the active VirtualHost with `apachectl -S`
(or `httpd -S`) and modules with `apachectl -M`. Verify proxy_module,
proxy_http_module, headers_module and authz_core_module; retain existing SSL and
rewrite modules. These have NOT been checked remotely. Inspect the PocketBase
service/container listener and network attachment without printing environment
values or full service definitions that contain secrets. Determine the reachable
scheme, hostname and port from the Apache process's network, not from this laptop.
If separate containers/hosts are used, loopback is not automatically correct.

From that network make a direct GET to the verified upstream /api/health. Expect
HTTP 200, application/json, code 200 and the expected PocketBase healthy API
message (normally "API is healthy."). Then check /api/ayambil/status: open must
remain false. Record sanitized status/content type, not credentials or bodies
containing private attendee data. Confirm deployed hooks and collections exist.

If hosting only permits .htaccess, ask the provider to establish the server-level
proxy. ProxyPass/ProxyPassReverse are not .htaccess directives. No per-directory
proxy workaround is supplied without verified hosting/module support.

## Installation location and mapping

Use deployment/apache/pocketbase-proxy.conf.template as an INCLUDE INSIDE the
EXISTING HTTPS VirtualHost serving vardhmancreativestudio.com, before any broader
ProxyPass. Do not replace the VirtualHost, certificates, DocumentRoot or redirects.
The exact host configuration filename must come from apachectl -S; none is assumed.
Place a resolved copy in the server's operator-managed include directory, and add
an Include for its absolute path inside that VirtualHost. This is not a global
include and not a public web asset. Replace REPLACE_WITH_VERIFIED_BACKEND_HOST_AND_PORT
and verify every directive before installation. The unresolved template is NOT
a usable production configuration. The HTTP form is only for a verified private
network upstream; use verified TLS and mod_ssl for HTTPS upstreams.

Mapping strips /hcgi/platform, retaining /api and query strings:

| Public path after /hcgi/platform | PocketBase root path | Use |
| --- | --- | --- |
| /api/health | /api/health | GET health |
| /api/ayambil/status | /api/ayambil/status | GET registration gate |
| /api/ayambil/register | /api/ayambil/register | POST saved booking |
| /api/ayambil/pass-download | /api/ayambil/pass-download | POST private download capability |
| /api/ayambil/admin/bookings | /api/ayambil/admin/bookings | Authenticated GET search/filter/export data |
| /api/ayambil/admin/change | /api/ayambil/admin/change | Authenticated POST cancellation/restoration/reissue |
| /api/ayambil/admin/whatsapp-retry | /api/ayambil/admin/whatsapp-retry | Authenticated POST confirmed-failure retry |
| /api/collections/ayambil_admins/auth-with-password | Same | POST event-admin login |
| /api/collections/leads/records | Same | Existing POST website lead capture |

The template does not publish PocketBase root/dashboard, superuser endpoints,
settings/schema, arbitrary collections, file or realtime routes. Check other
operator-managed integrations before installation; extend only verified necessary
routes. Keep existing collection authorization; reverse proxying is not authorization.
Audit direct external exposure of PocketBase independently: this include cannot
protect an upstream already reachable publicly. Use a private listener/network or
firewall appropriate to the actual host topology. Keep operator dashboard access
through the existing private administration mechanism, not this public namespace.

The template overrides forwarded HTTPS scheme/port and disables API caching,
including the frontend's seven-day CDN cache policy. Purge only the affected API
paths in the actual CDN after installation. Preserve Authorization and query strings;
do not configure request-body/auth-header logging. Verify trusted proxy settings
and forwarded client-IP handling against the actual CDN/Apache topology.

The proposed connectiontimeout=3 and timeout=10 are starting values below the
Ayambil client's 15-second timeout; they are NOT verified production timings.
Measure on staging and adjust proxy/client timeouts together before approval.
No realtime/SSE consumer was found, so no invented streaming timeout is added.
Retain backend registration body limits and existing rate limiting.

## Approval and verification

1. Keep AYAMBIL_REGISTRATION_OPEN=false/unset and all provider gates closed.
2. Back up only the relevant Apache configuration; resolve upstream and modules.
3. Merge the include into the identified VirtualHost. Run apachectl configtest
   (or httpd -t), then review routing/security with the operator.
4. Obtain explicit operator approval before a graceful reload/restart. Use the
   actual service manager and unit; no service name or restart command is guessed.
5. Test direct upstream health and public
   https://vardhmancreativestudio.com/hcgi/platform/api/health: 200 JSON with
   PocketBase health code/message, never homepage HTML. Check /api/ayambil/status
   under the same prefix returns JSON with open=false.
6. Confirm main page, both evening pages, existing routes and a real hashed static
   asset still load. Confirm backend failures stay errors rather than index.html.
7. Check a known protected event-admin request anonymously returns 401, and a
   real authenticated event-admin GET succeeds. Supply credentials interactively
   in the existing admin UI or a private operator tool; never put them in command
   arguments, shared logs or this repository. Verify date-filter response without
   dumping private records. Do not submit a live registration during proxy testing.
8. Confirm /hcgi/platform/_/, /hcgi/platform/api/collections/_superusers/auth-with-password
   and /hcgi/platform/api/settings are denied. Do not authenticate as a superuser
   through this public proxy. Confirm no-store on successful and error API responses.
9. Do not open registration until VardhmanFlow account/templates and an authorized
   live messaging test have separately passed. A proxy fix alone is insufficient.

Local source review establishes route mapping only. Apache syntax/module checks,
same-host determination, verified upstream connectivity, operator approval and
post-install production tests remain required. No live-proxy success is claimed.

References: https://httpd.apache.org/docs/2.4/mod/mod_proxy.html and
https://httpd.apache.org/docs/2.4/howto/reverse_proxy.html
