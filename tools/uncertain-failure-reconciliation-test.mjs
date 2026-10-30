// Disposable loopback MySQL only; provider methods are in-memory mocks.
import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {randomUUID} from 'node:crypto';
import {startBookingFixture,fixtureInput} from './booking-controls-fixture.mjs';
import {createProductionNotificationSender} from '../apps/api/notification-sender.mjs';import {bilingualCatalog} from '../apps/api/bilingual-template-adapter.mjs';
const f=await startBookingFixture();let calls=0,checks=0,receipts=[],status='failed';const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
try{
 for(const s of (await readFile('apps/api/migrations/012_notification_sender.sql','utf8')).replace(/^--.*$/gm,'').split(';').map(s=>s.trim()).filter(Boolean))await f.pool.query(s);
 const setting=(await f.store.bookingControls.availability())[0];await f.store.bookingControls.update(f.actor,{eventDate:setting.event_date,mode:'open',capacity:100,version:setting.version});
 const saved=await f.store.register(fixtureInput(['Synthetic failed receipt guest']));await f.pool.query("UPDATE ayambil_bookings SET created_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 3 DAY)");const [[b]]=await f.pool.execute('SELECT id FROM ayambil_bookings WHERE number=?',[saved.number]);
 const catalog=structuredClone(bilingualCatalog);for(const t of catalog)t.approvalEvidence={verified:true,templateId:t.templateId,status:'APPROVED',category:'UTILITY',observedAt:new Date().toISOString()};
 const sender=createProductionNotificationSender({pool:f.pool,config:{...f.config,notificationService:true,notificationDispatch:true},key:f.fixtureQueueKey,catalog,provider:{async validate(){},async submit(){calls++;throw Error('Unknown acceptance');},async recipientReceipts(){return receipts;},async status(){return{status};}}});
 const p=await sender.prepareSubject({purpose:'attendance',subject:b.id},f.actor,f.store.bookingControls);await sender.handover({owner:'bilingual',version:1},f.actor);eq((await sender.runOne(p.id,{ownershipVersion:2})).status,'uncertain');eq(calls,1);await sender.handover({owner:'paused',version:2},f.actor);
 const [[before]]=await f.pool.execute('SELECT * FROM ayambil_notification_outbox WHERE id=?',[p.id]);const passes=(await f.pool.query('SELECT * FROM ayambil_passes ORDER BY id'))[0];
 const [[claim]]=await f.pool.execute("SELECT created_at FROM ayambil_notification_audit WHERE action='claim_committed'");const time=new Date(Date.parse(claim.created_at+'Z')+100).toISOString();
 const exact={id:randomUUID(),template:'ayambil_attendance_bilingual',status:'failed',createdAt:time};
 for(const history of [[],[exact,{...exact,id:randomUUID()}],[{...exact,template:'other'}],[{...exact,status:'sent'}],[{...exact,createdAt:'invalid'}],[{...exact,createdAt:new Date(Date.parse(time)+60000).toISOString()}]]){receipts=history;await assert.rejects(sender.reconcileUncertainFailure(p.id,f.actor));checks++;}
 receipts=[exact];status='sent';await assert.rejects(sender.reconcileUncertainFailure(p.id,f.actor));checks++;status='failed';
 const r=await sender.reconcileUncertainFailure(p.id,f.actor);eq(r.sent,false);eq(r.providerSubmissions,0);eq(r.state,'failed');eq(calls,1);
 const [[after]]=await f.pool.execute('SELECT * FROM ayambil_notification_outbox WHERE id=?',[p.id]);for(const k of ['id','subject','round_name','dedupe_hash','revision_hash','envelope','attempts','claim_id'])eq(after[k],before[k]);eq(after.provider_id,exact.id);eq(after.state,'failed');
 eq(await sender.owner(),{owner:'paused',version:3});eq((await f.pool.query('SELECT * FROM ayambil_passes ORDER BY id'))[0],passes);await assert.rejects(sender.reconcileUncertainFailure(p.id,f.actor));checks++;eq(calls,1);
 console.log(JSON.stringify({checks,mockSubmitCalls:calls,reconciliationSubmissions:0,realProviderCalls:0,ownerUnchanged:true,passesUnchanged:true}));
}finally{await f.close();}
