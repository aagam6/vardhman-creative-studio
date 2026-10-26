# Vardhman Flow template ID contract

Reviewed local provider export: API-Documentation.html, generated October 10, 2026, SHA256 `942df1a05d34b3e1fa6daf29c0623361816463d7d7cd8513a5f60e01c18ed5d0`.

GET `/api/v1/templates?status=APPROVED` returns an array with `id: "uuid-xxx"`, name, status, language and category. It does not document Meta numeric template IDs or component definitions. The exported cURL samples accidentally repeat `/api/v1`; the configured canonical base plus endpoint suffix remains unchanged.

Provider UUID and reviewed Meta numeric ID are separate namespaces. Lookup requires unique name/en, a valid UUID unique within the response, APPROVED/UTILITY, and an active healthy configured channel. UUID is exposed in authenticated diagnostics, never compared directly with Meta ID. Meta ID remains pinned in the reviewed catalog and is labelled accordingly.

Exact version/hash opt-in continues to govern absent-component fallback. Header/BODY/CTA and parameter order come from the explicitly reviewed catalog with `operator_reviewed_snapshot` provenance. Any supplied null/empty/partial/mismatched components block fallback. Valid supplied full components must compare exactly. No automatic dispatch or worker activation, migration, queue replay or booking/pass mutation is included.

Activation uses the existing reviewed policy/hash after confirming current live identity. Read-only history audit precedes targeted no-send Prepare. Dispatch stays OFF, owner Paused, worker OFF throughout.
