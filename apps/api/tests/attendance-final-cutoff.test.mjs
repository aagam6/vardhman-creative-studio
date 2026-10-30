import test from 'node:test';
import assert from 'node:assert/strict';
import {attendanceDelay} from '../attendance-delay.mjs';
import {attendanceEligibility} from '../attendance-eligibility.mjs';
import {notificationSettings} from '../notification-settings.mjs';
const cutoff='2026-10-30T14:52:00.000Z',now='2026-10-30T15:30:00.000Z';
const b={id:'a',mobile:'+12025550123',eventDate:'2026-11-02',names:['Guest One'],createdAt:'2026-10-30 14:51:59.999'};
const gate=(bookings=[b],reviews=[])=>attendanceEligibility({bookings,reviews,eventDate:b.eventDate,mobile:b.mobile,now,finalCutoff:cutoff});
test('explicit final cohort replaces only 48h delay; default policy still waits',()=>{
 assert.equal(attendanceDelay([b],now).ready,false);assert.equal(gate().eligible,true);
 assert.equal(gate([{...b,createdAt:cutoff}]).eligible,true);
 assert.deepEqual(gate([{...b,createdAt:'2026-10-30T14:52:00.001Z'}]).reasons,['outside_final_attendance_cutoff']);
 assert.equal(gate([{...b,approvedAt:'2026-10-30T14:53:00Z'}]).eligible,false);
 assert.equal(gate([{...b,confirmationAttemptAt:'2026-10-30T15:00:00Z'}]).eligible,true);
 assert.equal(attendanceDelay([b],'2026-10-30T14:51:00Z',cutoff).ready,false);
 for(const bad of [undefined,'invalid'])assert.equal(gate([{...b,createdAt:bad}]).eligible,false);
 assert.equal(attendanceDelay([b],now,'invalid').ready,false);
});
test('cutoff cannot include a later family registration or bypass any other hold',()=>{
 assert.equal(gate([b,{...b,id:'later',createdAt:'2026-10-30T15:00:00Z',names:['Other Guest']}]).eligible,false);
 assert.ok(gate([{...b,names:['Guest One',' Guest  One ']}]).reasons.includes('repeated_name_hold'));
 assert.ok(gate([b,{...b,id:'duplicate'}]).reasons.includes('unresolved_duplicate_review'));
 const response={purpose:'attendance',event_date:b.eventDate,contact_key:'12025550123',snapshot:[b],response:{attending:'yes'}};
 assert.ok(gate([b],[response]).reasons.includes('already_responded'));
 assert.equal(gate([]).eligible,false);
});
test('configuration fails closed with invalid cutoff or automatic Attendance still enabled',()=>{
 assert.equal(notificationSettings({}).attendanceFinalCutoff,undefined);
 assert.equal(notificationSettings({AYAMBIL_ATTENDANCE_FINAL_CUTOFF:cutoff}).attendanceFinalCutoff,cutoff);
 assert.throws(()=>notificationSettings({AYAMBIL_ATTENDANCE_FINAL_CUTOFF:'invalid'}));
 assert.throws(()=>notificationSettings({AYAMBIL_ATTENDANCE_FINAL_CUTOFF:cutoff,AYAMBIL_BILINGUAL_ATTENDANCE_ENABLED:'true'}));
});
