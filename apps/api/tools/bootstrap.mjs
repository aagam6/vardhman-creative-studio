// Explicit operator-only procedure. Never run against live DB without approval.
// Reads admin password through stdin (use a secure local prompt/provider).
import mysql from 'mysql2/promise';
import {randomUUID} from 'node:crypto';
import {configuration,programme} from '../config.mjs';
import {passwordHash} from '../security.mjs';
if(process.env.AYAMBIL_BOOTSTRAP_APPROVED!=='true')throw new Error('Explicit bootstrap approval required');
const config=configuration(process.env);
const email=process.env.AYAMBIL_INITIAL_ADMIN_EMAIL;
if(!email||!/^\S+@\S+\.\S+$/.test(email))throw new Error('Admin email required');
let password='';for await(const chunk of process.stdin){password+=chunk;if(password.length>300)throw new Error('Input too large');}
const encoded=await passwordHash(password.replace(/\r?\n$/,''));password='';
const {connectionLimit,waitForConnections,queueLimit,...connection}=config.database;
const db=await mysql.createConnection(connection);
try {
 await db.beginTransaction();
 const [existing]=await db.execute('SELECT id FROM ayambil_admins LIMIT 1');if(existing.length)throw new Error('First administrator already exists');
 for(const session of programme.sessions)await db.execute('INSERT INTO ayambil_events(event_date,snapshot) VALUES(?,?)',[session.date,JSON.stringify(session)]);
 await db.execute('INSERT INTO ayambil_admins(id,email,password_hash,enabled) VALUES(?,?,?,TRUE)',[randomUUID(),email.trim().toLowerCase(),encoded]);
 await db.commit();console.log('Reviewed event snapshots and first administrator provisioned. Registration remains closed.');
}catch{await db.rollback();console.error('Bootstrap failed; no changes committed.');process.exitCode=1;}finally{await db.end();}

