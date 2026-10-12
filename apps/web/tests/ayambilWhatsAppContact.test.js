import test from 'node:test';import assert from 'node:assert/strict';
import {ayambilWhatsAppLink} from '../src/lib/ayambilWhatsAppContact.js';
test('Ayambil support uses operator selected international business number and encodes message',()=>{const url=new URL(ayambilWhatsAppLink('Help & ગુજરાતી?'));assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/917572906540');assert.equal(url.searchParams.get('text'),'Help & ગુજરાતી?');});
