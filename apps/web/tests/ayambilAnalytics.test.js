import test from 'node:test';
import assert from 'node:assert/strict';
import { createAyambilAnalytics, createRegistrationFunnel } from '../src/lib/ayambilAnalytics.js';
import { MEASUREMENT_ID } from '../src/lib/websiteAnalytics.js';
import { submitRegistration } from '../src/lib/ayambilRegistrationRecovery.js';

function browser(storage = new Map()) {
  const calls = [];
  return { calls, location: { href: 'https://vardhmancreativestudio.com/500-akhand-ayambil-vijayollas/sairam-dave?phone=PRIVATE#TOKEN' }, gtag: (...args) => calls.push(args), sessionStorage: { getItem: k => storage.get(k), setItem: (k, v) => storage.set(k, v) } };
}

test('funnel steps emit once and success waits for verified six-pass retry recovery', async () => {
  const win = browser();
  const emit = createAyambilAnalytics(win);
  const funnel = createRegistrationFunnel(emit, '2026-11-03');
  for (const name of ['registration_view', 'registration_start', 'registration_review', 'registration_submit']) {
    funnel(name, { passCount: 6 }); funnel(name, { passCount: 6 });
  }
  assert.equal(win.calls.some(c => c[1] === 'booking_success'), false);
  const payload = { requestKey: 'PRIVATE-KEY', attendees: Array.from({length: 6}, (_, i) => ({ fullName: `PRIVATE-NAME-${i}` })) };
  const saved = { number: 'PRIVATE-BOOKING', status: 'active', attendees: payload.attendees.map(a => ({ ...a, passes: [{number:'PRIVATE-PASS'}] })) };
  let requests = 0;
  const receipt = await submitRegistration(async (_, options) => {
    assert.equal(options.body, payload);
    if (++requests === 1) throw new Error('Response lost after save');
    return saved;
  }, payload);
  funnel('booking_success', { passCount: receipt.attendees.length, bookingKey: receipt.number });
  funnel('booking_success', { passCount: 6, bookingKey: receipt.number });
  assert.equal(requests, 2);
  assert.deepEqual(win.calls.map(c => c[1]), ['registration_view', 'registration_start', 'registration_review', 'registration_submit', 'booking_success']);
  assert.equal(win.calls.at(-1)[2].pass_count, 6);
  assert.equal(win.calls.at(-1)[2].programme_name, 'sairam_dave');
  assert.doesNotMatch(JSON.stringify(win.calls), /PRIVATE|TOKEN|phone|fullName|bookingKey/);
  assert.equal(saved.attendees.length, 6);
});

test('success deduplicates across remounts and fresh controllers; new booking still counted', () => {
  const win = browser();
  const details = {eventDate:'2026-11-02',passCount:2,bookingKey:'local-receipt'};
  assert.equal(createAyambilAnalytics(win)('booking_success', details), true);
  assert.equal(createAyambilAnalytics(win)('booking_success', details), false);
  assert.equal(createAyambilAnalytics(win)('booking_success', {...details,bookingKey:'different-receipt'}), true);
  assert.equal(win.calls.length, 2);
});

test('analytics failure, unavailable storage and blocked scripts cannot break form actions', () => {
  const win = browser();
  win.sessionStorage = {getItem() {throw Error('Blocked');},setItem() {throw Error('Blocked');}};
  const emit = createAyambilAnalytics(win);
  const details = { eventDate:'2026-11-02',bookingKey:'receipt',passCount:1 };
  assert.equal(emit('booking_success', details), true);
  assert.equal(emit('booking_success', details), false);
  win.gtag = () => { throw Error('Tag unavailable'); };
  assert.doesNotThrow(() => emit('registration_start', details));
  assert.equal(emit('registration_start', details), false);
});

test('WhatsApp clicks retain no link, phone or input data; private/local routes never emit', () => {
  const win = browser(); const emit = createAyambilAnalytics(win);
  emit('help_whatsapp_click', {eventDate:'2026-11-03',placement:'registration',mobile:'PRIVATE',href:'PRIVATE'});
  assert.equal(win.calls[0][2].link_placement, 'registration');
  assert.doesNotMatch(JSON.stringify(win.calls), /PRIVATE|TOKEN|mobile|href/);
  for (const href of ['http://127.0.0.1:3037/', 'https://vardhmancreativestudio.com/admin/ayambil', 'https://vardhmancreativestudio.com/500-akhand-ayambil-vijayollas/passes#PRIVATE']) {
    win.location.href = href; assert.equal(emit('help_whatsapp_click'), false);
  }
  win.location.href = 'https://vardhmancreativestudio.com/';
  win[`ga-disable-${MEASUREMENT_ID}`] = true;
  assert.equal(emit('help_whatsapp_click'), false);
  assert.equal(win.calls.length, 1);
});

test('invalid events and untrusted programme values are ignored', () => {
  const win = browser();const emit = createAyambilAnalytics(win);
  assert.equal(emit('form_submit', { eventDate:'PRIVATE' }), false);
  assert.equal(emit('registration_start', { eventDate:'PRIVATE' }), false);
  emit('help_whatsapp_click', { eventDate:'PRIVATE',passCount:99,placement:'PRIVATE' });
  assert.doesNotMatch(JSON.stringify(win.calls), /PRIVATE|pass_count/);
});
