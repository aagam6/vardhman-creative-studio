import {createHash} from 'node:crypto';
// Existing Updhan rate-limit storage only. One DB-clock window and advisory lock
// coordinate every hosted process using the existing provider key. No DDL.
export function createSharedProviderBudget({pool,key,limit=50}){
 if(!key||!Number.isInteger(limit)||limit<1||limit>50)throw Error('Reviewed provider budget required');
 const prefix=createHash('sha256').update('provider-budget:'+key).digest('hex').slice(0,40),lock='provider:'+prefix;
 return async({count=1}={})=>{
  if(!Number.isInteger(count)||count<1||count>3)return false;
  let c,acquired=false;
  try{
   c=await pool.getConnection();
   const [[held]]=await c.execute('SELECT GET_LOCK(?,2) AS acquired',[lock]);if(Number(held.acquired)!==1)return false;acquired=true;
   await c.beginTransaction();
   const [[row]]=await c.execute('SELECT COALESCE(SUM(hits),0) AS used FROM updhan_rate_limits WHERE bucket_key LIKE ? AND expires_at>UTC_TIMESTAMP(3)',[prefix+':%']);
   if(Number(row.used)+count>limit){await c.rollback();return false;}
   await c.execute("INSERT INTO updhan_rate_limits(bucket_key,hits,expires_at) VALUES (CONCAT(?,':',FLOOR(UNIX_TIMESTAMP(UTC_TIMESTAMP(3)))),?,DATE_ADD(UTC_TIMESTAMP(3),INTERVAL 61 SECOND)) ON DUPLICATE KEY UPDATE hits=hits+VALUES(hits),expires_at=GREATEST(expires_at,VALUES(expires_at))",[prefix,count]);
   await c.commit();return true;
  }catch{await c?.rollback().catch(()=>{});return false;}finally{if(acquired)await c.execute('SELECT RELEASE_LOCK(?)',[lock]).catch(()=>{});c?.release();}
 };
}
