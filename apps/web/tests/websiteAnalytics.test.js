import test from 'node:test';
import assert from 'node:assert/strict';
import { publicAnalyticsPage, createWebsiteAnalytics, MEASUREMENT_ID } from '../src/lib/websiteAnalytics.js';

test('only public production routes qualify; URL capabilities and query data are stripped', () => {
  assert.deepEqual(publicAnalyticsPage('https://vardhmancreativestudio.com/500-akhand-ayambil-vijayollas/sairam-dave?phone=secret#private'), {
    page_location: 'https://vardhmancreativestudio.com/500-akhand-ayambil-vijayollas/sairam-dave', page_title: 'Sairam Dave | 3 November 2026',
  });
  for (const href of ['http://localhost:3037/', 'https://vardhmancreativestudio.com/admin/ayambil', 'https://vardhmancreativestudio.com/500-akhand-ayambil-vijayollas/passes#secret', 'https://vardhmancreativestudio.com/unknown-person', 'https://example.com/', 'invalid']) assert.equal(publicAnalyticsPage(href), null);
});

test('SPA tracking initializes once, avoids duplicate views and disables collection on private routes', () => {
  const scripts = [];
  const win = {};
  const doc = { referrer: 'https://vardhmancreativestudio.com/admin/ayambil?secret', createElement: () => ({}), head: { appendChild: script => scripts.push(script) } };
  const track = createWebsiteAnalytics(win, doc);
  track('http://localhost:3037/');
  assert.equal(scripts.length, 0);
  track('https://vardhmancreativestudio.com/?email=secret');
  track('https://vardhmancreativestudio.com/#registration');
  track('https://vardhmancreativestudio.com/about');
  track('https://vardhmancreativestudio.com/500-akhand-ayambil-vijayollas/passes#private');
  assert.equal(win[`ga-disable-${MEASUREMENT_ID}`], true);
  track('https://vardhmancreativestudio.com/about');
  assert.equal(win[`ga-disable-${MEASUREMENT_ID}`], false);
  const commands = win.dataLayer.map(args => [...args]);
  assert.equal(scripts.length, 1);
  assert.equal(commands.filter(c => c[0] === 'config').length, 1);
  assert.equal(commands.filter(c => c[0] === 'event' && c[1] === 'page_view').length, 3);
  assert.equal(commands.find(c => c[0] === 'config')[2].send_page_view, false);
  assert.doesNotMatch(JSON.stringify(commands), /secret|#private|\/passes|\/admin/);
});
