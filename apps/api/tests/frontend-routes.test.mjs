import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createApp} from '../app.mjs';
import {ApiError} from '../config.mjs';
test('actual built staging SPA handles home/admin refresh and assets; API stays JSON protected',async()=>{
 const directory=fileURLToPath(new URL('../../../dist/apps/web',import.meta.url));
 const html=readFileSync(directory+'/index.html','utf8');
 const app=createApp({store:{ready:async()=>true,session:async()=>{throw new ApiError(401,'Administrator sign-in required');}},config:{origin:'https://example.invalid'},staticDirectory:directory});
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base=`http://127.0.0.1:${server.address().port}`;
 try{
  for(const path of ['/','/admin/ayambil','/admin/ayambil']){const res=await fetch(base+path);assert.equal(res.status,200);assert.equal(await res.text(),html);}
  const assets=[...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map(m=>m[1]);assert.ok(assets.some(p=>p.endsWith('.js')));assert.ok(assets.some(p=>p.endsWith('.css')));
  for(const path of assets)assert.equal((await fetch(base+path)).status,200);
  const health=await fetch(base+'/api/ayambil/health');assert.equal(health.status,200);assert.equal(health.headers.get('cache-control'),'no-store');assert.deepEqual(await health.json(),{ready:true});
  const unknown=await fetch(base+'/api/ayambil/missing');assert.equal(unknown.status,404);assert.match(unknown.headers.get('content-type'),/json/);
  const admin=await fetch(base+'/api/ayambil/admin/bookings');assert.equal(admin.status,401);assert.doesNotMatch(await admin.text(),/attendee|booking data/);
 }finally{await new Promise(r=>server.close(r));}
});
