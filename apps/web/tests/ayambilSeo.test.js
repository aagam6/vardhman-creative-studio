import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {generateEventSeo} from '../tools/event-seo.mjs';
test('initial HTML has unique artist previews without generic agency metadata',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'ayambil-seo-'));
 await writeFile(dir+'/index.html','<html><head><title>Agency</title><meta property="og:image" content="logo.png"><meta name="twitter:title" content="Agency"></head><body><div id="root"></div></body></html>');
 await generateEventSeo(dir);
 for(const [slug,artist] of [['sairam-dave','Sairam Dave'],['manan-sanghvi','Manan Sanghvi']]){
 const html=await readFile(dir+'/500-akhand-ayambil-vijayollas/'+slug+'/index.html','utf8');
 assert.ok(html.includes(artist)); assert.ok(html.includes(slug+'-portrait.png')); assert.equal((html.match(/property="og:image"/g)||[]).length,1); assert.ok(html.includes('rel="canonical"')); assert.ok(html.includes('summary_large_image')); assert.ok(!html.includes('logo.png'));
 }
});
