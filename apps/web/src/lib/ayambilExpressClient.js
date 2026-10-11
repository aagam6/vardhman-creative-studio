import { fetchAyambilJson, validatePassDownload } from './ayambilApiResponse.js';

export function createAyambilApi(transport = fetchAyambilJson) {
  let csrf = '';
  const authenticated = data => {
    if (data?.authenticated !== true || !/^[a-f0-9]{64}$/.test(data.csrfToken || '')) throw new Error('Invalid administrator session');
    return data;
  };
  async function request(path, options = {}) {
    if (!/^[a-z-]+(?:\/[a-z-]+)?$/.test(path)) throw new Error('Invalid API operation');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const method = options.method || 'GET';
    const query = new URLSearchParams(options.query || {}).toString();
    const headers = { Accept: 'application/json' };
    if (method !== 'GET') headers['Content-Type'] = 'application/json';
    if (path.startsWith('admin/') && method === 'POST' && csrf) headers['X-CSRF-Token'] = csrf;
    try {
      const response = await transport(`/api/ayambil/${path}${query ? '?' + query : ''}`, {
        method, headers, credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
        ...(method !== 'GET' ? { body: JSON.stringify(options.body || {}) } : {}),
      });
      if (!response.ok) {
        const error = new Error(response.status === 401 ? 'Administrator sign-in required' : 'Ayambil API unavailable. Please retry.');
        error.status = response.status;
        if (response.status === 401) csrf = '';
        throw error;
      }
      const data = await response.json();
      validateResponse(path, data);
      if (path === 'register' && data.attendees.some(attendee => attendee.dates[0] !== options.body?.eventDate)) throw new Error('Incorrect registered evening');
      return data;
    } finally { clearTimeout(timeout); }
  }
  return {
    request,
    async restore() { csrf = ''; const result = authenticated(await request('admin/session', { method: 'POST' })); csrf = result.csrfToken; return result; },
    async login(email, password) {
      csrf = '';
      const result = authenticated(await request('admin/login', { method: 'POST', body: { email, password } }));
      csrf = result.csrfToken;
      try { const confirmed = await request('admin/session'); if (confirmed?.authenticated !== true) throw new Error('Sign-in not confirmed'); return confirmed; }
      catch (error) { csrf = ''; throw error; }
    },
    async logout() { try { await this.restore(); const result = await request('admin/logout', { method: 'POST' }); if (result?.authenticated !== false) throw new Error('Sign-out not confirmed'); } finally { csrf = ''; } },
  };
}

function booking(data, privileged = false) {
  if (!data || typeof data.number !== 'string' || !data.number || !['active', 'cancelled'].includes(data.status) || !Array.isArray(data.attendees) || data.attendees.length < 1 || data.attendees.length > 2 || (privileged && typeof data.id !== 'string')) throw new Error('Invalid booking response');
  for (const attendee of data.attendees) {
    if (typeof attendee.fullName !== 'string' || !Array.isArray(attendee.dates) || attendee.dates.length !== 1 || !Array.isArray(attendee.passes) || !attendee.passes.length || (privileged && typeof attendee.id !== 'string')) throw new Error('Invalid attendee response');
    for (const pass of attendee.passes) {
      validatePassDownload({ passes: [pass] });
      if (!['active', 'cancelled', 'superseded'].includes(pass.status) || pass.sessions[0].date !== attendee.dates[0] || pass.attendeeName !== attendee.fullName) throw new Error('Invalid saved pass association');
    }
  }
}
export function validateResponse(path, data) {
  if (path === 'status' && (typeof data?.ready !== 'boolean' || typeof data.open !== 'boolean' || data.whatsapp !== 'disabled')) throw new Error('Invalid availability response');
  if (path === 'register') {
    booking(data);
    if (data.downloadKeys !== undefined && (!Array.isArray(data.downloadKeys) || data.downloadKeys.length !== data.attendees.length || data.downloadKeys.some(key => !/^[a-f0-9]{64}$/.test(key)))) throw new Error('Invalid private links');
  }
  if (path === 'pass-download') validatePassDownload(data);
  if (path === 'admin/bookings') {
    if (!Array.isArray(data?.items) || !Number.isInteger(data.page) || data.page < 1 || typeof data.hasMore !== 'boolean' || data.integration?.ready !== false || !Array.isArray(data.integration.missing)) throw new Error('Invalid bookings response');
    data.items.forEach(item => booking(item, true));
  }
  if (path === 'admin/change') {
    booking(data, true);
    if (data.downloadKey !== undefined && !/^[a-f0-9]{64}$/.test(data.downloadKey)) throw new Error('Invalid reissued link');
  }
}
