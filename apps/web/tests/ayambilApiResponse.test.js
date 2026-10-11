import test from 'node:test';
import assert from 'node:assert/strict';
import PocketBase from 'pocketbase';
import { validatePassDownload, fetchAyambilJson } from '../src/lib/ayambilApiResponse.js';
const pass = {number:'SYNTHETIC-1',attendeeName:'Synthetic Attendee',sessions:[{date:'2026-11-02',performer:'Manan Sanghvi',programme:'એક શામ દાદા ઋષભ કે નામ',label:'2 November 2026',time:'8 PM IST',venue:'Synthetic venue',address:'Synthetic address'}]};
test('SDK fallback reproduces undefined passes; validated transport rejects it',async()=>{
  const client=new PocketBase('https://synthetic.invalid');
  const html=async()=>new Response('<html>SPA fallback</html>',{headers:{'Content-Type':'text/html'}});
  const data=await client.send('/api/ayambil/pass-download',{method:'POST',fetch:html});
  assert.equal(data.passes,undefined);
  const original=globalThis.fetch;
  try {globalThis.fetch=html;await assert.rejects(client.send('/api/ayambil/pass-download',{method:'POST',fetch:fetchAyambilJson}));}
  finally {globalThis.fetch=original;}
});
test('private response validates issued pass and empty results without inventing data',()=>{
  assert.deepEqual(validatePassDownload({passes:[pass]}),[pass]);
  assert.deepEqual(validatePassDownload({passes:[]}),[]);
  for(const invalid of [undefined,{},'',{passes:null},{passes:[{}]},{passes:[{...pass,sessions:undefined}]},{passes:[pass,pass]}]) assert.throws(()=>validatePassDownload(invalid));
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
