# Scheduled bilingual entry reminder

The modern automatic reminder is one job per eligible booking using `ayambil_entry_timing_bilingual` (`en`, eight sequential BODY parameters), not an additional entry campaign. Its ledger purpose remains `reminder`, round `initial`; the legacy five-field reminder is not dispatched by this worker.

- Manan: 1 November 2026, 18:00 IST (`2026-11-01T12:30:00.000Z`).
- Sairam: 2 November 2026, 18:00 IST (`2026-11-02T12:30:00.000Z`).
- Window ends at local midnight before each event. No early preparation/submission, no next-day catch-up. The shared pacing means the batch starts at 18:00; all recipients are not promised the same second.
- Existing reminder opt-in, healthy owner, original transactional cutoff and exclusive dispatch lease remain unchanged. No new scheduler or campaign worker.
- Provider preflight validates the bilingual template/channel identity, language, approved Utility status and reviewed BODY/header/components; absent API components retain the explicitly approved pinned-snapshot contract. A mismatch or stale/missing validation blocks.
- Prior attempted/submitted/uncertain reminder OR entry-timing notification for the same booking excludes another submission, regardless of entry notice round. Existing legacy reminder history also excludes. Selection and immediately-before-provider guards both enforce this. Only the current exact claimed outbox ID is excluded from the competing-attempt check during its own pre-submit revalidation.
- Active consented confirmed bookings with valid passes only; Waiting/cancelled/Trash and unresolved duplicate/repeated-name holds remain excluded. No response/booking/pass mutation or legacy queue processing.
- Local validation uses disposable MySQL and synthetic in-memory provider only. No real message is a deployment test.
