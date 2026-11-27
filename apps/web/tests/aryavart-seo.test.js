import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { generateAryavartSeo } from '../tools/aryavart-seo.mjs';

test('Aryavart route emits share metadata and a crawlable book fallback', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'aryavart-seo-'));
  try {
    await writeFile(path.join(directory, 'index.html'), '<!doctype html><html lang="en"><head><title>Generic</title><meta name="description" content="Generic"><meta property="og:title" content="Generic"><meta name="twitter:card" content="summary"></head><body><div id="root"></div></body></html>');
    const output = await generateAryavartSeo(directory);
    const html = await readFile(output, 'utf8');
    assert.match(html, /<html lang="hi">/);
    assert.match(html, /<meta property="og:title" content="आर्यावर्त का गौरव/);
    assert.match(html, /<meta property="og:image" content="https:\/\/vardhmancreativestudio\.com\/assets\/aryavart-ka-gaurav-cover\.png"/);
    assert.match(html, /<meta name="twitter:card" content="summary_large_image"/);
    const shareDescriptions = [...html.matchAll(/<meta (?:name="description"|property="og:description"|name="twitter:description") content="([^"]*)"/g)].map((match) => match[1]);
    assert.equal(shareDescriptions.length, 3);
    assert.ok(shareDescriptions.every((text) => text.includes('100-पृष्ठों') && text.includes('विशेष भाषाई प्रयोग')));
    assert.ok(shareDescriptions.every((text) => !text.includes('₹')));
    assert.match(html, /<link data-react-helmet="true" rel="canonical" href="https:\/\/vardhmancreativestudio\.com\/aryavart-ka-gaurav"/);
    assert.match(html, /लेखक · मुनिश्री श्रमणचंद्रसागरजी महाराज साहेब/);
    assert.match(html, /₹300/);
    const jsonLd = html.match(/<script[^>]*type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    assert.ok(jsonLd, 'Book JSON-LD should be present in the static HTML');
    assert.equal(JSON.parse(jsonLd)['@type'], 'Book');
    assert.equal(JSON.parse(jsonLd).offers.price, '300');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('pre-rendered Aryavart path is internally served before slash normalization', async () => {
  const rules = await readFile(new URL('../public/.htaccess', import.meta.url), 'utf8');
  const routeRule = rules.indexOf('RewriteRule ^aryavart-ka-gaurav/?$ aryavart-ka-gaurav/index.html [END]');
  const slashRule = rules.indexOf('RewriteRule ^(.*)/$ /$1 [R=301,L]');
  assert.ok(routeRule >= 0, 'the physical directory is internally mapped to its static index');
  assert.ok(slashRule > routeRule, 'route mapping runs before generic trailing-slash redirects');
});
