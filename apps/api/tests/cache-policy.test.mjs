import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createApp} from '../app.mjs';
import {ApiError} from '../config.mjs';

test('normal status URL reflects gate changes; private APIs and failures prohibit caches',async()=>{
  let open=true,initialized=true;
  const directory=await mkdtemp(path.join(tmpdir(),'ayambil-cache-'));
  await writeFile(path.join(directory,'index.html'),'<html>synthetic private page</html>');
  const store={status:async()=>({ready:true,open}),ready:async()=>true,session:async()=>{throw new ApiError(401,'Sign in required');}};
  const server=createApp({store,config:{origin:'https://example.invalid'},staticDirectory:directory,isInitialized:()=>initialized}).listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  const origin='http://127.0.0.1:'+server.address().port;
  const check=async(url,status)=>{
    const response=await fetch(origin+url);
    assert.equal(response.status,status,url);
    assert.match(response.headers.get('cache-control'),/no-store/);
    assert.doesNotMatch(response.headers.get('cache-control'),/public|s-maxage/);
    assert.equal(response.headers.get('cdn-cache-control'),'no-store');
    assert.equal(response.headers.get('surrogate-control'),'no-store');
    return response;
  };
  try{
    assert.equal((await (await check('/api/ayambil/status',200)).json()).open,true);
    open=false;
    assert.equal((await (await check('/api/ayambil/status',200)).json()).open,false);
    open=true;
    assert.equal((await (await check('/api/ayambil/status',200)).json()).open,true);
    await check('/api/ayambil/admin/bookings',401);
    await check('/api/unknown',404);
    await check('/admin/ayambil',200);
    await check('/500-akhand-ayambil-vijayollas/passes',200);
    initialized=false;
    await check('/api/ayambil/status',503);
  }finally{await new Promise(resolve=>server.close(resolve));await rm(directory,{recursive:true,force:true});}
});

test('Hostinger edge exception covers dynamic/private routes while static assets retain caching',async()=>{
  const source=await readFile(new URL('../../web/public/.htaccess',import.meta.url),'utf8');
  const pattern=source.match(/SetEnvIf Request_URI "([^"]+)" AYAMBIL_NOSTORE=1/);
  assert.ok(pattern,'Classify the original URI before the SPA/Passenger rewrite');
  const dynamic=new RegExp(pattern[1]);
  for(const url of ['/api','/api/ayambil/status','/api/ayambil/admin/bookings','/api/ayambil/pass-download','/api/leads','/hcgi/platform/api/collections/leads/records','/admin/ayambil','/500-akhand-ayambil-vijayollas/passes'])assert.ok(dynamic.test(url),url);
  for(const url of ['/','/apiary','/assets/app.js','/500-akhand-ayambil-vijayollas/manan-sanghvi'])assert.equal(dynamic.test(url),false,url);
  assert.match(source,/Header always set Cache-Control "private, no-store, max-age=0, must-revalidate"/);
  assert.match(source,/Header set Cache-Control "public, s-maxage=604800, max-age=0" env=!AYAMBIL_NOSTORE/);
  assert.match(source,/Header unset Cache-Control env=AYAMBIL_NOSTORE/);
  assert.match(source,/public, max-age=31536000, immutable/);
});
