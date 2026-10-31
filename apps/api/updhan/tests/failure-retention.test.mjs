import test from 'node:test';import assert from 'node:assert/strict';
import {updhanFailure,UpdhanError} from '../errors.mjs';import {retentionExpiry} from '../data-retention.mjs';
test('unknown database failures never expose driver text or claim the application was rejected',()=>{
 const f=updhanFailure(Error('password and patient details'),'support-id');assert.equal(f.status,503);assert.equal(f.body.code,'service_unavailable');assert.equal(f.body.registrationSaved,undefined);assert.doesNotMatch(JSON.stringify(f),/patient|password/);
 assert.equal(updhanFailure(new UpdhanError(503,'Registration is closed'),'id').body.registrationSaved,false);
});
test('fixed organizer retention ends with 2027 in India for early and late registrations',()=>{
 const args={retentionUntil:'2027-12-31',photoRetentionDays:null};
 for(const now of ['2026-11-01','2027-06-14'])assert.equal(retentionExpiry(args,new Date(now)).toISOString(),'2027-12-31T18:29:59.999Z');
 assert.throws(()=>retentionExpiry(args,new Date('2028-01-01')));assert.throws(()=>retentionExpiry({retentionUntil:'bad'}));
});
