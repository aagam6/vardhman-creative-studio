import {nextDeliveryStatus} from './delivery-status-policy.mjs';
// Production policy rehearsal: no startup wiring or network client; disposable only.
import {assertLocalControls} from './booking-controls.mjs';
import {randomUUID} from 'node:crypto';
export const localOwnershipSchema=[
 `CREATE TABLE ayambil_local_queue_owner(id INT PRIMARY KEY,owner VARCHAR(20) NOT NULL,version INT NOT NULL,dispatch_mode VARCHAR(10) NOT NULL) ENGINE=InnoDB`,
 `INSERT INTO ayambil_local_queue_owner VALUES(1,'paused',1,'off')`,
 `CREATE TABLE ayambil_local_delivery_receipts(provider_id VARCHAR(200) PRIMARY KEY,outbox_id CHAR(36) NOT NULL UNIQUE,state VARCHAR(20) NOT NULL,version INT NOT NULL DEFAULT 1,updated_at DATETIME(3) NOT NULL) ENGINE=InnoDB`,
 `CREATE TABLE ayambil_local_sender_audit(id CHAR(36) PRIMARY KEY,action VARCHAR(40) NOT NULL,subject VARCHAR(200) NOT NULL,detail JSON NOT NULL,created_at DATETIME(3) NOT NULL) ENGINE=InnoDB`
];
const read=async(db,sql,args=[])=> (await db.execute(sql,args))[0];
export async function requireQueueOwnership(db,owner,version){
 const [row]=await read(db,'SELECT * FROM ayambil_local_queue_owner WHERE id=1 FOR UPDATE');
 if(!row||row.owner!==owner||row.dispatch_mode!=='mock'||row.version!==version)throw Error('Queue ownership paused, stale or not assigned');
 return row;
}
export function createLocalQueueCoordinator({pool,config,statusProvider}){
 assertLocalControls(config);const actual=pool?.pool?.config?.connectionConfig;
 if(actual?.host!=='127.0.0.1'||actual.database!==config.database.database)throw Error('Owned disposable pool required');
 const tx=async fn=>{const db=await pool.getConnection();try{await db.beginTransaction();const r=await fn(db);await db.commit();return r;}catch(e){await db.rollback();throw e;}finally{db.release();}};
 const audit=(db,action,subject,detail)=>db.execute('INSERT INTO ayambil_local_sender_audit VALUES(?,?,?,?,UTC_TIMESTAMP(3))',[randomUUID(),action,subject,JSON.stringify(detail)]);
 async function reconcile(id){
  const [row]=await read(pool,'SELECT id,state,provider_id FROM ayambil_local_notification_outbox WHERE id=?',[id]);
  if(!row?.provider_id||!['accepted','sent','delivered','read','uncertain','failed'].includes(row.state))throw Error('Known provider reference required; never retry an unknown acceptance');
  if(!statusProvider||statusProvider.mockStatusOnly!==true)throw Error('Mock-only status provider required');
  // Read status, never submit a message. Unknown ID is not converted into a send retry.
  const result=await statusProvider.status(row.provider_id);
  if(result.id!==row.provider_id||!['accepted','sent','delivered','read','failed'].includes(result.status))throw Error('Unverified provider status');
  return tx(async db=>{
   const [current]=await read(db,'SELECT id,state,provider_id FROM ayambil_local_notification_outbox WHERE id=? FOR UPDATE',[id]);
   if(current.provider_id!==row.provider_id)throw Error('Provider reference changed');
   const [duplicates]=await read(db,'SELECT id FROM ayambil_local_notification_outbox WHERE provider_id=? AND id<>? LIMIT 1',[row.provider_id,id]);
   if(duplicates)throw Error('Ambiguous provider reference requires operator review');
   const [receipt]=await read(db,'SELECT * FROM ayambil_local_delivery_receipts WHERE provider_id=? FOR UPDATE',[row.provider_id]);
   if(receipt&&receipt.outbox_id!==id)throw Error('Provider reference collision');
   const prev=current.state;const next=nextDeliveryStatus(prev,result.status);
   if(receipt?.state===next&&prev===next)return {status:next,changed:false};
   await db.execute('INSERT INTO ayambil_local_delivery_receipts(provider_id,outbox_id,state,updated_at) VALUES(?,?,?,UTC_TIMESTAMP(3)) ON DUPLICATE KEY UPDATE state=VALUES(state),version=version+1,updated_at=UTC_TIMESTAMP(3)',[row.provider_id,id,next]);
   await db.execute('UPDATE ayambil_local_notification_outbox SET state=?,updated_at=UTC_TIMESTAMP(3) WHERE id=?',[next,id]);
   await audit(db,'status_reconciled',id,{previous:prev,status:next});return {status:next,changed:prev!==next};
  });
 }
 return {
  async inspect(){const [row]=await read(pool,'SELECT * FROM ayambil_local_queue_owner WHERE id=1');return {...row,realDispatchEnabled:false};},
  async handover({owner,version}){
   if(!['paused','legacy','bilingual'].includes(owner))throw Error('Invalid queue owner');
   return tx(async db=>{const [row]=await read(db,'SELECT * FROM ayambil_local_queue_owner WHERE id=1 FOR UPDATE');if(!row||row.version!==version)throw Error('Stale owner revision');
    const [legacy]=await read(db,"SELECT id FROM ayambil_message_queue WHERE status IN ('preparing','sending','uncertain') LIMIT 1");
    const [modern]=await read(db,"SELECT id FROM ayambil_local_notification_outbox WHERE state IN ('processing','uncertain') LIMIT 1");
    if(owner!=='paused'&&(legacy||modern))throw Error('In-flight or uncertain jobs require reconciliation before handover');
    await db.execute('UPDATE ayambil_local_queue_owner SET owner=?,version=version+1,dispatch_mode=? WHERE id=1',[owner,owner==='paused'?'off':'mock']);await audit(db,'owner_changed','queue',{previous:row.owner,owner,realDispatchEnabled:false});return {owner,version:row.version+1,realDispatchEnabled:false};
   });
  },
  reconcile,
  async webhook(){throw Error('Webhook disabled: provider signature/receipt contract not verified; use authenticated status reconciliation');}
 };
}
