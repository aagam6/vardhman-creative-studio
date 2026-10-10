# Phase 3 — separate evening bookings and official WhatsApp confirmation

## Routes and preserved features

- `/500-akhand-ayambil-vijayollas`: three-day programme and all six original artworks;
  two links replace the combined-registration form.
- `/500-akhand-ayambil-vijayollas/manan-sanghvi`: only 2 November 2026, 8 PM.
- `/500-akhand-ayambil-vijayollas/sairam-dave`: only 3 November 2026, 8 PM.
- `/500-akhand-ayambil-vijayollas/passes`: private download access only, no attendance
  verification, QR or scanning.
- `/admin/ayambil`: existing authenticated search, date/status filters, CSV export,
  cancellation/restoration and reissue; message state and failed-send retry added.

Existing combined bookings and passes remain readable and manageable. They are not
rewritten, split, deleted or sent through WhatsApp retrospectively without consent.
New bookings must have exactly one supported evening, matching every attendee.
Required booking contact name/mobile, attendee names and WhatsApp consent are
validated on the server. Mobile must include + and country code. Consent and its
server timestamp are persisted. Idempotent registration and transactional writes
now include one durable confirmation record. Same-number additional bookings remain allowed.

## Migration and permissions

Deploy the reviewed additive migration `1791621000_ayambil_single_evening.js` after
the existing Phase 2 migration. It adds `event_date`, `whatsapp_consent`, `consent_at`
to bookings and creates **only** `ayambil_messages`, an outbox associated uniquely
with a booking. No attendee/pass duplicate collections are created. Down migration
refuses destructive deletion. Keep `--automigrate=false`.

The outbox records queued/sending/accepted/sent/delivered/read/failed/uncertain/cancelled,
current provider reference, prior retry references, attempts, timestamps and a
sanitized failure reason. Administrator-only reads; direct public/admin writes locked.
Custom retry endpoint checks enabled event-admin authentication and recorded consent.
Admin retry can requeue only confirmed failed messages; repeated retries cannot
enqueue additional outbox rows or create bookings/passes.

## VardhmanFlow provider and secure setup

The integration uses the supplied API-Documentation.html REST contract, not the
unofficial apps/whatsapp_sender desktop utility. No live account, approved templates
or message delivery have been verified: credentials were not available locally.
Keep production registration closed. The reported production health response is
HTML, which does not establish a working PocketBase API/proxy.

Required **PocketBase server environment**, never VITE variables:

| Setting | Purpose |
| --- | --- |
| AYAMBIL_FLOW_API_KEY | VardhmanFlow API key |
| AYAMBIL_FLOW_API_SECRET | VardhmanFlow API secret |
| AYAMBIL_FLOW_CHANNEL_ID | Channel ID when the key is not channel-locked; if supplied, account lookup must match it |
| AYAMBIL_FLOW_API_PREFIX | Exact authenticated account prefix: /api/v1 or /api/v1/api/v1; do not guess |
| AYAMBIL_FLOW_TEMPLATE_02 / _03 | Actual APPROVED templates for the two evenings |
| AYAMBIL_FLOW_LANGUAGE_02 / _03 | Exact language returned for each approved template |
| AYAMBIL_FLOW_PARAMETERS_02 / _03 | JSON array of semantic fields in numbered parameter order |
| AYAMBIL_PUBLIC_SITE_URL | Verified public HTTPS frontend origin/base path |
| AYAMBIL_FLOW_TEMPLATES_VERIFIED | true only after channel templates and parameter meanings/order are verified |
| AYAMBIL_DEPLOYMENT_VERIFIED | true only after backend/proxy, pass links, staging sends and status polling are verified |
| AYAMBIL_REGISTRATION_OPEN | Keep false/unset until all deployment checks pass |

Run `node tools/ayambil-flow-inspect.mjs` with credentials injected securely in the
server environment. It performs only GET requests, tries the two documented account
paths (falling back only on 404), rejects redirects and authorization failures,
checks channel identity/health, and lists sanitized approved template metadata.
It never sends a message or prints credentials, phone numbers, account IDs or bodies.
Set API_PREFIX to its confirmed result. Missing credentials result in no request.

Template mappings support contactName, attendeeCount, attendeeNames, eventName,
eventDate, time, performer, programme, venue, passLink and confirmationDetails.
The latter combines booking contact, event title/date/time/programme/venue,
attendee count and private pass link. No template names, languages or variable
counts are assumed. All mappings must include contact and attendee summary plus
pass link, either separately or via confirmationDetails. Confirm static template
copy also matches the event. Dynamic media headers/buttons are not supported.

Before every send batch the worker fetches account and APPROVED templates using
X-API-Key / X-API-Secret and optional X-Channel-Id, checking actual template body
components and numbered placeholders against configured mapping. The supplied
list-response example omits components: if the real response also omits them,
live sends stay blocked until VardhmanFlow supplies the actual body schema through
its template listing (or a documented authenticated template-detail endpoint can
be integrated). Do not assert approval or invent a body schema to bypass this.

POST messages/template uses documented to (digits with country code), templateName,
language and components. Confirmation content is built from persisted registrations
and authoritative programme data. Each booking has one evening, and its private link
opens the saved attendees' current active passes; existing PDF/print/download UI is
preserved. PDF document attachments are not documented, so the API sends a secure
pass-download link. The link's random secret is in the fragment, is sent only in a
POST body to PocketBase, expires after seven days, and is blocked on cancellation.
This is download access, not attendance verification; there is no QR or check-in.

## Delivery status, retry and migration

Deploy additive migration `1791622000_ayambil_vardhmanflow.js` after the two existing
reviewed Ayambil migrations. It adds sent to the existing status enum and a provider
namespace field. It does not delete or recreate bookings, attendees, passes or jobs.
Existing provider references are retained and never polled as VardhmanFlow IDs.

The cron runs every minute, polling up to 20 saved VardhmanFlow message IDs with
GET messages/status/:messageId, then preflighting and sending up to 10 queued jobs.
This uses at most 32 requests/minute under the documented 60/minute limit for this
worker; other users of the same key and subscription quotas must be accounted for.
messageId is stored for lookup, rather than confusing it with whatsappMessageId.
Provider queued means acknowledged/accepted locally; sent, delivered and read are
stored only on corresponding actual responses. Status lookups must match the saved
message ID. Poll failures preserve the last confirmed status and never resend.
Delivery status cannot regress from read/delivered to sent or failed.

Failed provider rejection/delivery may be retried by enabled authenticated event
admins, retaining history and using the same booking, passes and outbox record.
Timeouts, 5xx, malformed acknowledgments and interrupted submissions are uncertain;
they are not automatically resent. An uncertain message with a saved reference can
be reconciled by polling; without one, an operator must reconcile with VardhmanFlow
before authorizing a retry. No general send idempotency guarantee is documented.

The documentation mentions a webhook secret but specifies neither signature header,
algorithm, signed bytes nor event payload. Webhook routes are therefore absent;
no assumed signature or unauthenticated callback can update records. Authenticated
status polling is the implemented delivery mechanism. No webhook configuration is
required. If webhooks are added later, obtain the actual authenticated contract first.

## Deployment checklist and validation

1. Keep registration and delivery gates closed; back up the existing database.
2. Deploy reviewed hooks and additive migrations securely; keep automigrate=false
   and run migrations deliberately against the correct instance.
3. Configure the backend proxy: api/health must return PocketBase JSON, not frontend
   HTML. Validate authenticated admin and private download endpoints over HTTPS.
4. Inject server credentials; run read-only inspection and confirm the channel,
   endpoint prefix, actual approved templates and parameter meanings/order.
5. Test registration and sending with an authorized recipient in staging; verify
   actual provider messageId, delivery polling, correct evening and downloadable PDF.
6. Open production only after backend and provider are actually verified. No secrets
   or official admin accounts are created by this implementation.

Local checks: npm run test --prefix apps/web; npm run lint --prefix apps/web;
node tools/ayambil.integration.test.mjs; production Vite build. Unit tests mock the
VardhmanFlow documented responses; isolated PocketBase tests use disposable data
and a test-only copy of registration hooks, not production credentials or persistence.
These establish local behavior, not live provider acceptance or production readiness.
