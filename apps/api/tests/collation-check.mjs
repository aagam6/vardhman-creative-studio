import assert from 'node:assert/strict';
import {createStore} from '../store.mjs';

// Called only inside independently guarded disposable engine suites.
export async function checkSearchCollations(pool,config,booking){
 await pool.query('ALTER TABLE ayambil_bookings MODIFY contact_name VARCHAR(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL, MODIFY mobile VARCHAR(20) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL');
 await pool.query('ALTER TABLE ayambil_attendees MODIFY full_name VARCHAR(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL');
 const db=await pool.getConnection();
 try{
  const store=createStore(db,config);
  for(const connection of ['utf8mb4 COLLATE utf8mb4_general_ci','latin1 COLLATE latin1_swedish_ci']){
   await db.query('SET NAMES '+connection); // Fixed test literals only.
   for(const search of ['',booking.number.toLowerCase(),booking.contactName.toLowerCase(),booking.mobile,booking.attendees[0].fullName.toLowerCase()]){
    const result=await store.list({search,date:'2026-11-02',status:'active'});
    assert.equal(result.items.length,1);assert.equal(result.items[0].id,booking.id);assert.equal(result.page,1);assert.equal(result.hasMore,false);
   }
   assert.deepEqual((await store.list({search:'not-a-match'})).items,[]);
   assert.deepEqual((await store.list({date:'2026-11-03'})).items,[]);
   assert.deepEqual((await store.list({status:'cancelled'})).items,[]);
   assert.deepEqual((await store.list({page:2})).items,[]);
  }
 }finally{await db.query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');db.release();}
}
