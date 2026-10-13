import test from 'node:test';
import assert from 'node:assert/strict';
import {adminTimestamp} from '../src/lib/ayambilAdminTime.js';
test('SQL UTC timestamps display the India offset, not the browser timezone', () => {
  assert.equal(adminTimestamp('2026-10-13 04:05:59.393'), adminTimestamp('2026-10-13T04:05:59.393Z'));
  assert.match(adminTimestamp('2026-10-13 04:05:59.393'), /09:35 am IST$/i);
  assert.match(adminTimestamp('2026-10-12 20:00:00'), /13 Oct 2026.*01:30 am IST$/i);
});
test('invalid or ambiguous timestamps are not presented as verified times', () => {
  for (const value of [undefined, '', 'bad', '2026-10-13', '2026-10-13T04:00:00']) assert.equal(adminTimestamp(value), '—');
});
