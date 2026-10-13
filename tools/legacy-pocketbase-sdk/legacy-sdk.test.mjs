// Optional historical evidence only; excluded from application workspaces and installation.
import test from 'node:test';
import assert from 'node:assert/strict';
import PocketBase from 'pocketbase';
import {fetchAyambilJson} from '../../apps/web/src/lib/ayambilApiResponse.js';
test('historical SDK accepts SPA HTML as an empty record; Express transport rejects it',async()=>{
 const client=new PocketBase('https://synthetic.invalid');
 const html=async()=>new Response('<html>SPA fallback</html>',{headers:{'Content-Type':'text/html'}});
 assert.equal((await client.send('/api/ayambil/pass-download',{method:'POST',fetch:html})).passes,undefined);
 const original=globalThis.fetch;
 try{globalThis.fetch=html;await assert.rejects(client.send('/api/ayambil/pass-download',{method:'POST',fetch:fetchAyambilJson}));}finally{globalThis.fetch=original;}
});
