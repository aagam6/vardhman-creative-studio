import test from 'node:test';
import assert from 'node:assert/strict';
import {registrationAvailability,validateResponse} from '../src/lib/ayambilExpressClient.js';
import {submitRegistration} from '../src/lib/ayambilRegistrationRecovery.js';
test('event availability keeps Waiting accepting and closes only selected evening',()=>{
 const status={ready:true,open:true,whatsapp:'disabled',events:[{event_date:'2026-11-02',mode:'closed'},{event_date:'2026-11-03',mode:'waiting'}]};
 assert.equal(registrationAvailability(status,'2026-11-02'),'closed');assert.equal(registrationAvailability(status,'2026-11-03'),'open');assert.equal(registrationAvailability({...status,open:false},'2026-11-03'),'closed');
});
test('waiting receipt succeeds without passes and rejects accidental download capabilities',async()=>{
 const receipt={number:'WAIT26-LOCAL',status:'waiting',attendees:[{fullName:'સ્થાનિક પરિવાર',passes:[]}]};
 validateResponse('register',receipt);assert.equal(await submitRegistration(async()=>receipt,{attendees:[{}]}),receipt);
 assert.throws(()=>validateResponse('register',{...receipt,downloadKeys:['a'.repeat(64)]}));
 assert.throws(()=>validateResponse('register',{...receipt,attendees:[{passes:[{}]}]}));
});
