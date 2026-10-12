import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../app.mjs';
import {createLeadRouter,validateLead} from '../leads.mjs';
import PocketBase from 'pocketbase';
const origin='https://example.invalid',body={name:'Synthetic lead',email:'synthetic@example.invalid',company:'Synthetic',message:'Synthetic message'};
test('lead routes preserve known SDK create contract, no-store, validation, origin and shared limits',async()=>{
 const writes=[],buckets=new Map();let failure=false,initialized=true;
 const pool={execute:async(sql,args)=>{assert.match(sql,/^INSERT INTO vcs_leads/);if(failure)throw Error('Private SQL detail');writes.push(args);}};
 const store={limit:async bucket=>{buckets.set(bucket,(buckets.get(bucket)||0)+1);return buckets.get(bucket)<=5;}};
 const config={origin,rateSecret:'synthetic-secret'.repeat(3)};
 const app=createApp({store,config,staticDirectory:process.cwd(),leadRouter:createLeadRouter({pool,store,config,isInitialized:()=>initialized}),legacyLeadRouter:createLeadRouter({pool,store,config,legacy:true,isInitialized:()=>initialized})});
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port;
 const paths=['/api/leads','/hcgi/platform/api/collections/leads/records'];
 const post=(path,value=body,headers={})=>fetch(base+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...headers},body:JSON.stringify(value)});
 try{
  const pb=new PocketBase(base+'/hcgi/platform');const record=await pb.collection('leads').create(body,{$autoCancel:false,headers:{Origin:origin}});assert.equal(record.collectionName,'leads');assert.equal(record.name,body.name);assert.equal(record.email,body.email);assert.match(record.id,/^[a-f0-9-]{36}$/);assert.equal(writes.length,1);assert.deepEqual(writes[0].slice(1,5),Object.values(body));
  const result=await post(paths[0]);assert.equal(result.status,201);assert.equal(result.headers.get('cache-control'),'no-store');assert.equal((await result.json()).created,true);
  for(const path of paths){for(const value of [{...body,email:'bad'},{...body,name:''},{...body,message:'x'.repeat(4001)},{...body,extra:'unexpected'},[],null]){const response=await post(path,value);assert.equal(response.status,400);assert.equal(response.headers.get('cache-control'),'no-store');}assert.equal((await post(path,body,{Origin:'https://other.invalid'})).status,403);}
  assert.equal(writes.length,2);
  initialized=false;assert.equal((await post(paths[0])).status,503);initialized=true;
  failure=true;const unavailable=await post(paths[1]);assert.equal(unavailable.status,503);assert.doesNotMatch(await unavailable.text(),/Private SQL|synthetic@example/);failure=false;
  const malformed=await fetch(base+paths[0],{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'{'});assert.equal(malformed.status,400);
  const oversized=await post(paths[1],{...body,message:'x'.repeat(20000)});assert.equal(oversized.status,413);
  for(const path of paths)assert.ok([200,201].includes((await post(path)).status));
  const limited=await post(paths[0],body,{'X-Forwarded-For':'198.51.100.2'});assert.equal(limited.status,429);assert.equal(buckets.size,1);
 }finally{await new Promise(r=>server.close(r));}
});
test('lead validation is bounded and cannot accept browser-supplied private metadata',()=>{assert.deepEqual(validateLead(body),body);for(const extra of ['id','created','recipient','password'])assert.throws(()=>validateLead({...body,[extra]:'unexpected'}));});