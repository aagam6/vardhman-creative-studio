import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {publicSeo} from '../public-seo.mjs';
import {request} from 'node:http';

// Explicit Host header: fetch/undici normalizes it to the loopback URL host.
const fetch=(url,options={})=>new Promise((resolve,reject)=>{
  const req=request(url,{method:options.method||'GET',headers:options.headers},res=>{
    let body='';res.setEncoding('utf8');res.on('data',chunk=>body+=chunk);res.on('end',()=>resolve({status:res.statusCode,headers:{get:name=>res.headers[name]||null},json:async()=>JSON.parse(body)}));
  });req.on('error',reject);req.end();
});

test('public canonical aliases redirect once while API and private pass capabilities stay untouched', async t => {
  const app=express();app.use(publicSeo);app.use((req,res)=>res.json({path:req.originalUrl}));
  const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));t.after(()=>server.close());
  const origin=`http://127.0.0.1:${server.address().port}`;
  for(const [path,host,target] of [['/','www.vardhmancreativestudio.com','/'],['/search?q=test','vardhmancreativestudio.com','/'],['/?s=test','vardhmancreativestudio.com','/'],['/500-akhand-ayambil-vijayollas/','vardhmancreativestudio.com','/500-akhand-ayambil-vijayollas']]) {
    const response=await fetch(origin+path,{headers:{host},redirect:'manual'});assert.equal(response.status,301,path+" @ "+host);assert.equal(response.headers.get('location'),'https://vardhmancreativestudio.com'+target);
  }
  for(const path of ['/api/ayambil/register','/admin/ayambil','/500-akhand-ayambil-vijayollas/passes?key=PRIVATE']) {
    for(const method of ['GET','POST']) {
      const response=await fetch(origin+path,{method,headers:{host:'www.vardhmancreativestudio.com'},redirect:'manual'});
      assert.equal(response.status,200);assert.equal(response.headers.get('location'),null);assert.equal(response.headers.get('link'),null);assert.equal((await response.json()).path,path);
    }
  }
  const response=await fetch(origin+'/500-akhand-ayambil-vijayollas?utm_source=whatsapp');assert.equal(response.status,200);assert.equal(response.headers.get('link'),'<https://vardhmancreativestudio.com/500-akhand-ayambil-vijayollas>; rel="canonical"');
});
