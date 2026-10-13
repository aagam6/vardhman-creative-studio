// Owned localhost fixture only. No database, hosted requests or provider sends.
// PLAYWRIGHT_MODULE may point to a locally installed Playwright index.mjs.
import assert from 'node:assert/strict';
import {createServer,transformWithEsbuild} from 'vite';
import react from '@vitejs/plugin-react';
import {mkdir,readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const out=path.join(root,'tmp/ayambil-design');await mkdir(out,{recursive:true});
const fixture=`import React from 'react';import{createRoot}from'react-dom/client';import{BrowserRouter}from'react-router-dom';
import Pass from '/apps/web/src/components/AyambilDigitalPass.jsx';
import Admin from '/apps/web/src/pages/AyambilAdminPage.jsx';
import '/apps/web/src/index.css';import data from '/apps/api/programme.json';
const params=new URLSearchParams(location.search),session=data.sessions[Number(params.get('evening')||0)];
const pass={number:'AYV26-QA-PREVIEW-ONLY',attendeeName:params.get('long')?'Synthetic long attendee name '.repeat(4).trim():'QA TEST — DO NOT ATTEND',status:params.get('status')||'active',issuedAt:'2026-10-12T00:00:00Z',sessions:[session]};
const booking={id:'qa-booking',number:'BOOK26-QA-PREVIEW-ONLY',contactName:'Synthetic contact',mobile:'+12025550123',created:'2026-10-12T00:00:00Z',status:'active',attendees:[{id:'qa-attendee',fullName:pass.attendeeName,status:'active',dates:[session.date],passes:[pass]}],whatsapp:{status:'Queue summary unavailable',attempts:null,history:[]}};
const nativeFetch=window.fetch.bind(window);window.__calls=[];window.fetch=async(url,options={})=>{window.__calls.push({url,method:options.method||'GET'});const route=new URL(url,location.origin).pathname;if(!route.startsWith('/api/'))return nativeFetch(url,options);
if(route==='/api/ayambil/admin/session')return Response.json({authenticated:true,csrfToken:'a'.repeat(64)});
if(route==='/api/ayambil/admin/bookings')return Response.json({items:window.__newBooking?[{...booking,id:'qa-new-booking',number:'BOOK26-QA-NEW-ONLY',created:'2026-10-13 04:05:59.393'},booking]:[booking],page:1,hasMore:false,integration:{ready:false,missing:[]}});
if(route==='/api/ayambil/admin/whatsapp')return Response.json({sending:false,configured:false,missing:[]});
if(route==='/api/ayambil/admin/messages')return Response.json({items:params.has('manual')?[{id:'11111111-1111-4111-8111-111111111111',booking_id:'22222222-2222-4222-8222-222222222222',notification_type:'confirmation',status:window.__manualSent?'accepted':'queued',attempts:window.__manualSent?1:0,manualSendingAvailable:true,canVerifyProviderStatus:!!window.__manualSent},{id:'old-attempted-fixture',booking_id:'qa-booking',notification_type:'confirmation',status:'uncertain',attempts:1,manualSendingAvailable:true,canVerifyProviderStatus:false}]:[]});
if(route==='/api/ayambil/admin/messages/send-selected'){window.__selectedPayload=JSON.parse(options.body);window.__manualSent=true;return Response.json({processed:true,status:'accepted'});}
throw new Error('Unexpected fixture request');};
createRoot(document.getElementById('root')).render(<BrowserRouter>{params.has('admin')?<Admin/>:<div className="ay-page" style={{padding:20,maxWidth:1100,margin:'auto'}}><Pass pass={pass}/></div>}</BrowserRouter>);`;
const fixturePlugin={name:'owned-ayambil-design-fixture.jsx',resolveId(id){if(id==='/__design-fixture.jsx')return '\0design-fixture.jsx';},async load(id){if(id==='\0design-fixture.jsx')return (await transformWithEsbuild(fixture,'fixture.jsx',{loader:'jsx',jsx:'transform',target:'esnext'})).code;},configureServer(server){server.middlewares.use('/__design',async(req,res)=>{res.setHeader('Content-Type','text/html');res.end(await server.transformIndexHtml(req.url,'<meta name="viewport" content="width=device-width,initial-scale=1"><div id="root"></div><script type="module" src="/@vite/client"></script><script type="module" src="/__design-fixture.jsx"></script>'));});}};
const server=await createServer({configFile:false,root,publicDir:path.join(root,'apps/web/public'),plugins:[react(),fixturePlugin],resolve:{alias:{'@':path.join(root,'apps/web/src')}},optimizeDeps:{esbuildOptions:{target:'esnext'}},esbuild:{target:'esnext'},server:{host:'127.0.0.1',port:0,watch:{ignored:['**/tmp/**']}}});
let browser,checks=0;
const check=(condition,message)=>{assert.ok(condition,message);checks++;};
try{
 await server.listen();const base=`http://127.0.0.1:${server.httpServer.address().port}`;
 browser=await chromium.launch({headless:true,...(process.env.DESIGN_BROWSER_CHANNEL?{channel:process.env.DESIGN_BROWSER_CHANNEL}:{})});
 const page=await browser.newPage({viewport:{width:1440,height:1100}});const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('Local fixture error:',e.message);});
 await page.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
 for(const evening of [0,1]){
  await page.goto(`${base}/__design?evening=${evening}`);await page.locator('.ay-pass-back').waitFor();await page.evaluate(()=>document.fonts.ready);
  check(await page.locator('.ay-pass-rules li').count()===8,'all bilingual terms');check(await page.locator('.ay-pass-credits>div').count()===3,'all credit groups');
  check((await page.locator('.ay-pass-validity').textContent()).includes('ACTIVE'),'front status');
  const wait=page.waitForEvent('download');await page.getByRole('button',{name:/Download PDF/}).click();const download=await wait;const file=path.join(out,`evening-${evening+1}.pdf`);await download.saveAs(file);
  const pdf=(await readFile(file)).toString('latin1');const boxes=[...pdf.matchAll(/\/MediaBox\s*\[([^\]]+)\]/g)];
  check(boxes.length===2,'two PDF pages');for(const box of boxes){const [,,width,height]=box[1].trim().split(/\s+/).map(Number);check(Math.abs(width-205*72/25.4)<.01&&Math.abs(height-105*72/25.4)<.01,'exact physical dimensions');}
  await page.screenshot({path:path.join(out,`evening-${evening+1}-desktop.png`),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile page has no horizontal overflow');
  check((await page.locator('.ay-pass-attendee strong').boundingBox()).width>200,'mobile name remains readable');
  await page.screenshot({path:path.join(out,`evening-${evening+1}-mobile.png`),fullPage:true});
  const mobileWait=page.waitForEvent('download');await page.getByRole('button',{name:/Download PDF/}).click();await (await mobileWait).saveAs(path.join(out,`evening-${evening+1}-mobile.pdf`));
  await page.setViewportSize({width:1440,height:1100});
 }
 await page.goto(`${base}/__design?long=1`);await page.locator('.ay-pass-back').waitFor();const longWait=page.waitForEvent('download');await page.getByRole('button',{name:/Download PDF/}).click();await(await longWait).saveAs(path.join(out,'long-name.pdf'));checks++;
 for(const status of ['cancelled','superseded']){await page.goto(`${base}/__design?status=${status}`);await page.locator('.ay-pass-validity').waitFor();check(await page.getByRole('button',{name:/Download PDF/}).isDisabled(),'inactive download disabled');check(await page.getByRole('button',{name:/Print/}).isDisabled(),'inactive print disabled');}
 await page.goto(`${base}/__design?admin=1`);await page.locator('.ay-admin-booking').waitFor();
 check(await page.getByRole('button',{name:'Queue authorized test to server-configured recipient',exact:true}).count()===0,'test controls hidden without server staging approval');
 check(!await page.locator('.ay-admin-attendee').isVisible(),'attendees collapsed');check(!await page.getByText('Contact number:').isVisible(),'contact concealed');
 await page.screenshot({path:path.join(out,'admin-desktop.png'),fullPage:true});
 await page.getByRole('button',{name:'Cancel booking',exact:true}).click();check(await page.getByRole('button',{name:'Confirm cancel',exact:true}).isVisible(),'existing confirmation');check(!await page.evaluate(()=>window.__calls.some(c=>c.url.includes('admin/change'))),'cancel opens confirmation without mutation');await page.getByRole('button',{name:'Keep unchanged',exact:true}).click();
 await page.getByText('Attendees & passes (1)',{exact:true}).click();await page.getByText('Preview & download digital pass',{exact:true}).click();
 const adminWait=page.waitForEvent('download');await page.getByRole('button',{name:/Download PDF/}).click();await(await adminWait).saveAs(path.join(out,'admin-pass.pdf'));checks++;
 await page.setViewportSize({width:390,height:844});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile admin has no horizontal overflow');await page.screenshot({path:path.join(out,'admin-mobile.png'),fullPage:true});await page.getByRole('button',{name:'Reissue attendee pass',exact:true}).click();check(await page.getByRole('button',{name:'Confirm reissue',exact:true}).isVisible(),'reissue keeps confirmation');await page.getByRole('button',{name:'Keep unchanged',exact:true}).click();
 const csvWait=page.waitForEvent('download');await page.getByRole('button',{name:'Export filtered attendees'}).click();const csv=await csvWait;await csv.saveAs(path.join(out,'synthetic.csv'));check((await readFile(path.join(out,'synthetic.csv'),'utf8')).includes('QA TEST'),'CSV retains synthetic attendee');
 check(!await page.evaluate(()=>window.__calls.some(c=>c.url.includes('messages/process')||c.url.includes('messages/test'))),'no message action');check(errors.length===0,`browser errors: ${errors.join(';')}`);
 await page.getByLabel('Search contact, attendee or booking').fill('old filter');
 await page.getByRole('button',{name:'Search',exact:true}).click();await page.getByRole('button',{name:'Search',exact:true}).waitFor({state:'visible'});
 await page.evaluate(()=>{window.__newBooking=true;});
 await page.getByRole('button',{name:'Refresh latest bookings (clear filters)',exact:true}).click();
 await page.getByRole('heading',{name:'BOOK26-QA-NEW-ONLY',exact:true}).waitFor();
 check(await page.getByLabel('Search contact, attendee or booking').inputValue()==='','latest refresh clears stale search');
 check((await page.locator('.ay-booking-meta').first().textContent()).includes('09:35 am IST'),'new booking UTC time converted to IST');
 check(await page.locator('.ay-admin-booking').count()===2,'new booking visible without sign-out');
 await page.getByLabel('Search contact, attendee or booking').fill('unsubmitted draft');
 await page.evaluate(()=>{window.__newBooking=false;window.dispatchEvent(new Event('focus'));});
 await page.waitForFunction(()=>document.querySelectorAll('.ay-admin-booking').length===1);
 check((await page.evaluate(()=>window.__calls.filter(c=>c.url.includes('admin/bookings')).at(-1).url)).includes('search=&'),'focus refresh uses applied filters, not draft input');
 check(await page.getByLabel('Search contact, attendee or booking').inputValue()==='unsubmitted draft','focus refresh preserves draft input');
 check(!await page.evaluate(()=>window.__calls.some(c=>c.url.includes('admin/change')||c.url.includes('messages/process')||c.url.includes('messages/test'))),'refresh never mutates bookings or queue');
 await page.goto(`${base}/__design`);await page.locator('.ay-pass-attendee strong').waitFor();await page.locator('.ay-pass-attendee strong').evaluate(e=>e.textContent='Synthetic overflow '.repeat(100));await page.getByRole('button',{name:/Download PDF/}).click();await page.getByRole('status').filter({hasText:'too long'}).waitFor();checks++;
 await page.goto(`${base}/__design?admin&manual`);await page.getByRole('heading',{name:'Evening registrations'}).waitFor();await page.getByRole('button',{name:'Refresh message status',exact:true}).waitFor();await page.getByRole('button',{name:'Refresh message status',exact:true}).click();
 await page.getByRole('button',{name:'Review & send',exact:true}).waitFor();check(await page.getByRole('button',{name:'Review & send',exact:true}).count()===1,'attempted/uncertain message has no send shortcut');
 await page.getByRole('button',{name:'Review & send',exact:true}).click();check(!await page.evaluate(()=>window.__manualSent),'review does not send');await page.getByRole('group',{name:'Confirm selected WhatsApp message'}).getByRole('button',{name:'Cancel',exact:true}).click();check(!await page.evaluate(()=>window.__manualSent),'cancel does not send');
 await page.getByRole('button',{name:'Review & send',exact:true}).click();await page.getByRole('button',{name:'Confirm send this message',exact:true}).click();try{await page.waitForFunction(()=>window.__manualSent,{},{timeout:5000});}catch(error){console.log(await page.evaluate(()=>({calls:window.__calls.map(c=>({url:c.url,method:c.method})),error:document.querySelector('.ay-form-error')?.textContent})));throw error;}await page.getByRole('status').filter({hasText:'Message status: accepted'}).waitFor();
 const payload=await page.evaluate(()=>window.__selectedPayload);check(Object.keys(payload).sort().join(',')==='bookingId,id,type','manual request contains identifiers only');check(payload.id==='11111111-1111-4111-8111-111111111111','only selected message submitted');await page.getByRole('button',{name:'Review & send',exact:true}).waitFor({state:'hidden'});check((await page.evaluate(()=>window.__calls.filter(c=>c.url.includes('send-selected')).length))===1,'one submission and accepted job no longer selectable');
 check(await page.locator('.ay-queue-card').count()===2,'queue uses compact individual message cards');await page.getByLabel('Message status',{exact:true}).selectOption('review');check(await page.locator('.ay-queue-card').count()===1,'needs-review filter retains uncertain jobs');check((await page.locator('.ay-queue-card').textContent()).includes('do not retry'),'uncertainty warning stays visible');await page.getByLabel('Message type',{exact:true}).selectOption('pass');check(await page.locator('.ay-queue-empty').isVisible(),'filter empty state is explicit');await page.getByLabel('Message type',{exact:true}).selectOption('all');await page.getByLabel('Message status',{exact:true}).selectOption('all');await page.locator('.ay-queue').screenshot({path:path.join(out,'queue-desktop.png')});await page.setViewportSize({width:390,height:844});check(await page.locator('.ay-queue').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'mobile queue has no horizontal overflow');await page.locator('.ay-queue').screenshot({path:path.join(out,'queue-mobile.png')});
 console.log(`PASS ${checks} local browser/PDF assertions; provider and API responses mocked; artifacts ${out}`);
}finally{await browser?.close();await server.close();}
