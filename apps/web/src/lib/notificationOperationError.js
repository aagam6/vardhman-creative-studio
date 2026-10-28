export function notificationOperationError(path, error) {
  const status = Number.isInteger(error?.status) ? ` (HTTP ${error.status})` : '';
  const reference = /^[a-f0-9-]{36}$/.test(error?.requestId || '') ? ` Reference: ${error.requestId}` : '';
  if (path === 'reconcile') return `Delivery status check unavailable${status}. This action does not send or resend a message. Refresh status or try the delivery check later.${reference}`;
  if (path === 'send') return `Send blocked or unconfirmed${status}. Refresh durable status before any further action; do not retry blindly.${reference}`;
  return `Operation unavailable${status}. Refresh status before trying again. No send was requested by this action.${reference}`;
}
