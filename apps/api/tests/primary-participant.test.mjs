import test from 'node:test';
import assert from 'node:assert/strict';
import {bookingInput} from '../config.mjs';
import {withPrimaryParticipant} from '../../web/src/lib/ayambilPrimaryParticipant.js';
test('primary-name form payload passes API normalization for one to six participants',()=>{
 for(let count=1;count<=6;count++){
 const form=withPrimaryParticipant({contactName:'  Synthetic Primary  ',mobile:'+12025550123',eventDate:'2026-11-02',termsAccepted:true,whatsappConsent:true,requestKey:'a'.repeat(64),attendees:Array.from({length:count},(_,i)=>({fullName:i?'Synthetic Additional '+i:'',dates:['2026-11-02']}))});
 const payload=bookingInput(form);
 assert.equal(payload.contactName,'Synthetic Primary');assert.equal(payload.attendees[0].fullName,payload.contactName);assert.equal(payload.attendees.length,count);
 for(let i=1;i<count;i++)assert.equal(payload.attendees[i].fullName,'Synthetic Additional '+i);
 }
});
