import {randomUUID} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {programme} from './config.mjs';
import {passwordHash} from './security.mjs';
export function validateInitialProgramme(value) {
 if(!value || value.eventName!==programme.eventName || !Array.isArray(value.sessions) || value.sessions.length!==2 || !isDeepStrictEqual(value.sessions,programme.sessions))throw Error('Complete reviewed programme snapshots required');
 for(const session of value.sessions)for(const key of ['date','label','time','performer','programme','venue','address','mapsUrl'])if(typeof session[key]!=='string'||!session[key].trim())throw Error('Invalid programme field');
 const expected=[['2026-11-02','Manan Sanghvi'],['2026-11-03','Sairam Dave']];
 for(const [index,session] of value.sessions.entries()) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(session.date)||!Number.isFinite(Date.parse(session.date))||new Date(session.date).toISOString().slice(0,10)!==session.date||session.date!==expected[index][0]||session.performer!==expected[index][1]||session.time!=='8:00 PM IST')throw Error('Invalid two-evening association');
 }
}
export async function provisionInitialAdmin(db,{approved,email,password,initialProgramme}) {
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
  // Serialize competing first-admin attempts using the existing singleton row.
  const [settings]=await db.query('SELECT registration_open FROM ayambil_settings WHERE id=1 FOR UPDATE');
  if(settings.length!==1||Number(settings[0].registration_open)!==0)throw Error('Registration must remain closed');
  const [admins]=await db.query('SELECT id FROM ayambil_admins LIMIT 1 FOR UPDATE');
  if(admins.length)throw Error('First administrator already exists');
  const [events]=await db.query('SELECT event_date FROM ayambil_events');
  if(events.length)throw Error('Initial event configuration already exists');
  for(const session of initialProgramme.sessions)await db.execute('INSERT INTO ayambil_events(event_date,snapshot) VALUES(?,?)',[session.date,JSON.stringify(session)]);
  await db.execute('INSERT INTO ayambil_admins(id,email,password_hash,enabled) VALUES(?,?,?,TRUE)',[randomUUID(),email.trim().toLowerCase(),encoded]);
  await db.commit();
 }catch(error){await db.rollback();throw error;}
}
