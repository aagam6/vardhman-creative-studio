import test from 'node:test';
import assert from 'node:assert/strict';
import {createWebsiteAnalytics} from '../src/lib/websiteAnalytics.js';
import {sanitizeCampaign} from '../src/lib/updhanMarketing.js';
test('Updhan button and saved receipt events exclude private data and deduplicate',()=>{
 const win={location:{href:'https://vardhmancreativestudio.com/vijaypataka-updhan-mahotsav/registration?name=PRIVATE'}},doc={referrer:'',querySelector:()=>null,createElement:()=>({}),head:{appendChild(){}}};
 const tracker=createWebsiteAnalytics(win,doc,{updhanEnabled:true});tracker.setUpdhanConsent(true);
 assert.equal(tracker.event('updhan_button_click',{button_id:'hero_apply',name:'PRIVATE'}),true);
 assert.equal(tracker.event('updhan_button_click',{button_id:'PRIVATE'}),false);
 assert.equal(tracker.event('updhan_application_received',{dedupeKey:'private-id'}),true);
 assert.equal(tracker.event('updhan_application_received',{dedupeKey:'private-id'}),false);
 assert.equal(tracker.event('updhan_application_received'),false);
 assert.equal(JSON.stringify(win.dataLayer).includes('PRIVATE'),false);assert.equal(JSON.stringify(win.dataLayer).includes('private-id'),false);
});
test('approved WhatsApp button UTM normalizes without changing template',()=>{
 assert.deepEqual(sanitizeCampaign({utm_source:'whatsapp',utm_medium:'utility_message',utm_campaign:'updhan_2027',utm_content:'registration_received'}),{utm_source:'whatsapp',utm_medium:'messaging',utm_campaign:'vijaypataka_updhan_2027',utm_content:'registration_received'});
});
