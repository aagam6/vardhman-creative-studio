# Provider429 recovery diagnostics

The supplied provider API documentation states60 requests/minute perAPI key and a subscription-tier monthly quota. It does not state separate endpoint allowances or specify Retry-After. Treat account, templates, status and send requests as sharing that key allowance. Do not increase any limit to recover.

One createFlow instance is shared by the production legacy queue, notification service and authenticated inspector. Its existing50/minute rolling limiter covers all those requests, including validation GETs and POST submissions. This is process-local; it is not evidence of a global budget across multiple hosting processes or other API-key clients. Existing database dispatch ownership and17-second submission pacing remain unchanged. A fresh service restart does not reset the provider's key quota.

Authenticated GET /api/ayambil/admin/whatsapp/rate-probe makes at most one provider GET /account. It cannot prepare/send/retry/claim/issue links. Application recovery bucket is1/minute. No request is made during the locally observed cooldown. Use only once after known Retry-After or a conservative quiet period; persistent429 requires operator/provider review, not a loop.

GET /api/ayambil/admin/whatsapp exposes a safe process-local providerBudget snapshot without calling the provider. It includes operations/counts, last HTTPstatus/time, allowlisted request ID and parsed Retry-After. No credential, recipient, message ID or private path is included. Missing Retry-After is reported null, not fabricated.429 starts a conservative minimum60-second local cooldown (longer when provider header requires). Cooldown is not a claim of provider reset time and does not automatically retry anything.

When recovering: dispatchOFF/ownerPaused/workerOFF, allow all provider traffic to quiet; make one account probe. If recovered, reconcile in-flight/uncertain known IDs before reviewed eligibility/sends, keep old campaigns out of automatic transactional selection, retain original cutoff and dedup. If not recovered, preserve exact remaining IDs and prepare sanitized support evidence. No support message is sent without separate authorization.
