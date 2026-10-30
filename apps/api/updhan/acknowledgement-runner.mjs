// Explicit one-tick supervisor. Import does not schedule, connect or activate.
// Deployment supervisor may schedule ticks only after ownership and shared
// provider rate-budget approval. Lease and job claims are Updhan-only.
export function createAcknowledgementRunner({pool,worker,repository,owner,enabled=false}){
 if(!/^[a-zA-Z0-9_-]{1,80}$/.test(owner||''))throw Error('Explicit Updhan owner required');
 return {async tick(){
  if(!enabled)return {state:'disabled'};const c=await pool.getConnection();let acquired=false;
  try{await c.beginTransaction();const [[r]]=await c.query("SELECT * FROM updhan_worker_ownership WHERE name='acknowledgement' FOR UPDATE");if(!r?.enabled||r.owner!==owner){await c.rollback();return {state:'not_owner'};}const [update]=await c.execute("UPDATE updhan_worker_ownership SET lease_until=DATE_ADD(UTC_TIMESTAMP(),INTERVAL 10 MINUTE) WHERE name='acknowledgement' AND (lease_until IS NULL OR lease_until<UTC_TIMESTAMP())");if(!update.affectedRows){await c.rollback();return {state:'leased'};}await c.commit();acquired=true;}catch(e){await c.rollback();throw e;}finally{c.release();}
  try{await repository.recoverExpired();const [jobs]=await pool.query("SELECT id FROM updhan_outbox WHERE type='application_received' AND state='queued' ORDER BY created_at,id LIMIT 1");if(!jobs.length)return {state:'idle'};return await worker.process(jobs[0].id);}finally{if(acquired)await pool.execute("UPDATE updhan_worker_ownership SET lease_until=NULL WHERE name='acknowledgement' AND owner=?",[owner]);}
 }};
}
