import {randomUUID} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {programme} from './config.mjs';
import {passwordHash,passwordMatches} from './security.mjs';
export function validateInitialProgramme(value) {
 if(!value || value.eventName!==programme.eventName || !Array.isArray(value.sessions) || value.sessions.length!==2 || !isDeepStrictEqual(value.sessions,programme.sessions))throw Error('Complete reviewed programme snapshots required');
 for(const session of value.sessions)for(const key of ['date','label','time','performer','programme','venue','address','mapsUrl'])if(typeof session[key]!=='string'||!session[key].trim())throw Error('Invalid programme field');
 const expected=[['2026-11-02','Manan Sanghvi'],['2026-11-03','Sairam Dave']];
 for(const [index,session] of value.sessions.entries()) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(session.date)||!Number.isFinite(Date.parse(session.date))||new Date(session.date).toISOString().slice(0,10)!==session.date||session.date!==expected[index][0]||session.performer!==expected[index][1]||session.time!=='8:00 PM IST')throw Error('Invalid two-evening association');
 }
}
export async function provisionInitialAdmin(db,{approved,email,password,initialProgramme,hostingerOneTime=false}) {
 if(approved!==true)throw Error('Explicit bootstrap approval required');
 validateInitialProgramme(initialProgramme);
 if(typeof email!=='string'||email.trim().length>254||!/^\S+@\S+\.\S+$/.test(email.trim()))throw Error('Valid admin email required');
 const encoded=await passwordHash(password);
 await db.beginTransaction();
 try {
  const [versions]=await db.query('SELECT version FROM ayambil_schema_version');
  const numbers=versions.map(v=>v.version).sort();
  if(JSON.stringify(numbers)!=='[1]'&&JSON.stringify(numbers)!=='[1,2]')throw Error('Reviewed schema version 1 required');
  const [tables]=await db.query("SELECT TABLE_NAME,ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND LEFT(TABLE_NAME,8)='ayambil_'");
  if(tables.length!==(numbers.length===2?15:14)||tables.some(t=>t.ENGINE!=='InnoDB'))throw Error('Complete transactional schema required');
  if(hostingerOneTime){
   const expected=['admins','admin_sessions','attendees','audit','bookings','capabilities','events','idempotency','message_queue','passes','rate_limits','registrations','schema_version','settings','whatsapp_attempts'].map(n=>'ayambil_'+n).sort();
   if(JSON.stringify(numbers)!=='[1,2]'||JSON.stringify(tables.map(t=>t.TABLE_NAME).sort())!==JSON.stringify(expected))throw Error('Complete reviewed schema versions required');
  }
  // Serialize competing first-admin attempts using the existing singleton row.
  const [settings]=await db.query('SELECT registration_open FROM ayambil_settings WHERE id=1 FOR UPDATE');
  if(settings.length!==1||Number(settings[0].registration_open)!==0)throw Error('Registration must remain closed');
  if(hostingerOneTime){
   const [existingAdmins]=await db.query('SELECT email,password_hash,enabled FROM ayambil_admins FOR UPDATE');
   const [existingEvents]=await db.query('SELECT event_date,snapshot FROM ayambil_events ORDER BY event_date');
   if(existingAdmins.length||existingEvents.length){
    const matching=existingAdmins.length===1&&existingAdmins[0].email===email.trim().toLowerCase()&&Number(existingAdmins[0].enabled)===1&&existingEvents.length===2&&existingEvents.every((row,index)=>row.event_date===initialProgramme.sessions[index].date&&isDeepStrictEqual(typeof row.snapshot==='string'?JSON.parse(row.snapshot):row.snapshot,initialProgramme.sessions[index]));
    if(!matching||!await passwordMatches(password,existingAdmins[0].password_hash))throw Error('Unexpected initialization state');
    await db.commit();return {initialized:false};
   }
   for(const name of ['bookings','attendees','passes','capabilities','registrations','idempotency','audit','admin_sessions','rate_limits','whatsapp_attempts','message_queue']){
    const [rows]=await db.query('SELECT COUNT(*) AS count FROM ayambil_'+name);
    if(Number(rows[0].count)!==0)throw Error('Unexpected existing business records');
   }
  }
  const [admins]=await db.query('SELECT id FROM ayambil_admins LIMIT 1 FOR UPDATE');
  if(admins.length)throw Error('First administrator already exists');
  const [events]=await db.query('SELECT event_date FROM ayambil_events');
  if(events.length)throw Error('Initial event configuration already exists');
  for(const session of initialProgramme.sessions)await db.execute('INSERT INTO ayambil_events(event_date,snapshot) VALUES(?,?)',[session.date,JSON.stringify(session)]);
  await db.execute('INSERT INTO ayambil_admins(id,email,password_hash,enabled) VALUES(?,?,?,TRUE)',[randomUUID(),email.trim().toLowerCase(),encoded]);
  await db.commit();
  return {initialized:true};
 }catch(error){await db.rollback();throw error;}
}
