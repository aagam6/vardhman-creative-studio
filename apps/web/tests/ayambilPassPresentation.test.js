import test from 'node:test';
import assert from 'node:assert/strict';
import { passCredits, ayambilPassCredits, digitalPassTerms } from '../src/lib/ayambilPassPresentation.js';

test('evening-specific beneficiaries remain separate from common invitation organisers', () => {
  const first = passCredits({ sessions: [{ date: '2026-11-02' }] });
  const second = passCredits({ sessions: [{ date: '2026-11-03' }] });
  assert.equal(first.labharthi.length, 3);
  assert.match(first.labharthi[1], /મીનાબેન કિરણજી/);
  assert.match(first.labharthi[2], /રાજભાઈ/);
  assert.notDeepEqual(first.labharthi, second.labharthi);
  assert.equal(second.labharthi.length, 2);
  assert.match(second.labharthi[0], /મીનાક્ષીબેન/);
  assert.match(second.labharthi[1], /રંભાબેન બસ્તીમલજી પાલરેચા/);
  assert.equal(first.aayojak.length, 2);
  assert.equal(second.nimantrak.length, 3);
});

test('saved approved credit snapshots take precedence over date-specific defaults', () => {
  const previous = ayambilPassCredits['2026-11-02'];
  try {
    ayambilPassCredits['2026-11-02'] = { labharthi: 'Synthetic default beneficiary', aayojak: 'Synthetic default organiser' };
    assert.deepEqual(passCredits({ sessions: [{ date: '2026-11-02' }], labharthi: 'Synthetic saved beneficiary', aayojak: 'Synthetic saved organiser' }), { labharthi: 'Synthetic saved beneficiary', aayojak: 'Synthetic saved organiser', nimantrak: null });
    assert.equal(passCredits({ sessions: [{ date: '2026-11-03' }] }).labharthi.length, 2);
  } finally { ayambilPassCredits['2026-11-02'] = previous; }
});

test('all eight supplied pass rules have English and Gujarati copy', () => {
  assert.equal(digitalPassTerms.length, 8);
  for (const [en, gu] of digitalPassTerms) { assert.ok(en.length > 0); assert.match(gu, /[\u0a80-\u0aff]/); }
});
