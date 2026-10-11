import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../app.mjs';
import {configuration,bookingInput,ApiError} from '../config.mjs';
import {hash,passwordHash,passwordMatches} from '../security.mjs';
import {transaction} from '../store.mjs';
import {validatePassDownload} from '../../web/src/lib/ayambilApiResponse.js';
const env={DB_HOST:'127.0.0.1',DB_PORT:'3306',DB_NAME:'ayambil_test_example',DB_USER:'synthetic',DB_PASSWORD:'synthetic-not-real',AYAMBIL_SITE_ORIGIN:'https://example.invalid',AYAMBIL_RATE_LIMIT_SECRET:'synthetic-local-only-secret-at-least-32'};
const body=(count=1)=>({contactName:'Synthetic Contact',mobile:'+12025550123',eventDate:'2026-11-02',termsAccepted:true,whatsappConsent:true,requestKey:'a'.repeat(64),attendees:Array.from({length:count},()=>({fullName:'Synthetic Attendee',dates:['2026-11-02']}))});
test('config validates every server-only credential and keeps gates closed',()=>{
 assert.equal(configuration(env).registrationOpen,false);
 for(const key of Object.keys(env))assert.throws(()=>configuration({...env,[key]:''}));
 assert.throws(()=>configuration({...env,DB_PORT:'bad'}));
 assert.throws(()=>configuration({...env,AYAMBIL_WHATSAPP_ENABLED:'true'}));
});
test('validation accepts one/two, rejects three, mixed evenings and absent terms',()=>{
 for(const n of [1,2])assert.equal(bookingInput(body(n)).attendees.length,n);
 for(const b of [body(3),{...body(),termsAccepted:false},{...body(),eventDate:'2026-11-04'},{...body(),requestKey:''}])assert.throws(()=>bookingInput(b));
});
test('real scrypt verifies hashes without default administrator credentials',async()=>{
 const encoded=await passwordHash('Synthetic strong password');assert.equal(await passwordMatches('Synthetic strong password',encoded),true);assert.equal(await passwordMatches('wrong',encoded),false);assert.equal(await passwordMatches('wrong',null),false);
});
test('mock connection transaction commits/releases and rolls back on failure',async()=>{
 const calls=[];const db={beginTransaction:async()=>calls.push('begin'),commit:async()=>calls.push('commit'),rollback:async()=>calls.push('rollback'),release:()=>calls.push('release')};
 const pool={getConnection:async()=>db};assert.equal(await transaction(pool,async()=>1),1);assert.deepEqual(calls,['begin','commit','release']);calls.length=0;await assert.rejects(transaction(pool,async()=>{throw Error();}));assert.deepEqual(calls,['begin','rollback','release']);
});
test('mock-store HTTP routes return JSON/no-store; auth, CSRF, gates and SPA are separate',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'ayambil-api-'));await writeFile(join(directory,'index.html'),'<html>synthetic SPA</html>');
 const csrf='c'.repeat(64);let limited=true;
 const store={ready:async()=>true,status:async()=>({ready:true,open:false,whatsapp:'disabled'}),limit:async()=>limited,
 login:async(email,password)=>{if(password!=='synthetic-valid')throw new ApiError(401,'Sign-in failed');return {token:'b'.repeat(64),csrf};},
 session:async(token)=>{if(token!=='b'.repeat(64))throw new ApiError(401,'Administrator sign-in required');return {admin_id:'synthetic-admin',csrf_hash:hash(csrf)};},
 restoreSession:async(token)=>{if(token!=='b'.repeat(64))throw new ApiError(401,'Administrator sign-in required');return {authenticated:true,csrfToken:csrf};},
 logout:async()=>{},register:async()=>{throw new ApiError(403,'Registration closed');},download:async()=>{throw new ApiError(404,'Pass download unavailable');},
 list:async query=>({items:[],page:Number(query.page),hasMore:false}),change:async()=>({status:'cancelled'})};
 const server=createApp({store,config:configuration(env),staticDirectory:directory}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const root='http://127.0.0.1:'+server.address().port;
 const request=(path,options={})=>fetch(root+path,{...options,headers:{Origin:env.AYAMBIL_SITE_ORIGIN,...options.headers}});
 try {
  for(const path of ['/api/ayambil/health','/api/ayambil/status','/api/ayambil/missing','/api/missing']){const r=await request(path);assert.match(r.headers.get('content-type'),/json/);assert.equal(r.headers.get('cache-control'),'no-store');await r.json();}
  assert.match(await (await request('/event')).text(),/synthetic SPA/);
  assert.equal((await request('/api/ayambil/admin/bookings')).status,401);
  assert.equal((await request('/api/ayambil/admin/session',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,401);
  const post={method:'POST',headers:{'Content-Type':'application/json'},body:'{}'};
  assert.equal((await request('/api/ayambil/register',post)).status,403);
  assert.equal((await request('/api/ayambil/pass-download',post)).status,404);
  assert.equal((await request('/api/ayambil/register',{...post,body:'{'})).status,400);
  assert.equal((await request('/api/ayambil/admin/login',{...post,body:JSON.stringify({email:'test@example.invalid',password:'wrong'})})).status,401);
  const login=await request('/api/ayambil/admin/login',{...post,body:JSON.stringify({email:'test@example.invalid',password:'synthetic-valid'})});
  const cookie=login.headers.get('set-cookie');assert.match(cookie,/Secure/);assert.match(cookie,/HttpOnly/);assert.match(cookie,/SameSite=Strict/);
  const headers={Cookie:cookie.split(';')[0],'Content-Type':'application/json'};
  assert.equal((await request('/api/ayambil/admin/change',{...post,headers})).status,403);
  assert.equal((await request('/api/ayambil/admin/change',{...post,headers:{...headers,'X-CSRF-Token':csrf}})).status,200);
  assert.equal((await request('/api/ayambil/admin/whatsapp-retry',{...post,headers:{...headers,'X-CSRF-Token':csrf}})).status,403);
  const list=await request('/api/ayambil/admin/bookings?page=2',{headers});assert.deepEqual(await list.json(),{items:[],page:2,hasMore:false});
  assert.equal((await request('/api/ayambil/admin/session',{headers})).status,200);
  assert.deepEqual(await (await request('/api/ayambil/admin/session',{...post,headers})).json(),{authenticated:true,csrfToken:csrf});
  assert.equal((await request('/api/ayambil/admin/logout',{...post,headers:{...headers,'X-CSRF-Token':csrf}})).status,200);
  limited=false;assert.equal((await request('/api/ayambil/pass-download',post)).status,429);
  assert.equal((await request('/api/ayambil/status',{headers:{Origin:'https://untrusted.invalid'}})).status,403);
 }finally{await new Promise(r=>server.close(r));}
});
test('saved pass validator accepts reusable PDF contract and rejects absent sessions',()=>{
 const pass={number:'SYNTHETIC',attendeeName:'Synthetic Attendee',sessions:[{date:'2026-11-02',performer:'Manan Sanghvi',programme:'એક શામ દાદા ઋષભ કે નામ',label:'2 November',time:'8:00 PM IST',venue:'Synthetic venue',address:'Synthetic address'}]};assert.equal(validatePassDownload({passes:[pass]}).length,1);assert.throws(()=>validatePassDownload({passes:[{...pass,sessions:[]}]}));
});

test('mock-store routing gates: unavailable readiness and legacy leads remain JSON/no-store before SPA',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'ayambil-routing-'));
 await writeFile(join(directory,'index.html'),'<html>synthetic SPA</html>');
 const app=createApp({config:configuration(env),staticDirectory:directory,store:{
  ready:async()=>false,
  status:async()=>{throw Error('synthetic database unavailable');},
  session:async()=>{throw new ApiError(401,'Administrator sign-in required');}
 }});
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const base='http://127.0.0.1:'+server.address().port;
 try {
  for(const [path,status,method] of [
   ['/api/ayambil/health',503,'GET'],['/api/ayambil/status',503,'GET'],
   ['/api/ayambil/admin/bookings',401,'GET'],['/api/ayambil/unknown',404,'GET'],
   ['/api/unknown',404,'GET'],['/hcgi/platform/api/collections/leads/records',503,'POST']
  ]){
   const response=await fetch(base+path,{method});
   assert.equal(response.status,status);assert.match(response.headers.get('content-type'),/application\/json/);
   assert.equal(response.headers.get('cache-control'),'no-store');
   const data=await response.json();assert.ok(data.error||data.ready===false);
   assert.equal(response.headers.get('x-powered-by'),null);
  }
  assert.match(await (await fetch(base+'/event')).text(),/synthetic SPA/);
 }finally{await new Promise(r=>server.close(r));}
});

test('mock rate store: spoofed forwarding headers cannot rotate the socket-based login bucket',async()=>{
 const buckets=new Map();
 const app=createApp({config:configuration(env),staticDirectory:tmpdir(),store:{
  limit:async(bucket,max)=>{const count=(buckets.get(bucket)||0)+1;buckets.set(bucket,count);return count<=max;},
  login:async()=>{throw new ApiError(401,'Sign-in failed');}
 }});
 assert.equal(app.get('trust proxy'),false);
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 try {
  for(let i=0;i<6;i++){
   const response=await fetch('http://127.0.0.1:'+server.address().port+'/api/ayambil/admin/login',{
    method:'POST',headers:{Origin:env.AYAMBIL_SITE_ORIGIN,'Content-Type':'application/json','X-Forwarded-For':'198.51.100.'+(i+1)},
    body:JSON.stringify({email:'synthetic@example.invalid',password:'synthetic-invalid'})
   });
   assert.equal(response.status,i<5?401:429);assert.equal(response.headers.get('cache-control'),'no-store');await response.json();
  }
  assert.equal(buckets.size,1);assert.equal([...buckets.values()][0],6);
 }finally{await new Promise(r=>server.close(r));}
});
test('Message queue administration is denied before provider or queue access',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'ayambil-queue-auth-'));await writeFile(join(directory,'index.html'),'synthetic');
 const config=configuration(env);let touched=false;
 const app=createApp({config,staticDirectory:directory,store:{session:async()=>{throw new ApiError(401,'Sign in required');}},queue:{list:async()=>{touched=true;},runOne:async()=>{touched=true;}}});
 const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 try{for(const [path,method] of [['messages','GET'],['messages/process','POST'],['messages/test','POST'],['messages/status','POST'],['messages/reminder','POST']]){const response=await fetch('http://127.0.0.1:'+server.address().port+'/api/ayambil/admin/'+path,{method,headers:{Origin:config.origin,'Content-Type':'application/json'},...(method==='POST'?{body:'{}'}:{})});assert.equal(response.status,401);assert.equal(response.headers.get('cache-control'),'no-store');}assert.equal(touched,false);}finally{await new Promise(resolve=>server.close(resolve));}
});
