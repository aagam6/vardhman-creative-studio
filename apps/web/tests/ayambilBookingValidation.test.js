import test from 'node:test';
import assert from 'node:assert/strict';
import {validateBooking} from '../src/lib/ayambilBookingValidation.js';
const dates=['2026-11-02','2026-11-03'];
const booking=(count=1,date=dates[0])=>({contactName:'Synthetic Contact',mobile:'+12025550123',eventDate:date,termsAccepted:true,whatsappConsent:true,attendees:Array.from({length:count},(_,i)=>({fullName:'Synthetic Attendee '+i,dates:[date]}))});
test('one through five attendees accepted for each separate evening',()=>{for(const date of dates)for(const n of [1,2,3,4,5])assert.equal(validateBooking(booking(n,date),dates),'');});
test('sixth attendee and missing second name rejected',()=>{assert.match(validateBooking(booking(6),dates),/Maximum 5/);const b=booking(2);b.attendees[1].fullName='';assert.match(validateBooking(b,dates),/attendee 2/);});
test('terms require explicit boolean acceptance',()=>{for(const termsAccepted of [false,undefined,'true'])assert.match(validateBooking({...booking(),termsAccepted},dates),/Accept/);});
test('wrong evening, missing names and WhatsApp consent rejected',()=>{const b=booking();b.attendees[0].dates=[dates[1]];assert.ok(validateBooking(b,dates));assert.ok(validateBooking({...booking(),attendees:[]},dates));assert.ok(validateBooking({...booking(),whatsappConsent:false},dates));});
