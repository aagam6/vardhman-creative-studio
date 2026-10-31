import test from 'node:test';import assert from 'node:assert/strict';
import {createFlow} from '../../vardhmanflow.mjs';
import {createAcknowledgementWorker} from '../acknowledgement-worker.mjs';
test('shared budget denial makes zero existing-provider calls and is a known rejection',async()=>{
 let calls=0;const flow=createFlow({VARDHMAN_FLOW_API_KEY:'synthetic',VARDHMAN_FLOW_API_SECRET:'synthetic'},async()=>{calls++;},{reserveRequestBudget:async()=>false});
 const r=await flow.rateProbe();assert.equal(r.blockedLocally,true);assert.equal(calls,0);
});
test('unsubmitted Updhan budget deferral does not create send intent or consume delivery attempts',async()=>{
 let deferred=0;const job={type:'application_received',whatsappConsent:true,applicationStatus:'received'};
 const worker=createAcknowledgementWorker({enabled:true,repository:{claimAcknowledgement:async()=>job,deferPreflight:async()=>deferred++,commitIntent:()=>assert.fail('no send intent'),finish:()=>assert.fail('no failure')},provider:{prepare:async()=>{throw Object.assign(Error(),{code:'shared_rate_budget_unavailable'});}}});
 assert.equal((await worker.process('synthetic')).state,'deferred');assert.equal(deferred,1);
});
