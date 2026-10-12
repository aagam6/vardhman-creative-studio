import test from 'node:test';
import assert from 'node:assert/strict';
import {createAyambilApi,registrationAvailability} from '../src/lib/ayambilExpressClient.js';
test('registration UI availability uses only boolean readiness/open gates for both WhatsApp states',async()=>{
 for(const whatsapp of ['disabled','configured'])for(const ready of [false,true])for(const open of [false,true]){
 const data={ready,open,whatsapp};const result=await createAyambilApi(async()=>Response.json(data)).request('status');assert.equal(registrationAvailability(result),ready?(open?'open':'closed'):'unavailable');
 }
 for(const data of [{ready:true,open:true,whatsapp:'enabled'},{ready:true,open:true},{ready:'true',open:true,whatsapp:'configured'},{ready:true,open:1,whatsapp:'disabled'},null])assert.throws(()=>registrationAvailability(data),/Invalid availability/);
});
