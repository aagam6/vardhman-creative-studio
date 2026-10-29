// Disposable MySQL only; no .env or provider network.
import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {startBookingFixture,fixtureInput} from './booking-controls-fixture.mjs';
import {loadAttendanceEligibility} from '../apps/api/attendance-eligibility.mjs';
import {createProductionNotificationSender} from '../apps/api/notification-sender.mjs';
import {bilingualCatalog} from '../apps/api/bilingual-template-adapter.mjs';
import {selectEntryRuntimeCatalog} from '../apps/api/entry-runtime-revision.mjs';
import {entryRevisionPolicy} from '../apps/api/entry-timing-revision-policy.mjs';
const f=await startBookingFixture();let checks=0;
const check=(actual,expected)=>{assert.deepEqual(actual,expected);checks++;};
try{
 for(const statement of (await readFile('apps/api/migrations/012_notification_sender.sql','utf8')).replace(/^--.*$/gm,'').split(';').map(s=>s.trim()).filter(Boolean))await f.pool.query(statement);
 await f.store.bookingControls.update(f.actor,{eventDate:'2026-11-02',mode:'open',capacity:20,version:1});
 const mobile='+12025550123';const r=await f.store.register(fixtureInput(['Synthetic Person'],'2026-11-02',mobile));
 const [[b]]=await f.pool.execute('SELECT id FROM ayambil_bookings WHERE number=?',[r.number]);
 let e=await loadAttendanceEligibility(f.pool,{eventDate:'2026-11-02',mobile});check(e.reasons.includes('attendance_delay_not_due'),true);
 await f.pool.execute('UPDATE ayambil_bookings SET created_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 3 DAY) WHERE id=?',[b.id]);
 e=await loadAttendanceEligibility(f.pool,{eventDate:'2026-11-02',mobile});check(e.eligible,true);
 const [before]=await f.pool.query('SELECT id,status FROM ayambil_passes ORDER BY id');
 const duplicate=await f.store.register(fixtureInput(['Synthetic Person'],'2026-11-02',mobile));
 const [[d]]=await f.pool.execute('SELECT id FROM ayambil_bookings WHERE number=?',[duplicate.number]);
 const review=await f.store.bookingControls.createReview(f.actor,{purpose:'duplicate',bookingIds:[b.id,d.id]});
 e=await loadAttendanceEligibility(f.pool,{eventDate:'2026-11-02',mobile});check(e.reasons.includes('unresolved_duplicate_review'),true);
 // Simulate organiser cancellation in disposable data, not production.
 await f.pool.execute("UPDATE ayambil_bookings SET status='cancelled' WHERE id=?",[d.id]);
 e=await loadAttendanceEligibility(f.pool,{eventDate:'2026-11-02',mobile});check(e.reasons.includes('unresolved_duplicate_review'),false);
 const dashboard=await f.store.bookingControls.dashboard({view:'duplicates'});check(dashboard.kpis.totals.potentialDuplicateGroups,0);check(dashboard.reviews.length,0);
 const [[history]]=await f.pool.execute('SELECT COUNT(*) n FROM ayambil_family_reviews WHERE id=?',[review.id]);check(history.n,1);
 const [after]=await f.pool.query('SELECT id,status FROM ayambil_passes WHERE id IN ('+before.map(()=>'?').join(',')+') ORDER BY id',before.map(p=>p.id));check(after,before);
 const oldCatalog=structuredClone(bilingualCatalog);for(const t of oldCatalog)t.approvalEvidence.observedAt=new Date().toISOString();
 let clock=new Date('2026-11-01T12:30:00Z');const config={...f.config,notificationService:true,notificationDispatch:false};
 const provider={validate:async()=>{},submit:async()=>{throw Error('No sends in this test');}};
 const oldSender=createProductionNotificationSender({pool:f.pool,config,key:f.fixtureQueueKey,catalog:oldCatalog,provider,now:()=>clock});
 const draft=await oldSender.enqueue({purpose:'entry_timing',subject:b.id,round:'gate-time-v1'});
 const [draftBefore]=await f.pool.query('SELECT * FROM ayambil_notification_outbox WHERE id=?',[draft]);
 const v2=selectEntryRuntimeCatalog(oldCatalog,{AYAMBIL_ENTRY_REVISION_POLICY:entryRevisionPolicy.version,AYAMBIL_ENTRY_REVISION_SHA256:entryRevisionPolicy.definitionHash});for(const t of v2)t.approvalEvidence={verified:true,templateId:t.templateId,status:'APPROVED',category:'UTILITY',observedAt:new Date().toISOString()};
 clock=new Date('2026-10-29T10:00:00Z');const revised=createProductionNotificationSender({pool:f.pool,config,key:f.fixtureQueueKey,catalog:v2,provider,now:()=>clock});
 const preview=await revised.previewEntryRevision([draft]);check(preview.writes,0);check(preview.sendAllowed,false);check(preview.items[0].compatible,true);check(preview.items[0].requiresRefresh,true);
 check((await f.pool.query('SELECT * FROM ayambil_notification_outbox WHERE id=?',[draft]))[0],draftBefore);
 const refreshed=await revised.refreshEntryRevision([draft],f.actor);check(refreshed.sent,false);check(refreshed.items[0].changed,true);
 const [[updated]]=await f.pool.query('SELECT * FROM ayambil_notification_outbox WHERE id=?',[draft]);check(updated.attempts,0);check(updated.provider_id,null);check(updated.claim_id,null);check(updated.state,'held');check(updated.envelope,draftBefore[0].envelope);check(updated.round_name,draftBefore[0].round_name);check(updated.created_at,draftBefore[0].created_at);
 check((await revised.refreshEntryRevision([draft],f.actor)).items[0].changed,false);
 const [preserved]=await f.pool.query('SELECT id,status FROM ayambil_passes WHERE id IN ('+before.map(()=>'?').join(',')+') ORDER BY id',before.map(p=>p.id));check(preserved,before);
 check(f.telemetry.providerCalls,0);console.log(JSON.stringify({checks,providerCalls:0,liveAccess:false}));
}finally{await f.close();}
