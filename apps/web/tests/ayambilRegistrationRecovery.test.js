import test from 'node:test';
import assert from 'node:assert/strict';
import {submitRegistration} from '../src/lib/ayambilRegistrationRecovery.js';
test('lost six-pass response recovers the saved booking using exactly the same request',async()=>{
 const payload={requestKey:'synthetic-key',attendees:Array.from({length:6},()=>({fullName:'Synthetic'}))};
 const receipt={number:'SAVED',attendees:payload.attendees.map(()=>({passes:[{number:'saved-pass'}]}))};
 const calls=[];let recoveries=0;
 const result=await submitRegistration(async(path,options)=>{calls.push(options.body);if(calls.length===1)throw new TypeError('Network response lost');return receipt;},payload,()=>recoveries++);
 assert.equal(result,receipt);assert.equal(calls.length,2);assert.equal(calls[0],calls[1]);assert.equal(recoveries,1);
});
test('explicit validation rejection is never retried and uncertain recovery is bounded',async()=>{
 let calls=0;await assert.rejects(submitRegistration(async()=>{calls++;throw Object.assign(new Error('Invalid'),{status:400});},{attendees:[]}));assert.equal(calls,1);
 calls=0;await assert.rejects(submitRegistration(async()=>{calls++;throw new Error('Unavailable');},{attendees:[]}));assert.equal(calls,2);
});
