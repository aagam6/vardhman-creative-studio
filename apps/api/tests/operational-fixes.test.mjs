import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {passExpiresAt} from '../pass-expiry.mjs';
import {queueSummary} from '../queue-summary.mjs';
import {createStore} from '../store.mjs';
test('both event capabilities expire 24 hours after reviewed start, never issue-time seven days',()=>{
 assert.equal(passExpiresAt({date:'2026-11-02'}).toISOString(),'2026-11-03T14:30:00.000Z');
 assert.equal(passExpiresAt({date:'2026-11-03'}).toISOString(),'2026-11-04T14:30:00.000Z');
 assert.throws(()=>passExpiresAt({date:'2026-11-04'}));
 assert.throws(()=>passExpiresAt(null));
});
test('queue summaries do not invent delivery or attempts and do not expose provider/payload',()=>{
 const jobs=[{status:'queued',attempts:0,notification_type:'confirmation',updated_at:'synthetic'},{status:'uncertain',attempts:1,notification_type:'pass',updated_at:'synthetic',provider_id:'private-provider',payload:'private-payload'},{status:'delivered',attempts:2,notification_type:'reminder',updated_at:'synthetic'}];
 const result=queueSummary(jobs);assert.equal(result.attempts,3);assert.deepEqual(result.counts,{queued:1,uncertain:1,delivered:1});assert.equal(result.history.length,3);assert.doesNotMatch(JSON.stringify(result),/private-/);assert.equal(queueSummary([]).status,'no messages queued');
});
test('privileged booking summaries use parameterized queue records and sending-disabled summary is explicit',async()=>{
 const db={execute:async(sql,args)=>{
  if(sql.startsWith('SELECT b.id'))return [[{id:'synthetic-id'}]];
  if(sql.startsWith('SELECT * FROM ayambil_bookings'))return [[{id:'synthetic-id',number:'synthetic',status:'active',event_date:'2026-11-02'}]];
  if(sql.includes('FROM ayambil_message_queue')){assert.deepEqual(args,['synthetic-id']);return [[{notification_type:'pass',status:'uncertain',attempts:2,updated_at:'synthetic'}]];}
  return [[]];
 }};
 const enabled=await createStore(db,{}, {queue:{}}).list({});assert.equal(enabled.items[0].whatsapp.attempts,2);assert.match(enabled.items[0].whatsapp.status,/uncertain/);assert.doesNotMatch(enabled.integration.missing.join(),/sending disabled/i);
 const disabled=await createStore(db,{}).list({});assert.equal(disabled.items[0].whatsapp.attempts,null);
});
test('production telemetry is development-only and UI does not render channel number',()=>{
 const vite=readFileSync(new URL('../../web/vite.config.js',import.meta.url),'utf8');assert.match(vite,/const tags = isDev \? \[/);assert.match(vite,/\] : \[\];/);
 const ui=readFileSync(new URL('../../web/src/pages/AyambilAdminPage.jsx',import.meta.url),'utf8');assert.doesNotMatch(ui,/integration\.channel\.phone/);assert.match(ui,/exact delivery timestamps are not recorded/);
});
