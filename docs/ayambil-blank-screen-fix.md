# Ayambil blank-screen remediation — 11 October 2026

## Confirmed cause and local fix

The passes page contains one direct `.map()` over passes state. State starts as an array, but successful API responses previously assigned `data.passes` without validation. A missing passes field changed state to undefined, causing the reported render exception. Descendant PDF rendering maps `pass.sessions`; issued snapshots must also have a valid session array and venue string.

The installed PocketBase SDK was exercised with a synthetic HTTP 200 HTML response: it returned an empty object, with `data.passes === undefined`. This matches the crash mechanism and the previously reported SPA/API routing problem. The supplied Network screenshot shows HTTP 200 for pass-download but does not include its response content type/body. Therefore HTML fallback is reproduced, not asserted as the definitively observed production response. Malformed JSON without passes has the same failure. Obtain sanitized response content type and shape (no private key or attendee data) to establish the upstream production cause.

`ayambilApiResponse.js` rejects successful non-JSON responses before SDK parsing and validates the attendee-specific response envelope plus render-critical saved pass/session fields. It does not synthesize pass data, default an invalid contract to success, alter the backend, or loosen download authorization. Empty arrays remain legitimate empty states; more than one pass is rejected under the existing attendee-specific contract.

`AyambilPassDownloadPage.jsx` validates fragment capability format before requesting the backend, keeps passes state an array, and supplies loading, unavailable-link and empty-result states. Hash removal and private-link handling are retained. PDF generation/download/print code is unchanged.

## Admin and manifest findings

The supplied admin console shows manifest 429 errors only, no JavaScript render stack. Source inspection shows the login form renders before any booking-array access; authenticated booking lists and integration metadata require the documented JSON response. The shared registration transport now rejects HTML success for these operations too, routing errors to their existing catch/error states. No speculative admin-specific changes were made; authenticated malformed booking payloads and actual admin browser rendering are not verified here.

The manifest is an existing static JSON file linked once from apps/web/index.html. Its app branding is for the unrelated Param Vir Chakra page. There is no manifest fetch loop or local 429 rule in the inspected index/.htaccess. The screenshot proves a server-side 429 response, not its issuing layer. A failed webmanifest fetch does not itself throw a React render exception. Preserve the global manifest; do not remove it to conceal the server error. The operator should inspect response Retry-After/server/request-ID headers and hosting/CDN/WAF logs for the static path, then review narrow static-asset rate-limit/cache configuration if warranted. No server settings changed. Direct live inspection remains blocked by the existing saved browser denial; no alternate network/browser route was used to bypass it.

## Verification actually executed

- SDK synthetic-response reproduction: confirmed empty object and undefined passes from HTTP 200 HTML.
- `npm run test --prefix apps/web`: 23 passed, including SDK reproduction, corrected transport rejection, valid/empty results, malformed/missing pass/session data and attendee-isolation envelope rejection.
- `npm run lint --prefix apps/web`: passed.
- `npm run build --prefix apps/web`: initial sandbox EPERM realpath failure; authorized retry passed, 2,326 modules, output dist/apps/web.
- `node tools/ayambil.supabase.test.mjs`: four suites passed, 49 reported local assertions; provider mocked.
- `node tools/ayambil.integration.test.mjs`: initial sandbox process start failure; authorized retry passed 59 disposable PocketBase checks including private link expiry/cancellation/reissue and no-store.
- Actual production browser/download/PDF/print/admin authentication and production response-body inspection: not performed. Prior browser denial persists; no permission workaround attempted.

## Changed files and release steps

Changed: `apps/web/src/lib/ayambilRegistration.js`, `apps/web/src/pages/AyambilPassDownloadPage.jsx`. Added: `apps/web/src/lib/ayambilApiResponse.js`, `apps/web/tests/ayambilApiResponse.test.js`, this report. Unrelated App/sitemap/Updhan work preserved; no commits, push or deployment in this task.

Review these files, then separately approve frontend deployment. Confirm public PocketBase API routing returns JSON, not a SPA fallback. After authorized deployment check missing/invalid private link, synthetic valid attendee link, expired/cancelled/superseded link, admin sign-in/error handling and PDF download. Resolve manifest 429 through server evidence separately. No remote migrations, secrets, live data, registration flags or WhatsApp flags changed; no real messages sent.
