import test from 'node:test';
import assert from 'node:assert/strict';
import {bookingMessageStates} from '../src/lib/ayambilBookingMessageStatus.js';
const booking={status:'active',attendees:[{status:'active',passes:[{status:'active'}]}],whatsapp:{history:[{type:'confirmation',status:'sent',attempts:1},{type:'pass',status:'queued',attempts:0}]}};
test('distinguishes sent confirmation from pending pass and unqueued reminder',()=>{
 const [confirmation,pass,reminder]=bookingMessageStates(booking);
 assert.equal(confirmation.pending,0);assert.equal(confirmation.text,'sent');assert.equal(pass.pending,1);assert.equal(pass.text,'queued');assert.equal(reminder.text,'Not queued');
});
test('uncertain and attempted queued entries require review; cancelled bookings are not eligible pending',()=>{
 const b={...booking,status:'cancelled',whatsapp:{history:[{type:'confirmation',status:'uncertain',attempts:1},{type:'pass',status:'queued',attempts:1}]}};
 assert.ok(bookingMessageStates(b).every(m=>m.pending===0));assert.ok(bookingMessageStates(b).slice(0,2).every(m=>m.review));
});
test('unavailable history is not described as not queued; trashed passes are ineligible',()=>{
 assert.equal(bookingMessageStates({status:'active'})[0].text,'Status unavailable');
 assert.equal(bookingMessageStates({...booking,attendees:[{status:'active',passes:[{status:'active',trashedAt:'2026-10-18'}]}]})[1].pending,0);
});

test('waiting acknowledgement and additional campaign states are explicit',()=>{
 const states=bookingMessageStates({status:'waiting',attendees:[],whatsapp:{history:[{type:'waiting_received',status:'held',attempts:0},{type:'attendance',status:'delivered',attempts:1}]}});
 assert.equal(states[0].label,'Waiting acknowledgement');assert.equal(states[0].pending,1);assert.equal(states[0].blocked,false);assert.equal(states[1].label,'Attendance response');
});
