import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../app.mjs';
test('family response document excludes inline tracking before capability code loads',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'ayambil-private-'));await writeFile(join(dir,'index.html'),'<html><!-- Meta Pixel Code --><script>fbq("PageView")</script><!-- End Meta Pixel Code --><noscript><img src="https://tracker.invalid"></noscript><div id="root"></div><script type="module" src="/assets/app.js"></script></html>');
 const app=createApp({store:{},config:{origin:'https://vardhmancreativestudio.com'},staticDirectory:dir});const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 try{const res=await fetch('http://127.0.0.1:'+server.address().port+'/500-akhand-ayambil-vijayollas/respond');const html=await res.text();assert.equal(res.status,200);assert.match(res.headers.get('cache-control'),/no-store/);assert.equal(res.headers.get('referrer-policy'),'no-referrer');assert.match(res.headers.get('x-robots-tag'),/noindex/);assert(!/fbq|tracker.invalid/.test(html));assert(html.includes('/assets/app.js'));}finally{await new Promise(r=>server.close(r));await rm(dir,{recursive:true,force:true});}
});
