import test from 'node:test';
import assert from 'node:assert/strict';
import {collectAttendeeCsv} from '../src/lib/ayambilAdminExport.js';
import {createAyambilApi} from '../src/lib/ayambilExpressClient.js';
import {readFileSync} from 'node:fs';
const session=JSON.parse(readFileSync(new URL('../../pocketbase/pb_hooks/ayambil/config.json',import.meta.url))).sessions[0];
test('empty authenticated list exports headers; populated list validates saved attendee and pass association',async()=>{
 const empty={items:[],page:1,hasMore:false,integration:{ready:false,missing:[]}};
 const api=createAyambilApi(async()=>Response.json(empty));assert.equal((await collectAttendeeCsv(api.request)).length,1);
 const booking={id:'synthetic',number:'SYNTHETIC',contactName:'Synthetic',mobile:'synthetic',created:'synthetic',status:'active',attendees:[{id:'synthetic-attendee',fullName:'Synthetic',status:'active',dates:[session.date],passes:[{number:'SYNTHETIC-PASS',attendeeName:'Synthetic',status:'active',sessions:[session]}]}]};
 const populated=createAyambilApi(async()=>Response.json({...empty,items:[booking]}));const rows=await collectAttendeeCsv(populated.request);assert.equal(rows.length,2);assert.equal(rows[1][3],'Synthetic');assert.equal(rows[1][6],'SYNTHETIC-PASS');
 await assert.rejects(collectAttendeeCsv(createAyambilApi(async()=>Response.json({...empty,items:[{}]})).request),/Invalid booking/);
 await assert.rejects(collectAttendeeCsv(async()=>{throw Error('HTTP 503');}),/HTTP 503/);
});
test('admin UI does not use generic processor and guards provider reconciliation',()=>{
 const source=readFileSync(new URL('../src/pages/AyambilAdminPage.jsx',import.meta.url),'utf8');const queue=readFileSync(new URL('../src/components/AyambilMessageQueue.jsx',import.meta.url),'utf8');assert.ok(queue.includes('m.canVerifyProviderStatus'));assert.ok(queue.includes('onVerify(m.id)'));assert.ok(source.includes("messageAction('admin/messages/status',{id})"));assert.ok(source.includes("messageAction('admin/messages/process-test',{id:testJob})"));assert.ok(!source.includes("messageAction('admin/messages/process')"));
});
