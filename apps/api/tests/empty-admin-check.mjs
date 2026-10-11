import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {passwordHash} from '../security.mjs';
import {createApp} from '../app.mjs';
export async function checkEmptyAdmin(pool,store,config){
 const email='empty-list@example.invalid',password='Synthetic empty list password 123!';
 await pool.execute('INSERT INTO ayambil_admins VALUES(?,?,?,TRUE)',[randomUUID(),email,await passwordHash(password)]);
 const session=await store.login(email,password);
 const server=createApp({store,config,staticDirectory:'.'}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 try{const res=await fetch(`http://127.0.0.1:${server.address().port}/api/ayambil/admin/bookings`,{headers:{cookie:'__Host-ayambil='+session.token}});assert.equal(res.status,200);assert.equal(res.headers.get('cache-control'),'no-store');assert.deepEqual(await res.json(),{items:[],page:1,hasMore:false,integration:{ready:false,missing:['WhatsApp sending disabled']}});}
 finally{await new Promise(r=>server.close(r));await store.logout(session.token);await pool.execute('DELETE FROM ayambil_admins WHERE email=?',[email]);}
}
