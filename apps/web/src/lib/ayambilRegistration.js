import { validateBooking as validateBookingFields } from './ayambilBookingValidation';
import { createAyambilApi } from './ayambilExpressClient.js';
import config from '../../../api/programme.json';
import { csvCell } from './ayambilPassUtils';



export const eveningConfig = config;
export const ayambilApi = createAyambilApi();
export const registrationApi = (path, options) => ayambilApi.request(path, options);
export function requestKey() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
}
export const validateBooking = booking => validateBookingFields(booking, config.sessions.map(s => s.date));
export function downloadCsv(rows) {
  const blob = new Blob(['\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = 'ayambil-attendees.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
