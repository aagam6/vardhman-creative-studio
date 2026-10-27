import assert from 'node:assert/strict';
import {startBookingFixture,fixtureInput} from './booking-controls-fixture.mjs';
import {readFile} from 'node:fs/promises';
const f=await startBookingFixture();const {store,pool,actor,config}=f,c=store.bookingControls;let checks=0;
const equal=(a,b)=>{assert.deepEqual(a,b);checks++;};
const control=async(date,mode,capacity)=>{const r=(await c.availability()).find(x=>x.event_date===date);await c.update(actor,{eventDate:date,mode,capacity,version:r.version});};
const review=async(number,purpose='attendance',ids)=>{const bookings=(await c.duplicates()).bookings;const id=bookings.find(b=>b.number===number).id;const r=await c.createReview(actor,{purpose,bookingIds:ids||[id]});return {id,token:(await c.link(actor,r.id)).path.split('#')[1],reviewId:r.id};};
try{
 await control('2026-11-02','open',2000);await control('2026-11-03','waiting',0);
 const old=await store.register(fixtureInput(['Unaffected Guest'],'2026-11-02','+12025550001'));const oldJson=JSON.stringify(await store.download(old.downloadKeys[0]));
 const names=['Guest One','Guest Two','Guest Three','Guest Four','Guest Five','Guest Six'];
 const b=await store.register(fixtureInput(names,'2026-11-02','+12025550002'));const r=await review(b.number);
 const legacyBefore=JSON.stringify((await pool.query('SELECT * FROM ayambil_message_queue ORDER BY id'))[0]);
 config.directFamilyResponses=true;
 await assert.rejects(c.respond(r.token,{attending:'yes',names:[...names,'Guest Seven'],count:7}),e=>e.status===400);checks++;
 await assert.rejects(c.respond(r.token,{attending:'yes',names:['New Name'],count:1}),e=>e.status===400);checks++;
 const input={attending:'yes',names:names.slice(0,5),count:5};const responses=await Promise.all(Array.from({length:6},()=>c.respond(r.token,input)));
 equal(responses.filter(x=>x.bookingChanges>0).length,1);equal(responses.filter(x=>x.bookingChanges===0).length,5);
 equal((await c.family(r.token)).response.count,5);equal((await c.family(r.token)).closed,true);
 for(let i=0;i<5;i++)equal((await store.download(b.downloadKeys[i])).passes[0].attendeeName,names[i]);
 await assert.rejects(store.download(b.downloadKeys[5]),e=>e.status===404);checks++;
 equal((await store.list({search:b.number,status:'active'})).items[0].attendees.filter(a=>a.status==='active').length,5);
 const no=await store.register(fixtureInput(['No Guest'],'2026-11-02','+12025550003'));const nr=await review(no.number);await c.respond(nr.token,{attending:'no',names:[],count:0});
 equal((await store.list({search:no.number,status:'cancelled'})).items.length,1);await assert.rejects(store.download(no.downloadKeys[0]),e=>e.status===404);checks++;
 const d1=await store.register(fixtureInput(['Family One','Family Two'],'2026-11-02','+12025550004')),d2=await store.register(fixtureInput(['Family One','Family Two','Family Three'],'2026-11-02','+12025550004'));
 const ds=(await c.duplicates()).bookings.filter(b=>[d1.number,d2.number].includes(b.number));const dr=await review(d2.number,'duplicate',ds.map(b=>b.id));
 await c.respond(dr.token,{attending:'yes',names:['Family One','Family Two'],count:2,finalBookingId:dr.id});
 equal((await store.list({search:d1.number,status:'cancelled'})).items.length,1);equal((await store.download(d2.downloadKeys[0])).passes.length,1);await assert.rejects(store.download(d2.downloadKeys[2]),e=>e.status===404);checks++;
 const w=await store.register(fixtureInput(['Waiting Guest'],'2026-11-03','+12025550005'));const mixed=await store.list({});equal(mixed.items.some(b=>b.number===w.number&&b.status==='waiting'),true);equal((await store.list({status:'waiting',search:'Waiting Guest'})).items.length,1);equal((await store.list({status:'active'})).items.some(b=>b.status==='waiting'),false);equal((await store.overview()).totals.waitingForms,1);
 // Exercise new outbox display/filter against real schema, without any provider or owner activation.
 const sql=(await readFile(new URL('../apps/api/migrations/012_notification_sender.sql',import.meta.url),'utf8')).replace(/^--.*$/gm,'');for(const statement of sql.split(';').map(x=>x.trim()).filter(Boolean))await pool.query(statement);
 config.notificationService=true;const wid=(await c.waiting()).find(x=>x.number===w.number).id;
 await pool.execute("INSERT INTO ayambil_notification_outbox(id,dedupe_hash,revision_hash,purpose,subject,round_name,envelope,state,created_at,updated_at) VALUES(UUID(),REPEAT('a',64),REPEAT('b',64),'waiting_received',?,'initial','synthetic','held',UTC_TIMESTAMP(3),UTC_TIMESTAMP(3))",[wid]);
 equal((await store.list({status:'waiting',message:'pending'})).items[0].whatsapp.history[0].type,'waiting_received');equal((await store.list({status:'waiting',message:'failed'})).items.length,0);equal((await store.list({status:'waiting',message:'pending',messageType:'waiting_received'})).items.length,1);equal((await store.list({status:'waiting',messageType:'confirmation'})).items.length,0);equal((await store.overview()).totals.pendingNotifications,1);await assert.rejects(store.list({messageType:'sql-invalid'}),e=>e.status===400);checks++;
 equal(JSON.stringify(await store.download(old.downloadKeys[0])),oldJson);
 // Registration itself creates fixture legacy jobs; direct responses create none and never modify prior rows.
 const beforeRows=JSON.parse(legacyBefore),afterRows=(await pool.query('SELECT * FROM ayambil_message_queue ORDER BY id'))[0];for(const row of beforeRows)equal(JSON.stringify(afterRows.find(r=>r.id===row.id)),JSON.stringify(row));
 // Imported live tables can retain a different default collation from additive tables.
 await pool.query('ALTER TABLE ayambil_waiting MODIFY id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL, MODIFY number VARCHAR(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL');
 equal((await store.list({})).items.some(b=>b.status==='waiting'),true);
 equal((await store.list({status:'waiting',search:'Waiting Guest',date:'2026-11-03'})).items.length,1);
 equal((await store.list({message:'pending',messageType:'waiting_received'})).items.length,1);
 equal(f.telemetry.providerCalls,0);console.log(JSON.stringify({checks,providerCalls:0,scope:'fresh disposable MySQL only'}));
}finally{await f.close();}
