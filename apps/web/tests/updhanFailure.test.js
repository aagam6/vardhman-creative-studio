import test from 'node:test';import assert from 'node:assert/strict';
import {updhanFailureMessage} from '../src/lib/updhanFailure.js';
import {createSubmissionAttempt} from '../src/lib/updhanSubmissionAttempt.js';
test('failure text is actionable, keeps uncertain results distinct, and never renders backend secrets',()=>{
 const id='12345678-1234-1234-1234-123456789abc';
 const text=updhanFailureMessage({status:503,message:'SQL password=secret',requestId:id},{uncertain:true});
 assert.match(text,/unconfirmed/);assert.match(text,new RegExp(id));assert.doesNotMatch(text,/password|secret|SQL/);
 assert.match(updhanFailureMessage({status:503,code:'registration_closed'}),/currently closed/);
 assert.match(updhanFailureMessage({status:401}),/sign in again/);
});
test('explicit pre-save closed response permits corrections; timeout retains the same immutable attempt',async()=>{
 let mode='closed',seen=[];const attempt=createSubmissionAttempt({submit:async p=>{seen.push(p);throw mode==='closed'?Object.assign(Error(),{status:503,definitelyRejected:true}):Error('timeout');}});
 await assert.rejects(attempt.submit({key:'one',data:{name:'A'},photo:{}}));assert.equal(attempt.uncertain,false);
 mode='timeout';await assert.rejects(attempt.submit({key:'two',data:{name:'B'},photo:{}}));assert.equal(attempt.uncertain,true);
 await assert.rejects(attempt.submit({key:'three',data:{name:'C'},photo:{}}));assert.equal(seen[2].key,'two');
});
