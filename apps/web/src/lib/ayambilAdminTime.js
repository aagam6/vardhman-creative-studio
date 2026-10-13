// MySQL dateStrings are UTC without a suffix; never interpret them as browser-local time.
export function adminTimestamp(value) {
  if (typeof value !== 'string' || !value) return '—';
  const utc = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d{1,3})?$/.test(value)
    ? value.replace(' ', 'T') + 'Z' : value;
  if (!/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(utc)) return '—';
  const date = new Date(utc);
  if (!Number.isFinite(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).format(date) + ' IST';
}
