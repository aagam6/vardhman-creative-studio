import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {createStore} from '../store.mjs';
import {createMessageQueue} from '../message-queue.mjs';
const apply=async(pool,file)=>{const sql=readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8').replace(/^--.*$/gm,'');for(const statement of sql.split(';').map(s=>s.trim()).filter(Boolean))await pool.query(statement);};
export async function prepareCurrentSchema(pool){
 await apply(pool,'004_registration_details.sql');
 const [version]=await pool.query('SELECT VERSION() AS version');
 // Upgrade the historical two-person fixture to the currently deployed six-person constraint.
 const [checks]=await pool.query("SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='ayambil_attendees' AND CONSTRAINT_TYPE='CHECK'");
 if(!version[0].version.includes('MariaDB'))for(const row of checks){assert.match(row.CONSTRAINT_NAME,/^[a-zA-Z0-9_]+$/);await pool.query('ALTER TABLE ayambil_attendees DROP '+(version[0].version.includes('MariaDB')?'CONSTRAINT':'CHECK')+' `'+row.CONSTRAINT_NAME+'`');}
 await apply(pool,'006_six_pass_limit.sql');
 const b=randomUUID(),a=randomUUID(),p=randomUUID(),snapshot=JSON.stringify({attendeeName:'મૂળ નામ',number:'AYV26-MIGRATION-PRESERVED',original:true});
 await pool.execute("INSERT INTO ayambil_bookings(id,number,contact_name,mobile,event_date,status,whatsapp_consent,terms_version,terms_accepted_at,created_at) VALUES(?,?,?,?,'2026-11-02','cancelled',TRUE,'synthetic',UTC_TIMESTAMP(3),UTC_TIMESTAMP(3))",[b,'BOOK26-MIGRATION-PRESERVED','Synthetic migration guest','+12025550123']);
 await pool.execute('INSERT INTO ayambil_attendees(id,booking_id,full_name,ordinal) VALUES(?,?,?,1)',[a,b,'મૂળ નામ']);
 await pool.execute("INSERT INTO ayambil_passes(id,attendee_id,number,snapshot,revision,status) VALUES(?,?,?,?,1,'cancelled')",[p,a,'AYV26-MIGRATION-PRESERVED',snapshot]);
 const [before]=await pool.execute('SELECT id,number,snapshot,status,revision FROM ayambil_passes WHERE id=?',[p]);
 await apply(pool,'007_pass_trash.sql');
 const [after]=await pool.execute('SELECT id,number,snapshot,status,revision,trashed_at FROM ayambil_passes WHERE id=?',[p]);
 const {trashed_at,...preserved}=after[0];assert.equal(trashed_at,null);assert.deepEqual(preserved,before[0]);
 const [indexes]=await pool.query('SHOW INDEX FROM ayambil_passes');assert.deepEqual(indexes.filter(i=>i.Key_name==='ayambil_pass_trash').map(i=>i.Column_name),['trashed_at','id']);
 // Remove only these known disposable seed rows; no production connection is permitted by the caller.
 await pool.execute('DELETE FROM ayambil_passes WHERE id=?',[p]);await pool.execute('DELETE FROM ayambil_attendees WHERE id=?',[a]);await pool.execute('DELETE FROM ayambil_bookings WHERE id=?',[b]);
 console.log('Trash migration: populated snapshot/status preserved; nullable field and index verified');
}
export async function checkTrashLifecycle(pool,config,actor){
 let sends=0;
 const env={AYAMBIL_WHATSAPP_ENABLED:'true',AYAMBIL_QUEUE_ENCRYPTION_KEY:'b'.repeat(64),AYAMBIL_SITE_ORIGIN:'https://vardhmancreativestudio.com',AYAMBIL_PRODUCTION_TEMPLATE_POLICY:'ayambil-en-2026-10-13-v1',AYAMBIL_WHATSAPP_NORMAL_PROCESSING_APPROVED:'false',AYAMBIL_WHATSAPP_MANUAL_PROCESSING_APPROVED:'true',AYAMBIL_WHATSAPP_QUEUE_OWNER:'express-mysql',AYAMBIL_WHATSAPP_MANUAL_START_AT:'2000-01-01T00:00:00.000Z'};
 const queue=createMessageQueue(pool,{prepare:async()=>({}),sendPrepared:async()=>({id:'trash-mock-'+(++sends),status:'sent'})},env),store=createStore(pool,config,{queue});
 await pool.query('UPDATE ayambil_settings SET registration_open=TRUE WHERE id=1');
 const input={contactName:'Synthetic Trash Engine Guest',mobile:'+12025550123',eventDate:'2026-11-02',termsAccepted:true,whatsappConsent:true,requestKey:randomUUID().replaceAll('-','').repeat(2),attendees:Array.from({length:6},(_,i)=>({fullName:'Trash Guest '+i,dates:['2026-11-02']}))};
 const receipt=await store.register(input);await store.register(input);
 const current=(await store.list({search:receipt.number})).items[0],id=current.id;
 const jobs=async()=>(await pool.execute('SELECT id,notification_type,status,attempts,provider_id FROM ayambil_message_queue WHERE booking_id=? ORDER BY id',[id]))[0];
 let original=await jobs();assert.equal(original.length,7);assert.equal(original.filter(j=>j.notification_type==='confirmation').length,1);
 const confirmation=original.find(j=>j.notification_type==='confirmation');
 await queue.runSelected({id:confirmation.id,bookingId:id,type:'confirmation'});assert.equal(sends,1);original=await jobs();
 const before=await store.overview();assert.equal((await store.list({message:'pending',search:receipt.number})).items.length,1);
 await store.change(actor,{action:'cancel',bookingId:id});const cancelled=await store.overview();
 assert.equal(cancelled.totals.pendingMessages,before.totals.pendingMessages-6);assert.equal(cancelled.totals.cancelledPasses,before.totals.cancelledPasses+6);assert.equal((await store.list({message:'pending',search:receipt.number})).items.length,0);
 const number=receipt.attendees[0].passes[0].number;
 await store.change(actor,{action:'trash-pass',bookingId:id,passNumber:number});const trashed=await store.overview();
 assert.equal(trashed.totals.trashedPasses,cancelled.totals.trashedPasses+1);assert.equal(trashed.totals.cancelledPasses,cancelled.totals.cancelledPasses-1);
 assert.equal(trashed.evenings[0].trashedPasses,cancelled.evenings[0].trashedPasses+1);assert.equal(trashed.evenings[1].trashedPasses,cancelled.evenings[1].trashedPasses);
 assert.ok((await store.trash({date:'2026-11-02'})).items.some(p=>p.passNumber===number));assert.equal((await store.trash({date:'2026-11-03'})).items.length,0);
 assert.equal((await store.list({status:'cancelled',search:receipt.number})).items.length,1,'Partly trashed booking retains remaining cancelled passes');
 for(const attendee of receipt.attendees.slice(1))await store.change(actor,{action:'trash-pass',bookingId:id,passNumber:attendee.passes[0].number});
 assert.equal((await store.list({status:'cancelled',search:receipt.number})).items.length,0,'Fully trashed booking is absent from Cancelled');
 assert.equal((await store.trash({})).items.filter(p=>p.bookingId===id).length,6);
 for(const attendee of receipt.attendees.slice(1))await store.change(actor,{action:'untrash-pass',bookingId:id,passNumber:attendee.passes[0].number});
 assert.equal((await store.list({status:'cancelled',search:receipt.number})).items.length,1,'Untrash restores Cancelled visibility');
 assert.deepEqual(await jobs(),original);
 await store.change(actor,{action:'restore',bookingId:id});let restored=(await store.list({search:receipt.number})).items[0];assert.equal(restored.attendees[0].passes[0].status,'cancelled');assert.equal((await store.overview()).totals.pendingMessages,before.totals.pendingMessages-1);
 await assert.rejects(store.download(receipt.downloadKeys[0]),e=>e.status===404);
 await store.change(actor,{action:'untrash-pass',bookingId:id,passNumber:number});assert.equal((await store.trash({})).items.length,0);await assert.rejects(store.download(receipt.downloadKeys[0]),e=>e.status===404);
 await store.change(actor,{action:'restore',bookingId:id});await store.download(receipt.downloadKeys[0]);assert.equal((await store.overview()).totals.pendingMessages,before.totals.pendingMessages);
 for(let i=0;i<3;i++){await store.change(actor,{action:'cancel',bookingId:id});await store.change(actor,{action:'restore',bookingId:id});assert.deepEqual(await jobs(),original);}
 await assert.rejects(queue.runSelected({id:confirmation.id,bookingId:id,type:'confirmation'}),e=>e.status===409);assert.equal(sends,1);
 // Individually cancelled original passes must stay out of pending totals after whole-booking restore.
 await store.change(actor,{action:'cancel-pass',bookingId:id,passNumber:number});await store.change(actor,{action:'restore',bookingId:id});assert.equal((await store.overview()).totals.pendingMessages,before.totals.pendingMessages-1);await assert.rejects(store.download(receipt.downloadKeys[0]),e=>e.status===404);
 assert.deepEqual(await jobs(),original);assert.equal(sends,1);
 await pool.query('UPDATE ayambil_settings SET registration_open=FALSE WHERE id=1');
 console.log('Real SQL Trash/pending/restore: counters, filters, revoked links, 7 unchanged jobs, 1 mocked confirmation verified');
}
