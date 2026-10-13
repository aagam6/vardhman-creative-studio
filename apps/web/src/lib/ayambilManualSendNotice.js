export function manualSendFailureNotice(error) {
  const notices = {
    400: 'Selected message details are invalid. Refresh message status before selecting again.',
    401: 'Administrator session expired. Sign in again before sending.',
    403: 'Sending blocked by session or manual-send policy. Sign in again and check the configured approvals.',
    409: 'Message is not eligible: it may predate manual activation, have prior attempts, or require booking reconciliation. Refresh message status; do not retry blindly.',
    429: 'Manual-send rate limit reached. Wait before selecting another message; do not repeatedly click send.',
  };
  return notices[error?.status] || 'Send could not be confirmed. Refresh and reconcile provider status before any retry.';
}
