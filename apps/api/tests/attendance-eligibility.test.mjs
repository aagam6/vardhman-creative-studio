import test from 'node:test';
import assert from 'node:assert/strict';
import {attendanceEligibility} from '../attendance-eligibility.mjs';
const book=(id,names,eventDate='2026-11-02',mobile='+12025550123')=>({id,names,eventDate,mobile});
const b=book('a',['મીના શાહ','રાજ શાહ']);
const eligible=(bookings,reviews=[])=>attendanceEligibility({bookings,reviews,eventDate:b.eventDate,mobile:b.mobile});
test('Attendance holds overlaps and repeated normalized Gujarati names, not same phone alone or another event',()=>{
 assert.equal(eligible([b,book('b',['Other Family'])]).eligible,true);
 assert.equal(eligible([b,book('b',b.names,'2026-11-03')]).eligible,true);
 assert.deepEqual(eligible([b,book('b',['મીના શાહ'])]).reasons,['unresolved_duplicate_review']);
 assert.deepEqual(eligible([book('a',[' મીના  શાહ ','મીના શાહ'])]).reasons,['repeated_name_hold']);
});
test('Only explicit reviewed current complete scope resolves overlap; responses/follow-up/stale scope keep hold',()=>{
 const books=[b,book('b',b.names)],r={purpose:'duplicate',event_date:b.eventDate,contact_key:'12025550123',snapshot:books,response:{count:2}};
 assert.equal(eligible(books,[r]).eligible,false);
 assert.equal(eligible(books,[{...r,decision:{action:'follow_up'}}]).eligible,false);
 assert.equal(eligible(books,[{...r,decision:{action:'reviewed'}}]).eligible,true);
 assert.equal(eligible([...books,book('c',b.names)],[{...r,decision:{action:'reviewed'}}]).eligible,false);
 assert.equal(eligible([b],[{...r,snapshot:[b],decision:null}]).eligible,false);
});
test('Answered contact-event is excluded across rounds; no booking/pass mutation',()=>{
 const before=JSON.stringify(b),r={purpose:'attendance',event_date:b.eventDate,contact_key:'12025550123',snapshot:[b],response:{attending:'no',count:0},review_round:'old'};
 assert.deepEqual(eligible([b],[r]).reasons,['already_responded']);
 assert.equal(eligible([b],[{...r,event_date:'2026-11-03'}]).eligible,true);assert.equal(JSON.stringify(b),before);
});
