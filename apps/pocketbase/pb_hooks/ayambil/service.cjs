const config = require('./config.json');

function fail(message) { throw new Error(message); }
function name(value, label) {
  if (typeof value !== 'string') fail(label + ' is required.');
  const text = value.trim().replace(/\s+/g, ' ');
  if (text.length < 2 || text.length > 120 || /[\x00-\x1f<>]/.test(text)) fail(label + ' must contain 2–120 characters without markup.');
  return text;
}
function validate(body) {
  const contactName = name(body.contactName, 'Booking contact name');
  const mobile = typeof body.mobile === 'string' ? body.mobile.replace(/[\s()-]/g, '') : '';
  if (!/^\+[1-9]\d{7,14}$/.test(mobile)) fail('Enter a valid WhatsApp mobile number with + and country code.');
  if (!config.sessions.some(s => s.date === body.eventDate)) fail('Choose a supported evening event date.');
  if (body.whatsappConsent !== true) fail('Explicit WhatsApp confirmation consent is required.');
  if (body.termsAccepted !== true) fail('Accept the pass terms. / પાસ માટેના નિયમો સ્વીકારો.');
  if (Array.isArray(body.attendees) && body.attendees.length > 2) fail('Maximum 2 attendees per booking. / એક રજિસ્ટ્રેશનમાં વધુમાં વધુ ૨ લોકોનાં નામ ઉમેરો.');
  if (!Array.isArray(body.attendees) || !body.attendees.length) fail('Add at least one attendee.');
  const allowed = config.sessions.map(s => s.date);
  const attendees = body.attendees.map(a => {
    if (!a || !Array.isArray(a.dates) || a.dates.length !== 1 || a.dates[0] !== body.eventDate || allowed.indexOf(a.dates[0]) < 0) fail('Every attendee must register for exactly the booking evening.');
    return { fullName: name(a.fullName, 'Attendee name'), dates: a.dates.slice().sort() };
  });
  if (typeof body.requestKey !== 'string' || !/^[a-f0-9]{64}$/.test(body.requestKey)) fail('A valid submission identifier is required.');
  return { contactName, mobile, attendees, eventDate: body.eventDate, whatsappConsent: true, termsAccepted: true };
}
function admin(e) {
  if (!e.auth || e.auth.collection().name !== 'ayambil_admins' || !e.auth.getBool('enabled')) throw new ForbiddenError('Administrator access is required.');
}
function matches(app, collection, filter, params) {
  return app.findRecordsByFilter(collection, filter, 'created,id', 0, 0, params);
}
function number(prefix) { return prefix + '-' + $security.randomString(16).toUpperCase(); }
function makePass(app, attendee) {
  const pass = new Record(app.findCollectionByNameOrId('ayambil_passes'));
  const dates = attendee.getStringSlice('dates');
  const passNumber = number('AYV26');
  pass.set('attendee', attendee.id); pass.set('number', passNumber); pass.set('status', 'active');
  pass.set('snapshot', { eventName: config.eventName, attendeeName: attendee.getString('full_name'), number: passNumber,
    sessions: config.sessions.filter(s => dates.indexOf(s.date) >= 0), issuedAt: new Date().toISOString() });
  const downloadKey = $security.randomString(64);
  pass.set('download_key', downloadKey); pass.set('download_hash', $security.sha256(downloadKey));
  pass.set('download_expires', new Date(Date.now() + 7 * 86400000).toISOString());
  app.save(pass); return pass;
}
function passData(pass) {
  const snapshot = JSON.parse(pass.getString('snapshot'));
  return { ...snapshot, status: pass.getString('status') };
}
function bookingData(app, booking, privileged) {
  const attendees = matches(app, 'ayambil_attendees', 'booking = {:booking}', { booking: booking.id });
  const messages = matches(app, 'ayambil_messages', 'booking = {:booking}', { booking: booking.id });
  const m = messages[0];
  return { number: booking.getString('number'), status: booking.getString('status'), eventDate: booking.getString('event_date'),
    whatsapp: m ? { status: m.getString('status'), ...(privileged ? { failure: m.getString('failure'), attempts: m.getInt('attempts'), providerRef: m.getString('provider_ref'), attemptedAt: m.getString('attempted_at'), acceptedAt: m.getString('accepted_at'), deliveredAt: m.getString('delivered_at'), history: JSON.parse(m.getString('provider_history') || 'null') || [] } : {}) } : null, created: booking.getString('created'),
    ...(privileged ? { id: booking.id, contactName: booking.getString('contact_name'), mobile: booking.getString('mobile') } : {}),
    attendees: attendees.map(a => ({ ...(privileged ? { id: a.id } : {}), fullName: a.getString('full_name'), dates: a.getStringSlice('dates'), status: a.getString('status'),
      passes: matches(app, 'ayambil_passes', 'attendee = {:attendee}', { attendee: a.id }).map(passData) })),
  };
}
function register(app, body) {
  const valid = validate(body);
  const requestHash = $security.sha256(body.requestKey);
  const payloadHash = $security.sha256(JSON.stringify(valid));
  let response;
  app.runInTransaction(tx => {
    const existing = matches(tx, 'ayambil_bookings', 'request_hash = {:hash}', { hash: requestHash });
    if (existing.length) {
      if (existing[0].getString('payload_hash') !== payloadHash) throw new BadRequestError('This submission identifier was already used with different details. Start a new booking.');
      response = bookingData(tx, existing[0], false); return;
    }
    if ($os.getenv('AYAMBIL_REGISTRATION_OPEN') !== 'true') throw new ForbiddenError('Registration is not open.');
    if (!require('./messaging.cjs').settings(k => $os.getenv(k)).ready) throw new ForbiddenError('Backend and WhatsApp deployment verification is required before registration opens.');
    if (config.closingDate && new Date() > new Date(config.closingDate)) throw new ForbiddenError('Registration has closed.');
    const booking = new Record(tx.findCollectionByNameOrId('ayambil_bookings'));
    booking.set('number', number('BOOK26')); booking.set('contact_name', valid.contactName); booking.set('mobile', valid.mobile);
    booking.set('terms_version', '2026-10-10'); booking.set('terms_accepted_at', new Date().toISOString());
    booking.set('event_date', valid.eventDate); booking.set('whatsapp_consent', true); booking.set('consent_at', new Date().toISOString());
    booking.set('request_hash', requestHash); booking.set('payload_hash', payloadHash); booking.set('status', 'active'); tx.save(booking);
    valid.attendees.forEach(a => {
      const record = new Record(tx.findCollectionByNameOrId('ayambil_attendees'));
      record.set('booking', booking.id); record.set('full_name', a.fullName); record.set('dates', a.dates); record.set('status', 'active');
      tx.save(record); makePass(tx, record);
    });
    const message = new Record(tx.findCollectionByNameOrId('ayambil_messages'));
    const key = $security.randomString(64);
    message.set('booking', booking.id); message.set('status', 'queued'); message.set('download_key', key);
    message.set('download_hash', $security.sha256(key));
    message.set('download_expires', new Date(Date.now() + 7 * 86400000).toISOString()); tx.save(message);
    response = bookingData(tx, booking, false);
  });
  return response;
}
function audit(tx, e, bookingId, action) {
  const log = new Record(tx.findCollectionByNameOrId('ayambil_audit'));
  log.set('actor', e.auth.id); log.set('booking', bookingId); log.set('action', action); tx.save(log);
}
function change(app, e, body) {
  admin(e);
  if (['cancel', 'restore', 'reissue'].indexOf(body.action) < 0) throw new BadRequestError('Unknown action.');
  let result;
  app.runInTransaction(tx => {
    const booking = tx.findRecordById('ayambil_bookings', body.bookingId);
    const attendees = matches(tx, 'ayambil_attendees', 'booking = {:booking}', { booking: booking.id });
    if (body.action === 'reissue') {
      if (booking.getString('status') !== 'active') throw new BadRequestError('Restore the booking before reissuing a pass.');
      const attendee = attendees.find(a => a.id === body.attendeeId);
      if (!attendee || attendee.getString('status') !== 'active') throw new BadRequestError('Active attendee not found in this booking.');
      matches(tx, 'ayambil_passes', 'attendee = {:attendee} && status != "superseded"', { attendee: attendee.id }).forEach(p => { p.set('status', 'superseded'); tx.save(p); });
      makePass(tx, attendee);
    } else {
      const status = body.action === 'cancel' ? 'cancelled' : 'active';
      booking.set('status', status); tx.save(booking);
      attendees.forEach(a => {
        a.set('status', status); tx.save(a);
        matches(tx, 'ayambil_passes', 'attendee = {:attendee} && status != "superseded"', { attendee: a.id }).forEach(p => { p.set('status', status); tx.save(p); });
      });
    }
    audit(tx, e, booking.id, body.action); result = bookingData(tx, booking, true);
  });
  return result;
}
module.exports = { config, validate, admin, register, bookingData, passData, change };
