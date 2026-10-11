# Ayambil MySQL migration prerequisite — 11 October 2026

## Verified account configuration (read-only)

Authenticated Hostinger `hosting_websites_list` identifies vardhmancreativestudio.com as an enabled `nodejs` website (horizons_uuid null). `hosting_nodejs_build-settings` returns:

```json
{"node_version":22,"app_type":"other","root_directory":null,"output_directory":"dist/apps/web","build_script":"build","entry_file":null,"package_manager":"npm"}
```

The current build is configured to publish the frontend output, with no configured application entry file. This does not prove the plan cannot run Express; it establishes that this site's current settings do not identify an Express process. No production process mapping, platform PORT behavior or same-origin Express routing was verified. Node 22 build support alone is insufficient evidence of a continuously running API.

Repository root start launches PocketBase; apps/web start launches Vite preview. Neither is a production Express entry point. No existing Express server was found in inspected source/deployment configuration. .htaccess currently provides SPA fallback and public caching; it must not be used to invent a managed-Node proxy.

User explicitly requires stopping if deployment configuration cannot route requests to Express. Implementation is stopped at this prerequisite. No mysql2/Express dependencies, schema or frontend migration have been introduced. MySQL existence, grants, limits and connectivity have not yet been audited; no database connection was attempted.

## Existing operations to preserve

Ayambil uses a separate PocketBase client from the unrelated website lead client. Its public base is VITE_AYAMBIL_POCKETBASE_URL or /hcgi/platform. Calls include GET status; POST register; PocketBase collection ayambil_admins password authentication; GET admin/bookings with search/date/status/page; paginated frontend CSV export; POST admin/change with cancel/restore/reissue; POST admin/whatsapp-retry; POST pass-download with fragment capability. Admin sign-out clears the memory auth store. PDF generation/printing runs in the existing browser component from saved snapshots.

The replacement must preserve explicit terms/WhatsApp consent, one evening, max two attendees, same-key retry semantics, atomic booking/attendee/pass issuance, attendee-specific expiring capabilities, cancellation/restoration and reissue revocation. PocketBase cron messaging and provider-status processing must remain disabled under the new implementation until separate review. Supabase is not a fallback.

## Exact hosting information needed before implementation resumes

In hPanel Websites → vardhmancreativestudio.com → the application's Node.js deployment/build settings, inspect (do not change yet) whether a persistent Express framework/application mode and server entry file can be selected for the existing site. Provide a sanitized screenshot or support confirmation covering:

1. Supported Express application type and server entry-file path relative to repository/application root; whether source dependencies remain available at runtime rather than only dist/apps/web.
2. Whether the platform forwards all site requests to the running process, including /api/ayambil/*, and supplies PORT. Confirm HTTPS termination and static/SPA coexistence with this mode.
3. Build script, working/root directory, start mechanism, Node 22 patch version, runtime restart and deployment rollback method. Existing router dependency requires Node >=22.22.0; major version alone is not sufficient.
4. Ability to set server-only DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD and future session configuration without exposing values to the browser. Do not paste values into chat.
5. Existing included MySQL database availability and application-to-MySQL connectivity, without modifying schema or external connection permissions. Use the account's actual internal connection details; do not assume localhost/3306 or an external database hostname.
6. Explicit CDN cache bypass for the complete API namespace on successes, errors and auth responses, preserving static caching elsewhere. Origin no-store must not be overridden at the edge.

If no persistent-process mode exists for this site configuration, request Hostinger's supported same-account alternative and any included slot requirements before choosing a different topology. No new paid service or silent PocketBase/Supabase fallback.

## Planned review package after this blocker is resolved

A single server entry point should mount /api/ayambil before static assets/SPA fallback, listen on platform PORT, validate DB configuration and use a limited mysql2/promise pool. It must not migrate schema automatically. Versioned SQL should cover admins/hashed sessions, settings/evenings, bookings/attendees, unique idempotency records, pass snapshots/revisions, hashed expiring capabilities, audit and disabled message attempts. Supply a secure offline first-admin procedure, authenticated same-origin cookies/CSRF protections and login rate limiting. Keep status closed and messaging disabled.

Use a disposable MySQL instance/schema for actual transaction/concurrency/rollback and authorization tests; mocks must be labelled. Back up the eventual existing database and current deploy privately before any separately approved migration. Determine whether real PocketBase records exist before planning export/import; preserve pass numbers/snapshots and define private-link redistribution. Rollback must restore a verified runnable backend, not merely point at the currently broken HTML route. Production gate activation is a separate approval after hosted acceptance.

No tests/build were run: only this documentation was added and existing app source was unchanged. Git state inspected on codex/ayambil-hostinger-deploy; local origin/main reference 9a2b741 was read without fetching. Existing Updhan, App/sitemap and blank-screen fix work preserved. No staging, commit, push, deployment, account setting/cache/DNS change, database migration/data access, registration activation or WhatsApp message occurred.
