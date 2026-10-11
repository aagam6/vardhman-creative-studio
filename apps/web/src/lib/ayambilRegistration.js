import { validateBooking as validateBookingFields } from './ayambilBookingValidation';
import PocketBase, { BaseAuthStore } from 'pocketbase';
import config from '../../../pocketbase/pb_hooks/ayambil/config.json';
import { csvCell } from './ayambilPassUtils';
import { fetchAyambilJson } from './ayambilApiResponse';

// URL only; never put administrator credentials in VITE_* environment variables.
const endpoint = import.meta.env.VITE_AYAMBIL_POCKETBASE_URL || '/hcgi/platform';
// Admin auth stays in memory and is never shared with the existing site's client.
export const ayambilClient = new PocketBase(endpoint, new BaseAuthStore());
export const eveningConfig = config;
export async function registrationApi(path, options = {}) {
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 15000);
  try { return await ayambilClient.send(`/api/ayambil/${path}`, { ...options, fetch: fetchAyambilJson, signal: controller.signal, requestKey: null }); }
  finally { clearTimeout(timeout); }
}
export function requestKey() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
}
export const validateBooking = booking => validateBookingFields(booking, config.sessions.map(s => s.date));
export function downloadCsv(rows) {
  const blob = new Blob(['\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = 'ayambil-attendees.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
