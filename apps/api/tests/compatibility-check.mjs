import assert from 'node:assert/strict';
import {hash} from '../security.mjs';
export async function checkCompatibility(pool,store,input,receipt){
 const key='AbZ9'.repeat(16);
 const [caps]=await pool.execute('SELECT pass_id FROM ayambil_capabilities WHERE key_hash=?',[hash(receipt.downloadKeys[0])]);
 await pool.execute('UPDATE ayambil_capabilities SET key_hash=? WHERE pass_id=?',[hash(key),caps[0].pass_id]);
 assert.equal((await store.download(key)).passes[0].attendeeName,'Synthetic Attendee 0');
 for(const invalid of [key.toLowerCase(),key.slice(1),key+'A','-'.repeat(64)])await assert.rejects(store.download(invalid),e=>e.status===404);
 await pool.execute('UPDATE ayambil_capabilities SET revoked_at=UTC_TIMESTAMP(3) WHERE key_hash=?',[hash(key)]);
 await assert.rejects(store.download(key),e=>e.status===404);
 await pool.execute('UPDATE ayambil_capabilities SET key_hash=?,revoked_at=NULL WHERE pass_id=?',[hash(receipt.downloadKeys[0]),caps[0].pass_id]);
 const equivalent={...input,contactName:'  '+input.contactName+'  ',mobile:'+1 (202) 555-0123',attendees:input.attendees.map(a=>({...a,fullName:' '+a.fullName+' '}))};
 assert.equal((await store.register(equivalent)).number,receipt.number);
 const [records]=await pool.query('SELECT whatsapp_consent,terms_version,terms_accepted_at FROM ayambil_bookings');
 assert.equal(records.length,1);assert.equal(Number(records[0].whatsapp_consent),1);assert.equal(records[0].terms_version,'2026-10-10');assert.ok(records[0].terms_accepted_at);
}

export async function checkParallelLists(store,input){
 for(let i=0;i<55;i++)await store.register({...input,contactName:'Synthetic Pagination '+i,requestKey:hash('disposable pagination '+i)});
 const lists=await Promise.all([store.list({page:1}),store.list({page:1})]);
 for(const list of lists){assert.equal(list.items.length,50);assert.equal(list.hasMore,true);}
 assert.deepEqual(lists[0].items.map(b=>b.id),lists[1].items.map(b=>b.id));
}
