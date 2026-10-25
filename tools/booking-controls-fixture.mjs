// Synthetic-only bootstrap. Never reads process.env or .env files.
import {readFile} from 'node:fs/promises';
import {randomUUID,randomBytes} from 'node:crypto';
import {startDisposableMysql} from './ayambil-disposable-mysql.mjs';
import {createStore} from '../apps/api/store.mjs';
import {programme} from '../apps/api/config.mjs';
import {passwordHash,hash} from '../apps/api/security.mjs';
import {createMessageQueue} from '../apps/api/message-queue.mjs';
export const fixtureInput=(names=['સ્થાનિક પરીક્ષણ એક'],date='2026-11-02',mobile='+12025550123')=>({contactName:names[0],mobile,eventDate:date,attendees:names.map(fullName=>({fullName,dates:[date]})),termsAccepted:true,whatsappConsent:true,requestKey:randomBytes(32).toString('hex')});
export async function startBookingFixture(port=3136){
 const engine=await startDisposableMysql();
 const pool=engine.pool;
 try{
  for(const file of ['001_ayambil.sql','002_whatsapp_queue.sql','004_registration_details.sql','006_six_pass_limit.sql','007_pass_trash.sql','008_trash_backup_maintenance.sql']){
   if(file==='006_six_pass_limit.sql'){
    const [checks]=await pool.query("SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='ayambil_attendees' AND CONSTRAINT_TYPE='CHECK'");
    for(const c of checks){if(!/^[a-zA-Z0-9_]+$/.test(c.CONSTRAINT_NAME))throw Error('Invalid constraint');await pool.query('ALTER TABLE ayambil_attendees DROP CHECK `'+c.CONSTRAINT_NAME+'`');}
   }
   const sql=(await readFile(new URL('../apps/api/migrations/'+file,import.meta.url),'utf8')).replace(/^--.*$/gm,'');for(const statement of sql.split(';').map(x=>x.trim()).filter(Boolean))await pool.query(statement);
  }
  for(const s of programme.sessions)await pool.execute('INSERT INTO ayambil_events VALUES(?,?)',[s.date,JSON.stringify(s)]);
  await pool.query('UPDATE ayambil_settings SET registration_open=TRUE WHERE id=1');
  const sql=(await readFile(new URL('../apps/api/migrations/009_booking_controls_reviews.sql',import.meta.url),'utf8')).replace(/^--.*$/gm,'');for(const statement of sql.split(';').map(x=>x.trim()).filter(Boolean))await pool.query(statement);
  const rounds=(await readFile(new URL('../apps/api/migrations/010_review_round_dedup.sql',import.meta.url),'utf8')).replace(/^--.*$/gm,'');for(const statement of rounds.split(';').map(x=>x.trim()).filter(Boolean))await pool.query(statement);
  const productionSql=(await readFile(new URL('../apps/api/migrations/011_booking_controls_production.sql',import.meta.url),'utf8')).replace(/^--.*$/gm,'');for(const statement of productionSql.split(';').map(x=>x.trim()).filter(Boolean))await pool.query(statement);await pool.query('UPDATE ayambil_booking_controls_release SET enabled=TRUE WHERE id=1');
  const config={database:{host:'127.0.0.1',database:engine.databaseName},origin:`http://127.0.0.1:${port}`,registrationOpen:true,maintenanceSchemaEnabled:true,whatsappEnabled:false,disposable:true,bookingControls:true,rateSecret:randomBytes(32).toString('hex')};
  // Use actual queue serialization/dedupe for fixtures, but provide no provider client or worker.
  const fixtureQueueKey=randomBytes(32).toString('hex');
  const telemetry={providerCalls:0};
  const queue=createMessageQueue(pool,{prepare(){telemetry.providerCalls++;throw Error('Messaging disabled in local fixture');},sendPrepared(){telemetry.providerCalls++;throw Error('Messaging disabled in local fixture');}},{AYAMBIL_WHATSAPP_ENABLED:'true',AYAMBIL_QUEUE_ENCRYPTION_KEY:fixtureQueueKey,AYAMBIL_SITE_ORIGIN:config.origin});
  const store=createStore(pool,config,{queue});const actor={admin_id:randomUUID()};
  await pool.execute('INSERT INTO ayambil_admins VALUES(?,?,?,TRUE)',[actor.admin_id,'fixture@example.invalid',await passwordHash(randomBytes(32).toString('hex'))]);
  const token=randomBytes(32).toString('hex'),csrf=hash('ayambil-session-csrf:'+token);
  await pool.execute('INSERT INTO ayambil_admin_sessions VALUES(?,?,?,DATE_ADD(UTC_TIMESTAMP(3),INTERVAL 8 HOUR))',[hash(token),actor.admin_id,hash(csrf)]);
  return {...engine,config,store,actor,queue,fixtureQueueKey,telemetry,session:{token,csrf}};
 }catch(e){await engine.close();throw e;}
}
