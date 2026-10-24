import {createHash,randomUUID} from 'node:crypto';
import {ApiError} from './config.mjs';
// Deliberately unavailable to every normal/production configuration.
export function createLocalTrashPurge(pool,config){
 const local=()=>config.localTrashPurge===true&&['127.0.0.1','localhost'].includes(config.database?.host)&&/^ayambil_(test|local)_[a-z0-9_]+$/.test(config.database?.database||'');
 const guard=()=>{if(!local()&&config.trashPurgeEnabled!==true)throw new ApiError(403,'Empty Trash is not enabled');};
 const archive=()=>local()?'ayambil_local_trash_backup':'ayambil_trash_backup';
 const select=async(db,lock=false)=>(await db.execute("SELECT id,attendee_id,number,status,revision,trashed_at FROM ayambil_passes WHERE trashed_at IS NOT NULL ORDER BY id"+(lock?' FOR UPDATE':'')))[0];
 const revision=rows=>createHash('sha256').update(JSON.stringify(rows)).digest('hex');
 return {
  async preview(){guard();await pool.query('SELECT id FROM '+archive()+' LIMIT 0');const rows=await select(pool);return {enabled:true,scope:'all-evenings',count:rows.length,revision:revision(rows),eligible:rows.every(p=>p.status==='cancelled'),localOnly:local()};},
  async empty(actor,body){guard();if(!actor?.admin_id)throw new ApiError(403,'Administrator required');if(body?.confirmation!=='EMPTY TRASH'||!/^[a-f0-9]{64}$/.test(body?.revision||''))throw new ApiError(400,'Exact typed confirmation and current preview required');
   const db=await pool.getConnection();try{await db.beginTransaction();const rows=await select(db,true);
    if(revision(rows)!==body.revision)throw new ApiError(409,'Trash changed. Refresh and review again');
    if(!rows.length)throw new ApiError(409,'Trash is already empty');
    if(rows.some(p=>p.status!=='cancelled'))throw new ApiError(409,'Protected non-cancelled pass is marked as Trash; nothing deleted');
    const batch=randomUUID();let deleted=0;
    for(const p of rows){
     // Use the same text-protocol date representation as restored-table backups.
     // MariaDB DATETIME(3) can otherwise lose explicit .000 formatting in execute().
     const [[pass]]=await db.query('SELECT * FROM ayambil_passes WHERE id=? FOR UPDATE',[p.id]);
     const [caps]=await db.query('SELECT * FROM ayambil_capabilities WHERE pass_id=? FOR UPDATE',[p.id]);
     const [[attendee]]=await db.execute('SELECT booking_id FROM ayambil_attendees WHERE id=?',[p.attendee_id]);
     await db.execute('INSERT INTO '+archive()+' (id,batch_id,pass_number,booking_id,admin_id,payload,created_at) VALUES(?,?,?,?,?,?,UTC_TIMESTAMP(3))',[randomUUID(),batch,p.number,attendee.booking_id,actor.admin_id,JSON.stringify({pass,capabilities:caps})]);
     await db.execute('DELETE FROM ayambil_capabilities WHERE pass_id=?',[p.id]);
     const [result]=await db.execute("DELETE FROM ayambil_passes WHERE id=? AND status='cancelled' AND trashed_at IS NOT NULL",[p.id]);
     if(result.affectedRows!==1)throw new ApiError(409,'Pass changed; deletion rolled back');deleted++;
     await db.execute("INSERT INTO ayambil_audit(id,admin_id,booking_id,action,created_at) VALUES(?,?,?,'empty-trash',UTC_TIMESTAMP(3))",[randomUUID(),actor.admin_id,attendee.booking_id]);
    }
    await db.commit();return {deleted,backupBatch:batch,bookingsChanged:0,otherPassesChanged:0,messagesSent:0};
   }catch(e){await db.rollback();throw e;}finally{db.release();}
  }
 };
}
