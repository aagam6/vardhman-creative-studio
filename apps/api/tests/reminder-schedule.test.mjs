import test from 'node:test';
import assert from 'node:assert/strict';
import {dueReminderSession,startReminderScheduler} from '../reminder-schedule.mjs';
import {createMessageQueue} from '../message-queue.mjs';
const env={AYAMBIL_WHATSAPP_ENABLED:'true',AYAMBIL_QUEUE_ENCRYPTION_KEY:'a'.repeat(64),AYAMBIL_WHATSAPP_QUEUE_OWNER:'express-mysql',AYAMBIL_WHATSAPP_REMINDER_SCHEDULER_ENABLED:'true',AYAMBIL_SITE_ORIGIN:'https://vardhmancreativestudio.com',AYAMBIL_PRODUCTION_TEMPLATE_POLICY:'ayambil-en-2026-10-13-v1'};
test('Manan stays 18:00; Sairam moves to 16:00 IST, never early or next day',()=>{
 for(const [at,date] of [['2026-10-18T18:00:00+05:30',null],['2026-11-01T16:00:00+05:30',null],['2026-11-01T17:59:59+05:30',null],['2026-11-01T18:00:00+05:30','2026-11-02'],['2026-11-01T23:59:59+05:30','2026-11-02'],['2026-11-02T00:00:00+05:30',null],['2026-11-02T15:59:59.999+05:30',null],['2026-11-02T16:00:00+05:30','2026-11-03'],['2026-11-02T18:00:00+05:30','2026-11-03'],['2026-11-02T23:59:59+05:30','2026-11-03'],['2026-11-03T00:00:00+05:30',null]])assert.equal(dueReminderSession(new Date(at))?.date||null,date);
});
test('defaults off; no startup/early sends; fail/uncertain pauses; serialized ticks',async()=>{
 let tick,sends=0,stops=0,release;let at=new Date('2026-10-18');
 const q={runScheduledReminder:async()=>{sends++;await new Promise(r=>release=r);return {status:'uncertain'};}};
 assert.equal(startReminderScheduler(q,{}).enabled,false);
 startReminderScheduler(q,env,{schedule:cb=>{tick=cb;return 1;},cancel:()=>stops++,now:()=>at});
 assert.equal(sends,0);await tick();assert.equal(sends,0);at=new Date('2026-11-01T18:00:00+05:30');const first=tick();await tick();assert.equal(sends,1);release();await first;await tick();assert.equal(sends,1);assert.equal(stops,1);
});
function fixture({valid=true,prior=false,uncertain=false}={}){
 let job=prior?{id:'prior',notification_type:'reminder',status:'sent',attempts:1,provider_id:'provider'}:null;let sends=0;let locked=false;const writes=[];
 const execute=async(sql,args=[])=>{
  if(sql.startsWith('SELECT b.id,b.contact_name')){assert.match(sql,/whatsapp_consent=TRUE/);assert.match(sql,/p.trashed_at IS NULL/);assert.match(sql,/FOR UPDATE/);locked=true;return [[...(!valid||job?.attempts>0?[]:[{id:'booking',contact_name:'Synthetic family',mobile:'+12025550123'}])]];}
  if(sql.startsWith('SELECT id,status,attempts,provider_id'))return [[...(job?[job]:[])]];
  if(sql.startsWith('SELECT id FROM ayambil_message_queue'))return [[]];
  if(sql.startsWith('SELECT contact_name'))return [[{contact_name:'Synthetic family',mobile:'+12025550123',event_date:'2026-11-02'}]];
  if(sql.startsWith('SELECT status,whatsapp_consent'))return [[{status:'active',whatsapp_consent:1,mobile:'+12025550123',event_date:'2026-11-02'}]];
  if(sql.startsWith('SELECT p.id'))return [[...(valid?[{id:'pass'}]:[])]];
  writes.push(sql);
  if(sql.startsWith('INSERT INTO ayambil_message_queue')){assert.equal(locked,true);job={id:args[0],booking_id:'booking',notification_type:'reminder',status:'queued',attempts:0};}
  if(sql.includes("status='preparing'")){job.status='preparing';job.attempts++;}
  if(sql.startsWith('UPDATE ayambil_message_queue SET status=?')){job.status=args[0];}
  return [[]];
 };
 const db={execute,beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release(){}};
 const q=createMessageQueue({execute,getConnection:async()=>db},{prepare:async(type,context)=>{assert.equal(type,'reminder');assert.equal(context.attendeeName,'Synthetic family');return {};},sendPrepared:async()=>{sends++;if(uncertain)throw Error('timeout');return {status:'sent',id:'provider'};}},env,{now:()=>new Date('2026-11-01T18:00:00+05:30')});
 return {q,writes,get sends(){return sends;}};
}
test('one booking-level reminder across repeated ticks/restarts, no booking/pass writes',async()=>{
 const f=fixture();assert.equal((await f.q.runScheduledReminder()).status,'sent');assert.equal((await f.q.runScheduledReminder()).processed,false);assert.equal(f.sends,1);assert.ok(f.writes.every(sql=>!/(UPDATE|INSERT INTO|DELETE FROM) ayambil_(bookings|passes|attendees|capabilities)/.test(sql)));
});
test('previously attempted, inactive/invalid bookings and uncertain submissions are never retried',async()=>{
 for(const options of [{prior:true},{valid:false}]){const f=fixture(options);assert.equal((await f.q.runScheduledReminder()).processed,false);assert.equal(f.sends,0);}
 const f=fixture({uncertain:true});assert.equal((await f.q.runScheduledReminder()).status,'uncertain');await f.q.runScheduledReminder();assert.equal(f.sends,1);
});
test('outside schedule no database or provider access even when reminder scheduler enabled',async()=>{
 let touched=0;const q=createMessageQueue({getConnection:async()=>touched++},{},env,{now:()=>new Date('2026-10-18')});assert.equal((await q.runScheduledReminder()).processed,false);assert.equal(touched,0);
});
