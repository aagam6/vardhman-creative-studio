# Reviewed manual batch sending

Production remains manual-only. The automatic worker and normal-processing approval remain disabled.

Choose one evening and one notification type, then load the preview. The preview is a read-only query independent of the latest-50 queue display, bounded to 1000 messages. Counts represent messages and bookings, not distinct people. Contacts are masked. No CSV import, arbitrary phone override or new messages are created.

Older bookings require an explicit review checkbox before preview. The default activation boundary remains intact. Review every selected booking/contact before confirming the exact snapshot. Preview changes reset confirmation. The send endpoint rechecks each exact job, active booking, consent, attempts, provider reference, pass capability and in-flight booking state. Concurrent selected jobs for a booking serialize on its booking row.

Keep the browser tab open. Submissions are sequential, spaced at least 13 seconds apart, using the existing 5/minute manual endpoint. Five hundred messages take approximately 108 minutes plus request latency. Confirmation and pass are separate batches. A provider-specific lower limit can still stop a batch; this is not proof of provider throughput capacity.

Stop prevents further submissions after the current request finishes. Closing the tab stops future submissions. There is no automatic resume or retry. Network/API errors, rejected preflight, failed, cancelled or uncertain outcomes stop the batch. An accepted/sent response is not delivery confirmation. Refresh and reconcile provider status before preparing another preview. Old `sending` records without a usable provider reference require operator/provider investigation; never clear their status to resend blindly.

Local tests use synthetic contacts and mocked provider responses. No hosted schema changes or messages are performed by the test suite.
