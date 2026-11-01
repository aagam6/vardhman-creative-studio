import test from 'node:test';
import assert from 'node:assert/strict';
import {sanitizeCampaign,sanitizeAttribution,createCampaignMemory,campaignUrl,UPDHAN_URL,UPDHAN_FORM_PATH,updhanApplicationPath,campaignFromUrl} from '../src/lib/updhanMarketing.js';
import {createWebsiteAnalytics,publicAnalyticsPage} from '../src/lib/websiteAnalytics.js';
import {renderUpdhanPublic} from '../tools/generate-updhan-public.mjs';
const campaign={utm_source:'instagram',utm_medium:'paid_social',utm_campaign:'vijaypataka_updhan_2027',utm_content:'reel_01'};
test('campaign policy excludes arbitrary personal values and duplicate keys',()=>{
 assert.deepEqual(sanitizeCampaign({...campaign,phone:'9999999999',name:'Private'}),campaign);
 assert.deepEqual(sanitizeCampaign({...campaign,utm_campaign:'Private person'}),{});
 assert.deepEqual(sanitizeCampaign(new URLSearchParams(`${new URLSearchParams(campaign)}&utm_source=google`)),{});
 assert.equal(sanitizeAttribution({firstTouch:campaign,lastTouch:campaign}),null);
 const formPath=updhanApplicationPath(`${campaignUrl(campaign).split('#')[0]}&phone=PRIVATE&name=PRIVATE`);assert.ok(formPath.startsWith(UPDHAN_FORM_PATH+'?'));assert.equal(formPath.includes('PRIVATE'),false);assert.deepEqual(campaignFromUrl('https://vardhmancreativestudio.com'+formPath),campaign);
 assert.deepEqual(sanitizeAttribution({consent:true,firstTouch:{...campaign,health:'private'},lastTouch:campaign}),{consent:true,firstTouch:campaign,lastTouch:campaign});
});
test('campaign memory requires consent, expires and erases on withdrawal',()=>{
 let time=0;const memory=createCampaignMemory({now:()=>time,ttlMs:10});const url=campaignUrl(campaign);
 memory.capture(url);assert.equal(memory.get(),null);memory.setConsent(true);memory.capture(url);assert.deepEqual(memory.get().firstTouch,campaign);
 time=11;assert.equal(memory.get(),null);memory.capture(url);memory.setConsent(false);assert.equal(memory.get(),null);
});
test('GA excludes local/private URLs and sanitizes event payload after consent',()=>{
 assert.equal(publicAnalyticsPage('http://127.0.0.1:3117/vijaypataka-updhan-mahotsav'),null);
 assert.equal(publicAnalyticsPage('https://vardhmancreativestudio.com/admin/updhan-preview'),null);
 const scripts=[];const win={location:{href:campaignUrl(campaign)+'&phone=private'}};
 const doc={referrer:'https://other.test/?private=1',querySelector:()=>null,createElement:()=>({}),head:{appendChild:s=>scripts.push(s)}};
 const tracker=createWebsiteAnalytics(win,doc,{updhanEnabled:true});tracker(win.location.href);assert.equal(scripts.length,0);
 tracker.setUpdhanConsent(true);assert.equal(scripts.length,1);assert.equal(createWebsiteAnalytics(win,doc),tracker);
 assert.equal(tracker.event('updhan_step_view',{step:2,name:'Private',phone:'Private'}),true);
 const event=Array.from(win.dataLayer.at(-1));assert.equal(event[2].step,2);assert.equal(event[2].phone,undefined);assert.equal(event[2].name,undefined);
 assert.equal(tracker.event('updhan_step_view',{step:6}),false);tracker.setUpdhanConsent(false);assert.equal(tracker.event('updhan_application_received'),false);
 const local={location:{href:'http://localhost:3117/vijaypataka-updhan-mahotsav'}};createWebsiteAnalytics(local,doc,{updhanEnabled:true}).setUpdhanConsent(true);assert.equal(local.dataLayer,undefined);
 const disabled={location:{href:UPDHAN_URL}};createWebsiteAnalytics(disabled,doc).setUpdhanConsent(true);assert.equal(disabled.dataLayer,undefined);
 const disabledForm={location:{href:'https://vardhmancreativestudio.com'+UPDHAN_FORM_PATH}};createWebsiteAnalytics(disabledForm,doc).setUpdhanConsent(true);assert.equal(disabledForm.dataLayer,undefined);
});
test('public build includes visible facts, canonical and JSON-LD without route pixel',()=>{
 const html=renderUpdhanPublic('<html><head><title>Old</title><meta name="description" content="Old"><script>fbq("init")</script></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>');
 assert.ok(html.includes(`rel="canonical" href="${UPDHAN_URL}"`));assert.ok(html.includes('FAQPage'));assert.ok(html.includes('<h1>'));assert.ok(html.includes('Check the application form for current availability'));assert.ok(html.includes('/assets/app.js'));assert.ok(!html.includes('fbq('));
});
