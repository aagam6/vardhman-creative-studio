import test from 'node:test';
import assert from 'node:assert/strict';
import {withPrimaryParticipant} from '../src/lib/ayambilPrimaryParticipant.js';
import {validateBooking} from '../src/lib/ayambilBookingValidation.js';
const booking=count=>({contactName:'Synthetic Main',mobile:'+12025550123',eventDate:'2026-11-02',whatsappConsent:true,termsAccepted:true,attendees:Array.from({length:count},(_,index)=>({fullName:index?'Synthetic Additional '+index:'',dates:['2026-11-02']}))});
test('primary pass uses contact name for one through six participants and tracks edits',()=>{
 for(let count=1;count<=6;count++){
 const original=booking(count),synced=withPrimaryParticipant(original);
 assert.equal(synced.attendees[0].fullName,original.contactName);assert.equal(original.attendees[0].fullName,'');
 assert.equal(validateBooking(synced,['2026-11-02']),'');
 const renamed=withPrimaryParticipant({...synced,contactName:'Synthetic Renamed'});
 assert.equal(renamed.attendees[0].fullName,'Synthetic Renamed');assert.deepEqual(renamed.attendees.slice(1),synced.attendees.slice(1));
 const reduced=withPrimaryParticipant({...renamed,attendees:renamed.attendees.slice(0,1)});assert.equal(reduced.attendees.length,1);assert.equal(reduced.attendees[0].fullName,'Synthetic Renamed');
 }
});
