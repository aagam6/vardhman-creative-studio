routerAdd('GET', '/api/ayambil/status', e => {
  const service = require(__hooks + '/ayambil/service.cjs');
  ['ayambil_bookings', 'ayambil_attendees', 'ayambil_passes', 'ayambil_admins', 'ayambil_messages'].forEach(name => e.app.findCollectionByNameOrId(name));
  e.response.header().set('Cache-Control', 'no-store');
  const closed = service.config.closingDate && new Date() > new Date(service.config.closingDate);
  const messaging = require(__hooks + '/ayambil/messaging.cjs').settings(k => $os.getenv(k));
  return e.json(200, { ready: true, open: $os.getenv('AYAMBIL_REGISTRATION_OPEN') === 'true' && !closed && messaging.ready, whatsapp: messaging.ready ? 'configured' : 'setup_required' });
});
routerAdd('POST', '/api/ayambil/register', e => {
  const service = require(__hooks + '/ayambil/service.cjs');
  const body = e.requestInfo().body;
  try { service.validate(body); } catch (error) { throw new BadRequestError(error.message); }
  e.response.header().set('Cache-Control', 'no-store');
  return e.json(200, service.register(e.app, body));
}, $apis.bodyLimit(1024 * 1024), $apis.skipSuccessActivityLog());
routerAdd('GET', '/api/ayambil/admin/bookings', e => {
  const service = require(__hooks + '/ayambil/service.cjs'); service.admin(e);
  const query = e.requestInfo().query;
  const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
  const search = String(query.search || '').slice(0, 120);
  const date = String(query.date || ''); const status = String(query.status || '');
  if (date && !service.config.sessions.some(s => s.date === date)) throw new BadRequestError('Invalid evening date.');
  if (status && ['active', 'cancelled'].indexOf(status) < 0) throw new BadRequestError('Invalid status.');
  let filter = 'id != ""'; const params = {};
  if (search) { filter += ' && (contact_name ~ {:search} || mobile ~ {:search} || number ~ {:search} || ayambil_attendees_via_booking.full_name ?~ {:search})'; params.search = search; }
  if (status) { filter += ' && status = {:status}'; params.status = status; }
  if (date) { filter += ' && ayambil_attendees_via_booking.dates:each ?= {:date}'; params.date = date; }
  const records = e.app.findRecordsByFilter('ayambil_bookings', filter, '-created,id', 50, (page - 1) * 50, params);
  e.response.header().set('Cache-Control', 'no-store');
  return e.json(200, { page, items: records.map(b => service.bookingData(e.app, b, true)), hasMore: records.length === 50,
    integration: require(__hooks + '/ayambil/messaging.cjs').settings(k => $os.getenv(k)) });
}, $apis.requireAuth('ayambil_admins'), $apis.skipSuccessActivityLog());
routerAdd('POST', '/api/ayambil/admin/change', e => {
  const service = require(__hooks + '/ayambil/service.cjs'); service.admin(e);
  e.response.header().set('Cache-Control', 'no-store');
  return e.json(200, service.change(e.app, e, e.requestInfo().body));
}, $apis.requireAuth('ayambil_admins'), $apis.bodyLimit(16384), $apis.skipSuccessActivityLog());
