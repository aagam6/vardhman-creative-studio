import test from 'node:test';
import assert from 'node:assert/strict';
import { canSharePdf, copyPassDetails, csvCell, passSummary } from '../src/lib/ayambilPassUtils.js';

test('PDF sharing falls back on missing or rejecting device capability', () => {
  const file = { name: 'test.pdf' };
  assert.equal(canSharePdf({}, file), false);
  assert.equal(canSharePdf({ share() {}, canShare() { return false; } }, file), false);
  assert.equal(canSharePdf({ share() {}, canShare() { throw new Error('blocked'); } }, file), false);
  assert.equal(canSharePdf({ share() {}, canShare() { return true; } }, null), false);
  assert.equal(canSharePdf({ share() {}, canShare() { return true; } }, file), true);
});
test('clipboard denial and unsupported clipboard preserve selectable-text fallback', async () => {
  assert.equal(await copyPassDetails({}, 'details'), false);
  assert.equal(await copyPassDetails({ clipboard: { async writeText() { throw new Error('denied'); } } }, 'details'), false);
  let copied = '';
  assert.equal(await copyPassDetails({ clipboard: { async writeText(text) { copied = text; } } }, 'details'), true);
  assert.equal(copied, 'details');
});
test('attendee exports escape CSV cells and neutralize formula injection', () => {
  assert.equal(csvCell('A "quoted", name'), '"A ""quoted"", name"');
  for (const value of ['=1+1', '+919876543210', '-2', '@SUM(A1)', '  =HYPERLINK("x")', '\tformula']) assert.ok(csvCell(value).startsWith('"\''));
});
test('share draft contains saved evening details without private URLs or mobile numbers', () => {
  const draft = passSummary({ eventName: 'Event', attendeeName: 'Attendee', number: 'AYV26-TEST', sessions: [{ label: '2 November 2026', time: '8:00 PM IST', performer: 'Manan Sanghvi', venue: 'Shri Chandramauleshwar Hall', address: 'Ahmedabad' }] });
  assert.match(draft, /Attendee/); assert.match(draft, /2 November 2026/); assert.match(draft, /Shri Chandramaulishwar Hall/); assert.doesNotMatch(draft, /https?:\/\//); assert.match(draft, /attach the downloaded digital pass/);
});
