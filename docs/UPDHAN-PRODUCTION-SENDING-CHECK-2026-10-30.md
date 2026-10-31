# Production WhatsApp preparation: sending remains OFF

Scope: user selected production real-sending preparation and verification, not activation or a test message. No hosted environment, database, queue, deployment or message was changed.

## Fresh read-only evidence

- Hostinger latest deployment completed at revision `5d0828a803a24852da25c6c49ee11b7a11284155` (PR47). Main automatic deployment remains enabled. Review branch `d86883c` must be reconciled against this newer Ayambil release before deployment; do not deploy its older base over main.
- Hosted environment inventory contains existing `DB_*` and `VARDHMAN_FLOW_*` keys, but no `UPDHAN_*` keys. Values are masked: key presence does not verify credential values. No full-replace environment operation was performed.
- Two authenticated metadata GETs with the existing read-only verification credential confirmed channel matches, active and healthy; exact template APPROVED, hi, UTILITY; all header/body/footer/button content matches.
- Provider UUID `49bffc8a-734f-423b-85c8-0a1883732e08`; Meta ID `1858961825552892`; template `updhan_registration_received_v1`. Ordered body variables: applicant name, registration reference. Text only, no PDF.
- 11 targeted tests passed: metadata identity/content, existing production credential selection, disabled-network default, rate reservation guard, ordered variables, accepted versus delivered, changed-template rejection, encryption, durable intent, uncertain outcome and disabled worker.

## Exact activation prerequisites

1. Review compatibility with latest main, then separately authorize push/merge/deployment. Current no-merge boundary remains.
2. Backup and restore-test shared database/private media; apply only reviewed additive Updhan tables under the existing database user. No Ayambil schema or data mutations.
3. Configure only missing Updhan-specific secrets/storage/settings securely while preserving all existing environment values. Masked values must never be copied into a replace request. Verify private directory from the actual hosted Node process.
4. Compose the acknowledgement repository, provider, worker and supervisor in production; current runtime does not start a sender. Use existing `VARDHMAN_FLOW_*` credentials and a separate Updhan owner/lease. Do not start another Ayambil worker.
5. Supply reviewed provider request-budget reservation; current guard fails closed without it. Expected event non-overlap is not a verified provider allowance. No arbitrary limit has been invented.
6. Hosted no-send acceptance: exact template preflight, current consent/status checks, queue ownership, reviewed eligibility/count preview, no historical backlog dispatch, status reconciliation and restart recovery. Uncertain/submitted jobs must never be resent.
7. Obtain explicit activation scope for real sending after the above checks. Enable only receipt acknowledgements; approval/rejection templates and PDF remain disabled. A real test requires an explicitly designated recipient and message scope.

Rollback: disable only Updhan sender/owner, preserve durable outbox and provider IDs, reconcile known IDs without POST replay. Leave Ayambil settings and automation unchanged.

No claim of hosted sender readiness or current production-key send permission is made by read-only template verification.
