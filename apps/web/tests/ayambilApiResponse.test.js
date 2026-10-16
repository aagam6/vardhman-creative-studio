import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePassDownload, fetchAyambilJson } from '../src/lib/ayambilApiResponse.js';
const pass = {number:'SYNTHETIC-1',attendeeName:'Synthetic Attendee',sessions:[{date:'2026-11-02',performer:'Manan Sanghvi',programme:'એક શામ દાદા ઋષભ કે નામ',label:'2 November 2026',time:'8 PM IST',venue:'Synthetic venue',address:'Synthetic address'}]};
test('Express transport rejects SPA fallback instead of returning undefined passes',async()=>{
  const html=async()=>new Response('<html>SPA fallback</html>',{headers:{'Content-Type':'text/html'}});
  const original=globalThis.fetch;
  try {globalThis.fetch=html;await assert.rejects(fetchAyambilJson('/api/ayambil/pass-download',{method:'POST'}),/did not return JSON/);}
  finally {globalThis.fetch=original;}
});
test('private response validates issued pass and empty results without inventing data',()=>{
  assert.deepEqual(validatePassDownload({passes:[pass]}),[pass]);
  assert.deepEqual(validatePassDownload({passes:[]}),[]);
  for(const invalid of [undefined,{},'',{passes:null},{passes:[{}]},{passes:[{...pass,sessions:undefined}]},{passes:[pass,pass]}]) assert.throws(()=>validatePassDownload(invalid));
});
test('only the explicit booking response permits 2–6 distinct passes',()=>{
 for(let n=2;n<=6;n++){
  const passes=Array.from({length:n},(_,i)=>({...pass,status:'active',number:'PASS-'+i}));
  const response={scope:'booking',bookingNumber:'BOOK26-test',passes};
  assert.equal(validatePassDownload(response,true).length,n);
  assert.throws(()=>validatePassDownload(response));
 }
 for(const response of [{scope:'booking',bookingNumber:'BOOK',passes:[]},{scope:'booking',bookingNumber:'BOOK',passes:[pass,pass]},{scope:'booking',bookingNumber:'BOOK',passes:Array.from({length:7},(_,i)=>({...pass,number:''+i}))},{passes:[pass]}])assert.throws(()=>validatePassDownload(response,true));
});
test('HTTP 200 SPA HTML is rejected, JSON is preserved and denial statuses reach SDK',async()=>{
  const original=globalThis.fetch;
  try {
    globalThis.fetch=async()=>new Response('<html>SPA</html>',{headers:{'Content-Type':'text/html'}});
    await assert.rejects(fetchAyambilJson('/synthetic',{}),/did not return JSON/);
    globalThis.fetch=async()=>Response.json({passes:[pass]});
    assert.deepEqual(await (await fetchAyambilJson('/synthetic',{})).json(),{passes:[pass]});
    globalThis.fetch=async()=>new Response('',{status:403});
    assert.equal((await fetchAyambilJson('/synthetic',{})).status,403);
  } finally {globalThis.fetch=original;}
});
