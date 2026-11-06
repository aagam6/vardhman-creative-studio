import test from 'node:test';
import assert from 'node:assert/strict';
import {preparePhoto,RAW_PHOTO_LIMIT} from '../src/lib/updhanRegistration.js';
import {formIssuePayload,submissionIssue} from '../src/lib/updhanFormTelemetry.js';
import {createWebsiteAnalytics} from '../src/lib/websiteAnalytics.js';
import {updhanAdminOverview} from '../src/lib/updhanAdminOverview.js';

test('form errors are bounded categories; exception text, field values and file names never leave',()=>{
 const win={location:{href:'https://vardhmancreativestudio.com/vijaypataka-updhan-mahotsav/registration?health=PRIVATE'}},doc={referrer:'',querySelector:()=>null,createElement:()=>({}),head:{appendChild(){}}};
 const tracker=createWebsiteAnalytics(win,doc,{updhanEnabled:true});
 const payload={issue_kind:'validation',step:2,error_count:3,name:'PRIVATE',health:'PRIVATE',message:'PRIVATE',file:'PRIVATE.jpg'};
 assert.equal(tracker.event('updhan_form_error',payload),false);tracker.setUpdhanConsent(true);
 assert.equal(tracker.event('updhan_form_view'),true);assert.equal(tracker.event('updhan_form_error',payload),true);
 const event=Array.from(win.dataLayer.at(-1));assert.equal(event[2].step,2);assert.equal(event[2].issue_kind,'validation');assert.equal(event[2].error_count,3);
 assert.ok(!JSON.stringify(win.dataLayer).includes('PRIVATE'));
 for(const invalid of [{...payload,issue_kind:'PRIVATE'},{...payload,step:0},{...payload,error_count:41},{...payload,error_count:'3'}])assert.equal(tracker.event('updhan_form_error',invalid),false);
 tracker.setUpdhanConsent(false);assert.equal(tracker.event('updhan_form_error',payload),false);
 assert.deepEqual(formIssuePayload(payload),{issue_kind:'validation',step:2,error_count:3});
 assert.equal(submissionIssue({status:503}),'server');assert.equal(submissionIssue({status:401}),'session');assert.equal(submissionIssue({message:'PRIVATE'}),'network');assert.equal(submissionIssue({status:503},{uncertain:true}),'uncertain');
});
test('admin counts keep applications, contacts, review, unsent, delivery and uncertainty distinct',()=>{
 assert.equal(updhanAdminOverview(null),null);
 const s=updhanAdminOverview({counts:{received:'3',under_review:2,approved:4,waitlisted:6,trashed:1},activity:{newToday:2},messages:{queued:2,preparing:3,sending:1,submitted:7,failed:4,uncertain:2,delivered:99},uniqueContacts:5,companions:9});
 assert.deepEqual(s,{total:16,today:2,review:5,approved:4,waiting:6,queued:5,delivery:7,sending:1,failed:4,uncertain:2,trash:1});
 assert.equal(updhanAdminOverview({counts:{}}).today,null);
});
test('mobile photo processing accepts larger source, bounds output and rejects spoofed/unsafe input',async()=>{
 await assert.rejects(preparePhoto({type:'image/heic',size:200}),e=>e.code==='photo_type');
 await assert.rejects(preparePhoto({type:'image/jpeg',size:RAW_PHOTO_LIMIT+1}),e=>e.code==='photo_size');
 await assert.rejects(preparePhoto(new Blob(['NOT A PHOTO'],{type:'image/jpeg'})),e=>e.code==='photo_type');
 const bitmapOriginal=globalThis.createImageBitmap,docOriginal=globalThis.document;
 let dimensions={width:2000,height:1600},closed=0,painted=false,canvas;
 const result=new Blob([new Uint8Array(50000)],{type:'image/jpeg'});
 globalThis.createImageBitmap=async()=>({...dimensions,close(){closed++;}});
 globalThis.document={createElement:()=>canvas={getContext:()=>({fillStyle:'',fillRect(){painted=true;},drawImage(){}}),toBlob:fn=>fn(result)}};
 const bytes=new Uint8Array(3*1024*1024);bytes.set([255,216,255]);const input=new Blob([bytes],{type:'image/jpeg'});
 try{
  assert.equal(await preparePhoto(input),result);assert.equal(canvas.width,1200);assert.equal(canvas.height,960);assert.equal(closed,1);assert.equal(painted,true);
  dimensions={width:5000,height:5000};await assert.rejects(preparePhoto(input),e=>e.code==='photo_dimensions');assert.equal(closed,2);
  globalThis.createImageBitmap=async()=>{throw Error('PRIVATE filename or decoder detail');};
  await assert.rejects(preparePhoto(input),e=>e.code==='photo_decode'&&!e.message.includes('PRIVATE'));
 }finally{if(bitmapOriginal===undefined)delete globalThis.createImageBitmap;else globalThis.createImageBitmap=bitmapOriginal;if(docOriginal===undefined)delete globalThis.document;else globalThis.document=docOriginal;}
});
