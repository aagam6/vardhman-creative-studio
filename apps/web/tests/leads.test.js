import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {submitLead} from '../src/lib/leadClient.js';
test('both lead components use same-origin Express submission and preserve success/failure UI',async()=>{
 for(const path of ['../src/components/LeadCaptureSection.jsx','../src/pages/ComingSoonPage.jsx']){const source=readFileSync(new URL(path,import.meta.url),'utf8');assert.match(source,/await submitLead\(formData\)/);assert.doesNotMatch(source,/pocketbaseClient|pb\.collection/);assert.match(source,/toast\.success/);assert.match(source,/toast\.error/);}
 let requests=0;await submitLead({name:'Synthetic',email:'synthetic@example.invalid'},async(path,options)=>{requests++;assert.equal(path,'/api/leads');assert.equal(options.method,'POST');assert.equal(options.credentials,'same-origin');assert.equal(options.cache,'no-store');assert.equal(JSON.parse(options.body).name,'Synthetic');return new Response(JSON.stringify({id:'synthetic-id',created:true}),{status:201,headers:{'Content-Type':'application/json'}});});assert.equal(requests,1);
 for(const response of [new Response('HTML'),new Response('{}',{status:503}),new Response('{}',{headers:{'Content-Type':'application/json'}})])await assert.rejects(submitLead({},async()=>response),/Lead submission unavailable/);
 await assert.rejects(submitLead({},async()=>{throw Error('Private transport detail');}),e=>!e.message.includes('Private transport'));
});