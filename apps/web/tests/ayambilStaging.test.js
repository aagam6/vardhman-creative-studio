import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('Dedicated staging entry exposes only Ayambil routes and safe unavailable fallback',()=>{
 const entry=readFileSync(new URL('../staging/main.jsx',import.meta.url),'utf8');
 assert.match(entry,/path="\*" element={<Unavailable/);
 assert.match(entry,/eventDate="2026-11-02"/);assert.match(entry,/eventDate="2026-11-03"/);
 assert.match(entry,/path="\/admin\/ayambil" element={<AyambilAdminPage/);
 assert.doesNotMatch(entry,/HomePage|UpdhanPage|LeadCaptureSection|ComingSoonPage|pocketbaseClient|hcgi/);
 const config=readFileSync(new URL('../vite.staging.config.js',import.meta.url),'utf8');assert.match(config,/reject-ordinary-site-modules/);
 assert.match(readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8'),/import App from/);
});
