import test from 'node:test';import assert from 'node:assert/strict';import {assertNoReminderReceipt} from '../late-reminder-history.mjs';
test('complete recipient history blocks every prior reminder status without conflating confirmation',()=>{
 assertNoReminderReceipt([]);assertNoReminderReceipt([{id:'confirmation',template:'ayambil_booking_confirmed_bilingual',status:'delivered'}]);
 for(const status of ['queued','accepted','sent','delivered','read','failed','uncertain'])for(const template of ['ayambil_entry_timing_bilingual','ayambil_event_reminder'])assert.throws(()=>assertNoReminderReceipt([{id:'prior',template,status}]));
 for(const v of [null,{},[{}],[{id:'x'}]])assert.throws(()=>assertNoReminderReceipt(v));
});
