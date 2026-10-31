import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../app.mjs';

test('Updhan physical documents do not redirect and admin document prohibits caching',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'updhan-host-routing-'));
 for(const [route,html] of [['admin/updhan','private admin'],['vijaypataka-updhan-mahotsav','public programme']]){
  await mkdir(join(directory,route),{recursive:true});await writeFile(join(directory,route,'index.html'),html);
 }
 await writeFile(join(directory,'index.html'),'shared SPA');
 const server=createApp({store:{},config:{origin:'https://example.invalid'},staticDirectory:directory}).listen(0,'127.0.0.1');
 await new Promise(resolve=>server.once('listening',resolve));
 try{
  for(const suffix of ['','/','/index.html'])for(const [route,expected] of [['admin/updhan','private admin'],['vijaypataka-updhan-mahotsav','public programme']]){
   const response=await fetch(`http://127.0.0.1:${server.address().port}/${route}${suffix}`,{redirect:'manual'});
   assert.equal(response.status,200,route+suffix);assert.equal(await response.text(),expected);assert.equal(response.headers.get('location'),null);
   if(route.startsWith('admin')){assert.match(response.headers.get('cache-control'),/no-store/);assert.equal(response.headers.get('cdn-cache-control'),'no-store');}
  }
 }finally{await new Promise(resolve=>server.close(resolve));await rm(directory,{recursive:true,force:true});}
});
