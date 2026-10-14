import test from 'node:test';
import assert from 'node:assert/strict';
import {bookingInput} from '../config.mjs';
const input=()=>({contactName:'Synthetic Guest',mobile:'+12025550123',eventDate:'2026-11-02',whatsappConsent:true,termsAccepted:true,attendees:[{fullName:'Synthetic Guest',dates:['2026-11-02']}],requestKey:'a'.repeat(64)});
test('registration metadata normalizes optional values and rejects invalid field types',()=>{
 const result=bookingInput({...input(),occupation:' Teacher ',referralSource:' WhatsApp '});
 assert.equal(result.occupation,'Teacher');assert.equal(result.referralSource,'WhatsApp');
 assert.equal(bookingInput(input()).occupation,'');
 for(const value of [123,'x'.repeat(121),'<script>','bad\nvalue']) assert.throws(()=>bookingInput({...input(),occupation:value}));
});
