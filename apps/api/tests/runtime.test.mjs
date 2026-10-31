import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createStore} from '../store.mjs';
import {hash} from '../security.mjs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
test('active runtime uses Express only; PocketBase remains historical test evidence',()=>{
 const root=JSON.parse(read('../../../package.json')),web=JSON.parse(read('../../web/package.json'));
 assert.equal(root.scripts.start,'npm run start --prefix apps/api');assert.doesNotMatch(root.scripts.dev,/pocketbase/);assert.deepEqual(root.workspaces,['apps/web','apps/api','apps/api/updhan']);assert.equal(web.dependencies.pocketbase,undefined);
 assert.equal(root.dependencies?.pocketbase,undefined);assert.equal(root.devDependencies?.pocketbase,undefined);
 assert.doesNotMatch(read('../../web/vite.config.js'),/pocketbase/i);
 const scan=dir=>{for(const e of readdirSync(new URL(dir,import.meta.url),{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())scan(p);else if(/\.(js|jsx)$/.test(p))assert.doesNotMatch(read(p),/from ['"]pocketbase['"]|pocketbaseClient/);}};scan('../../web/src');
});
test('legacy capability format is exact and hash-bound; invalid tokens never query SQL',async()=>{
 let calls=0;const key='AbZ9'.repeat(16);const pool={execute:async(sql,args)=>{calls++;assert.match(sql,/c.revoked_at IS NULL/);assert.match(sql,/c.expires_at>UTC_TIMESTAMP/);assert.match(sql,/b.status='active'/);return [args[0]===hash(key)?[{snapshot:JSON.stringify({number:'SYNTHETIC'}),status:'active'}]:[]];}};
 const store=createStore(pool,{});assert.equal((await store.download(key)).passes[0].number,'SYNTHETIC');await assert.rejects(store.download(key.toLowerCase()),e=>e.status===404);assert.equal(calls,2);
 for(const bad of [key.slice(1),key+'a','!'.repeat(64),''])await assert.rejects(store.download(bad),e=>e.status===404);assert.equal(calls,2);
});
