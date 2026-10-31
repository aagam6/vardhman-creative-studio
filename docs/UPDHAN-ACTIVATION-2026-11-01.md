# Updhan activation preparation — 1 November 2026

User explicitly authorized intake/sending activation and one named test to their supplied number. All six existing categories approved for opening; manual admission/shared capacity300 unchanged. Sensitive-data access expiry configured as end31December2027 IST, not a rolling per-applicant year. No PDF or decision templates activated.

Fresh activation backup created at host `updhan-activation-20261031191432` UTC directory stamp (1November IST): shared DB single-transaction dump, private media and config AES256-GCM encrypted. All three authenticated roundtrips passed. Existing prior recovery material retained. Earlier isolated restore/migration rehearsal remains recorded; this activation introduces no DDL/new user/grants.

Shared durable provider request ledger uses only existing updhan_rate_limits and GET_LOCK scoped to a hash of the existing provider key. Conservative application cap50 per61-second sliding window; this is not a freshly verified provider quota. User declined further quota/profile review. It covers both hosted adapters when explicitly enabled, including metadata/status requests. Updhan reserves3 requests before preflight/send, expiring local reservation45seconds; budget deferral before intent never POSTs/replays. Existing Ayambil flags, templates, owner/cutoff/schedules remain unchanged. Transport remains unchanged while the new coordination flag is off. A budget/store outage fails provider calls closed; booking readiness does not depend on it.

Current approved acknowledgement/channel exact match verified using two GETs only. Existing production VARDHMAN_FLOW credentials retained; read-only verification credentials never used for POST.

Errors return sanitized error codes and support request IDs; unknown failures do not claim rollback. Form retains immutable uncertain attempt; known closed rejection permits corrections. Admin system panel shows sender state/reason, retention and per-message failure code. Runtime preflight logs safe stage names; no raw SQL/PII/secrets. Status reconciliation only uses known provider IDs and never sends a replacement message.

Validation:335 regression tests,332pass,3 opt-in skip,0fail; production buildpassed. Fresh disposable MariaDB test80 concurrent reservations allowed50, restart cap retained, batch reservation passed, outage denied, synthetic Ayambil baseline unchanged. Activation and live delivery evidence to append after deploy; do not interpret this preparation as already ON or delivered.
