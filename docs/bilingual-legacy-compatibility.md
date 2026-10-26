# Bilingual compatibility with the previously working sender
26 October 2026. Local only; no push/deploy/configuration or message sending.

Confirmed prior behavior: legacy prepare uses explicit AYAMBIL_PRODUCTION_TEMPLATE_POLICY with reviewed-template-bodies, but only when provider components field is absent. It still verifies live name/en/APPROVED and exact mappings. The previous success did not prove API BODY availability.

Added the same controlled option for bilingual templates. Opt-in requires canonical production origin, exact version and catalog SHA256. Pinned projection covers Meta IDs, name, en, header, BODY, button URL/label and all parameter positions. Existing operator-reviewed language/identity/approval evidence is required. Current authenticated API must still match unique name/en/APPROVED/UTILITY and healthy configured channel. Present conflicting ID or components field never falls back, including null/empty/partial definitions. Snapshot provenance is explicit in inspection and verification; never labelled API-verified components.

Default strict mode unchanged. No environment flag is enabled automatically. No sending changes. Runtime diagnostics must determine whether API ID is absent or truly conflicting before activation. If API supplies its own unrelated ID namespace, do NOT overwrite/ignore it blindly: confirm documented namespace and mapping first.

Required reviewed settings (not applied): AYAMBIL_BILINGUAL_SNAPSHOT_POLICY=ayambil-bilingual-reviewed-2026-10-25-v1 and AYAMBIL_BILINGUAL_SNAPSHOT_SHA256 equal the policy hash exported by bilingual-snapshot-policy.mjs. Any catalog content/order change alters the expected hash and must be reviewed again. No refresh of live approval was claimed from old screenshots; live name/status/category are mandatory on each validation.

Tests: 10 focused provider/snapshot tests passed, including all six templates, opt-in/hash mismatch, body mutation, present conflicting ID, empty/partial components, wrong language/category, duplicates and GET-only verification with zero POSTs.

Next release step: review local diff, run full regression, deploy under authorization with sending still OFF, inspect sanitized diagnostics, explicitly approve pinned compatibility policy if applicable, then PREPARE without send. A real message is a separate controlled step and still requires duplicate history check. No old customer queue bulk replay.
