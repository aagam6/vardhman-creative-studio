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

test('main event has crawlable initial content, registration links and a single canonical',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'ayambil-main-seo-'));
 await writeFile(dir+'/index.html','<html><head><title>Agency</title><link rel="canonical" href="https://vardhmancreativestudio.com/"></head><body><div id="root"></div></body></html>');
 await generateEventSeo(dir);
 const html=await readFile(dir+'/500-akhand-ayambil-vijayollas/index.html','utf8');
 assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
 assert.match(html,/<h1>500 Akhand Ayambil Tap Vijayollas<\/h1>/);
 assert.match(html,/href="\/500-akhand-ayambil-vijayollas\/manan-sanghvi"/);
 assert.match(html,/href="\/500-akhand-ayambil-vijayollas\/sairam-dave"/);
 assert.match(html,/data-react-helmet="true" rel="canonical" href="https:\/\/vardhmancreativestudio.com\/500-akhand-ayambil-vijayollas"/);
});

test('Param Vir Chakra defines one complete event and references it instead of creating an incomplete duplicate',async()=>{
 const source=await readFile(new URL('../src/pages/ParamVirChakraPage.jsx',import.meta.url),'utf8');
 const {parse}=await import('@babel/parser');
 const ast=parse(source,{sourceType:'module',plugins:['jsx']});
 const objects=[];
 function walk(node){if(!node||typeof node!=='object')return;if(node.type==='ObjectExpression')objects.push(node);for(const value of Object.values(node))if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object')walk(value);}
 walk(ast);
 const eventObjects=objects.filter(node=>node.properties.some(p=>p.key?.value==='@type'&&p.value?.value==='Event'));
 assert.equal(eventObjects.length,1);
 const fields=eventObjects[0].properties.map(p=>p.key?.name||p.key?.value);
 for(const key of ['@id','name','startDate','endDate','location','image','offers'])assert.ok(fields.includes(key),key);
 assert.doesNotMatch(source,/SearchAction|search_term_string/);
});
