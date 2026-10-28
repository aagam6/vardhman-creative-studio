import test from 'node:test';
import assert from 'node:assert/strict';
import {legacyCoverage} from '../legacy-history-reconciliation.mjs';
const row={id:'legacy',booking_id:'book',notification_type:'pass',status:'queued',attempts:0,booking_status:'active',whatsapp_consent:1,valid_passes:4};
test('combined CTA covers pass history for same booking only',()=>{
 for(const purpose of ['booking_confirmed','waiting_approved','pass_link'])for(const state of ['accepted','sent','delivered','read'])assert.equal(legacyCoverage(row,{modern:[{id:'modern',subject:'book',purpose,state,attempts:1,provider_id:'provider'}]}).classification,'covered');
 assert.equal(legacyCoverage(row,{modern:[{subject:'other',purpose:'booking_confirmed',state:'sent',provider_id:'p'}]}).classification,'missing');
 assert.equal(legacyCoverage({...row,notification_type:'confirmation'},{modern:[{subject:'book',purpose:'pass_link',state:'delivered',provider_id:'p'}]}).classification,'missing');
});
test('uncertain, failed, processing and absent provider acceptance fail closed',()=>{
 for(const state of ['uncertain','processing','failed'])assert.equal(legacyCoverage(row,{modern:[{subject:'book',purpose:'pass_link',state,attempts:1}]}).classification,'held');
 assert.equal(legacyCoverage(row,{modern:[{subject:'book',purpose:'pass_link',state:'sent',attempts:1}]}).classification,'held');
 assert.equal(legacyCoverage({...row,status:'uncertain'}).reason,'acceptance_uncertain');
 assert.equal(legacyCoverage(row,{recipientMatches:false}).reason,'recipient_or_event_mismatch');
});
test('inactive, consent and pass eligibility never authorise replay',()=>{
 for(const patch of [{booking_status:'cancelled'},{booking_status:'waiting'},{whatsapp_consent:0},{valid_passes:0}])assert.equal(legacyCoverage({...row,...patch}).classification,'held');
 assert.equal(legacyCoverage(row,{legacy:[{id:'previous',booking_id:'book',notification_type:'confirmation',status:'sent',provider_id:'p'}]}).classification,'missing','plain legacy confirmation does not prove a pass link');
 assert.equal(legacyCoverage(row,{legacy:[{id:'previous',booking_id:'book',notification_type:'pass',status:'delivered',provider_id:'p'}]}).classification,'covered');
});
