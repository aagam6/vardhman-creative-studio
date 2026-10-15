import { fetchAyambilJson, validatePassDownload } from './ayambilApiResponse.js';

export const supportedOperations = Object.freeze({
  health: ['GET'], status: ['GET'], register: ['POST'], 'pass-download': ['POST'],
  'admin/login': ['POST'], 'admin/session': ['GET', 'POST'], 'admin/logout': ['POST'],
  'admin/overview': ['GET'], 'admin/bookings': ['GET'], 'admin/change': ['POST'], 'admin/whatsapp-retry': ['POST'],
  'admin/whatsapp': ['GET'], 'admin/whatsapp/inspect': ['POST'], 'admin/messages': ['GET'],
  'admin/messages/test': ['POST'], 'admin/messages/process': ['POST'],
  'admin/messages/status': ['POST'], 'admin/messages/reminder': ['POST'],
  'admin/messages/process-test': ['POST'],
  'admin/messages/send-selected': ['POST'],
  'admin/messages/batch-preview': ['GET'],

});

export function createAyambilApi(transport = fetchAyambilJson) {
  let csrf = '';
  const authenticated = data => {
    if (data?.authenticated !== true || !/^[a-f0-9]{64}$/.test(data.csrfToken || '')) throw new Error('Invalid administrator session');
    return data;
  };
  async function request(path, options = {}) {
    const method = options.method || 'GET';
    if (!Object.hasOwn(supportedOperations, path) || !supportedOperations[path].includes(method)) throw new Error('Invalid API operation');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const queryParams = new URLSearchParams(options.query || {});
    if (path.startsWith('admin/') && method === 'GET') queryParams.set('_fresh', globalThis.crypto.randomUUID());
    const query = queryParams.toString();
    const headers = { Accept: 'application/json' };
    if (method !== 'GET') headers['Content-Type'] = 'application/json';
    if (path.startsWith('admin/') && method === 'POST' && csrf) headers['X-CSRF-Token'] = csrf;
    try {
      const response = await transport(`/api/ayambil/${path}${query ? '?' + query : ''}`, {
        method, headers, credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
        ...(method !== 'GET' ? { body: JSON.stringify(options.body || {}) } : {}),
      });
      if (!response.ok) {
        if (response.status === 403 && ['admin/messages/test', 'admin/messages/process-test'].includes(path)) {
          let failure; try { failure = await response.json(); } catch { /* Never echo raw error bodies. */ }
          if (failure?.errorCode === 'STAGING_TEST_ONLY') {
            const error = new Error('Test sending is available only on authorized staging. Production test sending is disabled.');
            error.status = 403; throw error;
          }
        }
        const error = new Error([401, 403].includes(response.status) ? 'Administrator authentication or session confirmation required' : `Ayambil API request failed (HTTP ${response.status}). Please retry.`);
        error.status = response.status;
        const requestId=response.headers.get('x-request-id');
        if (/^[a-f0-9-]{36}$/.test(requestId || '')) error.message += ` Reference: ${requestId}`;
        if (response.status === 401) csrf = '';
        throw error;
      }
      if (!/^application\/(?:json|[\w.+-]+\+json)(?:\s*;|$)/i.test(response.headers.get('content-type') || '')) throw new Error('Ayambil API did not return JSON');
      let data;
      try { data = await response.json(); } catch { throw new Error('Ayambil API returned invalid JSON'); }
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
    async logout() { try { const result = await request('admin/logout', { method: 'POST' }); if (result?.authenticated !== false) throw new Error('Sign-out not confirmed'); } finally { csrf = ''; } },
  };
}

function booking(data, privileged = false) {
  if (!data || typeof data.number !== 'string' || !data.number || !['active', 'cancelled'].includes(data.status) || !Array.isArray(data.attendees) || data.attendees.length < 1 || data.attendees.length > 6 || (privileged && typeof data.id !== 'string')) throw new Error('Invalid booking response');
  for (const attendee of data.attendees) {
    if (typeof attendee.fullName !== 'string' || !Array.isArray(attendee.dates) || attendee.dates.length !== 1 || !Array.isArray(attendee.passes) || !attendee.passes.length || (privileged && typeof attendee.id !== 'string')) throw new Error('Invalid attendee response');
    for (const pass of attendee.passes) {
      validatePassDownload({ passes: [pass] });
      if (!['active', 'cancelled', 'superseded'].includes(pass.status) || pass.sessions[0].date !== attendee.dates[0] || pass.attendeeName !== attendee.fullName) throw new Error('Invalid saved pass association');
    }
  }
}
export function validateResponse(path, data) {
  if(path==='admin/overview' && (data?.scope!=='event'||!data.totals||['bookings','activeBookings','cancelledBookings','activePasses','cancelledPasses','pendingMessages','failedMessages'].some(key=>!Number.isSafeInteger(data.totals[key])||data.totals[key]<0)||!Array.isArray(data.activity)))throw new Error('Invalid event overview');
  if (path === 'status' && (typeof data?.ready !== 'boolean' || typeof data.open !== 'boolean' || !['disabled', 'configured'].includes(data.whatsapp))) throw new Error('Invalid availability response');
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

export function registrationAvailability(data) {
  validateResponse('status', data);
  return data.ready ? (data.open ? 'open' : 'closed') : 'unavailable';
}
