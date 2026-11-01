import test from 'node:test';
import assert from 'node:assert/strict';
import {exportRecord} from '../src/lib/updhanExports.js';
import {updhanSchedule,formatProgrammeDate} from '../src/lib/updhanSchedule.js';
test('admin export whitelists fields, preserves Unicode and references, excludes sensitive internals',()=>{
 const r=exportRecord({reference:'UPD-2027-0002',status:'received',applicant:{name:'શાહ / शाह',health:'PRIVATE',requestKey:'SECRET',code:'+91',whatsapp:'7990106225',referredBy:'=HYPERLINK("x")'},companions:[{name:'Family member',form_number:'UPD-2027-0003'}]});
 assert.equal(r['Registration number'],'UPD-2027-0002');assert.equal(r['Name / નામ / नाम'],'શાહ / शाह');assert.equal(r['WhatsApp country code'],'+91');assert.match(r['Companion names / references'],/0003/);assert.doesNotMatch(JSON.stringify(r),/PRIVATE|SECRET/);
});
test('organizer corrected schedule omits unconfirmed completion and removed 12 June parana',()=>{
 assert.deepEqual(updhanSchedule.map(x=>x.start),['2027-04-25','2027-04-25','2027-04-25','2027-04-25','2027-05-13','2027-05-31']);
 assert.equal(updhanSchedule[1].end,'2027-05-30');assert.equal(updhanSchedule[2].end,'2027-05-23');assert.equal(updhanSchedule[5].end,null);assert.equal(formatProgrammeDate(null),'');assert.match(formatProgrammeDate('2027-04-25','en'),/Sunday/);
});
