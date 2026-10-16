// Validate server-issued data at the API boundary; never fabricate pass details.
export function validatePassDownload(data,bookingScope=false) {
  if (!data || !Array.isArray(data.passes)) throw new Error('Invalid pass response');
  if (data.passes.length > (bookingScope?6:1)) throw new Error('Attendee-specific response required');
  if(bookingScope&&(data.scope!=='booking'||typeof data.bookingNumber!=='string'||!data.bookingNumber||!data.passes.length||new Set(data.passes.map(p=>p?.number)).size!==data.passes.length))throw new Error('Invalid booking pass response');
  for (const pass of data.passes) {
    if (!pass || typeof pass.number !== 'string' || !pass.number ||
        typeof pass.attendeeName !== 'string' || !pass.attendeeName ||
        !Array.isArray(pass.sessions) || pass.sessions.length !== 1 ||
        !pass.sessions[0] || !['2026-11-02', '2026-11-03'].includes(pass.sessions[0].date) ||
        ['performer', 'programme', 'label', 'time', 'venue', 'address'].some(field => typeof pass.sessions[0][field] !== 'string')) {
      throw new Error('Invalid issued pass');
    }
  }
  if(bookingScope&&(data.passes.some(p=>p.status!=='active')||new Set(data.passes.map(p=>p.sessions[0].date)).size!==1))throw new Error('Invalid booking pass response');
  return data.passes;
}

export async function fetchAyambilJson(url, options) {
  const response = await fetch(url, options);
  // A SPA fallback can return HTTP 200 HTML. The SDK otherwise treats a
  // non-JSON success as empty data, hiding the routing failure from callers.
  if (response.ok && !/^application\/(?:json|[\w.+-]+\+json)(?:\s*;|$)/i.test(response.headers.get('content-type') || '')) {
    throw new Error('Ayambil API did not return JSON');
  }
  return response;
}
