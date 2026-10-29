# Entry timing revision transition — local patch, not activated

The active six-template catalog and its v1 hash remain unchanged. The separately
versioned 28 October revision contains five BODY slots and the existing combined
pass URL button. Do not assign its definition hash to an outbox source hash.

## Verification seam

`createFlow().verifyEntryRevision({uiEvidence})` uses the existing authenticated
GET transport, channel binding, shared 50/minute request budget and cooldown.
It is default-off unless canonical production origin and both explicit policy
version/hash match `entryRevisionPolicy`. It never prepares, selects a catalog,
changes an owner, or sends. No environment values have been configured here.

Policy: `ayambil-entry-reviewed-2026-10-28-v2`. Exact definition SHA256:
`4ec8dc5f63a5ab8844f16791b040c762e126d6192263b26e93a1049ae7625164`.

Require one current provider UUID/name/en/APPROVED/UTILITY match and configured
healthy channel. Meta numeric ID is separate. Supplied components must exactly
match HEADER/BODY/FOOTER/URL button and reject unsupported or missing components.
When the API omits the entire components field, an explicit policy and fresh
operator UI evidence with exact BODY hash is required. This is snapshot
compatibility, not API component verification. Current API identity remains a
release blocker; UI evidence alone does not resolve it.

## Held-only future transaction (NOT implemented as a live operation)

1. Lock source event, booking, and exact outbox ID. Re-read state held, attempts0,
   null provider ID/claim. Stop on any change; no new round or replacement row.
2. Validate current consent, active nontrashed valid passes, contact-event holds,
   existing combined capability and previous provider/entry/reminder dedup.
3. Decrypt existing input on server only. Reuse input/ID/round/capability/schedule.
   Do not return the token, plaintext envelope or customer payload in diagnostics.
4. Verify the new provider revision and current source using the new builder.
   Compute the source revision hash using the sender's existing canonical hash
   algorithm. The definition hash above is NOT that source revision hash.
5. Compare-and-swap on exact previous source hash, held state, attempts0, null
   provider ID and claim. Update only approved revision/encrypted envelope fields
   if needed; audit old/new hashes and revision, never tokens/phone/body.
   Require affectedRows1, otherwise rollback. Repeated refresh is a no-op.
6. Keep held and scheduled. Commit no notification/job creation, provider call,
   claim, schedule adjustment, or queue owner/config change.

The pure `planEntryRevisionTransition` is tested for exact old hash and immutable
identity. It is a plan, not a mutation API or a promise that live refresh passed.

## Reminder relationship

Current runtime uses purpose reminder with the entry template, previous-day
18:00 IST, and separateEntryNotice=false. Entry drafts are purpose entry_timing.
Preserve the existing cross-purpose attempted-message dedup and one-reminder
selection. A future mapping release must explicitly select the new revision in
both applicable builders without adding a second job. This patch does not select
it in either builder or alter the existing schedule/configuration.

## Receipt audit

`auditKnownReceipts` accepts only status-reader transport, local observation sink
and shared pacing callback. Maximum20 unique IDs per bounded call, no retry on
failure/429, no queue updates. Existing legacy reconcile writes legacy rows and
must not be called under read-only authorization. The helper has mock tests but
has NOT polled live receipts. A supported authenticated GET-only route/export
or server read-only execution is still needed; do not extract browser secrets.

No push/deployment is included. Review local diff, obtain current API evidence,
complete source/capability checks, then separately authorize deployment and any
held-only revision transaction. Keep healthy automation running throughout.
