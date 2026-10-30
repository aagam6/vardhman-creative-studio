import {UpdhanError} from './errors.mjs';
const fail=(s,m)=>{throw new UpdhanError(s,m);};
const parse=v=>typeof v==='string'?JSON.parse(v):v;
const transitions={received:['under_review','cancelled','trashed'],under_review:['approved','waitlisted','rejected','cancelled','trashed'],approved:['under_review','cancelled','trashed'],waitlisted:['under_review','approved','rejected','cancelled','trashed'],rejected:['under_review','trashed'],cancelled:['under_review','trashed'],trashed:[]};
export async function admissionGate(c,eventId,optionId,{forApproval=false}={}){
 const [[settings]]=await c.execute('SELECT * FROM updhan_admission_settings WHERE event_id=? FOR UPDATE',[eventId]);
 const [[category]]=await c.execute('SELECT * FROM updhan_category_limits WHERE option_id=? FOR UPDATE',[optionId]);
 if(!settings||!category||!forApproval&&(settings.mode==='closed'||category.mode==='closed'))fail(503,settings?.maintenance_message||'Admission configuration is closed');
 if(settings.capacity===null)fail(503,'Confirmed shared event capacity required');
 return {settings,category,waiting:settings.mode==='waiting'||category.mode==='waiting'};
}
export async function occupied(c,eventId,optionId){
 const [[total]]=await c.execute("SELECT COUNT(*) AS n FROM updhan_applications WHERE event_id=? AND status='approved'",[eventId]);
 const [[category]]=await c.execute("SELECT COUNT(*) AS n FROM updhan_applications WHERE event_id=? AND status='approved' AND JSON_UNQUOTE(JSON_EXTRACT(option_snapshot,'$.id'))=?",[eventId,optionId]);
 return {total:Number(total.n),category:Number(category.n)};
}
export function createAdmissionOperations({pool}){
 const admin=actor=>{if(!actor?.roles?.includes('updhan_admin'))fail(403,'Updhan role required');};
 async function tx(fn){const c=await pool.getConnection();try{await c.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');await c.beginTransaction();const r=await fn(c);await c.commit();return r;}catch(e){await c.rollback();throw e;}finally{c.release();}}
 async function audit(c,actor,subject,action,detail){await c.execute('INSERT INTO updhan_operation_audit(actor,subject,action,detail) VALUES (?,?,?,?)',[actor.id,subject,action,JSON.stringify(detail)]);}
 return {
 async configure(actor,{eventId,optionId,version,mode,capacity,policy='manual',maintenanceMessage=''}){admin(actor);if(!['open','waiting','closed'].includes(mode)||!Number.isInteger(version)||capacity!==null&&(!Number.isInteger(capacity)||capacity<0)||policy!=='manual'||typeof maintenanceMessage!=='string'||maintenanceMessage.length>500)fail(400,'Invalid settings');return tx(async c=>{
  // Event lock serializes settings with registration and approval. Never locks Ayambil.
  const [[event]]=await c.execute('SELECT id FROM updhan_events WHERE id=? FOR UPDATE',[eventId]);if(!event)fail(404,'Event not found');
  const table=optionId?'updhan_category_limits':'updhan_admission_settings',key=optionId?'option_id':'event_id',id=optionId||eventId;
  if(optionId){const [[o]]=await c.execute('SELECT id FROM updhan_options WHERE id=? AND event_id=?',[optionId,eventId]);if(!o)fail(404,'Option not found');}
  const [[old]]=await c.execute(`SELECT version FROM ${table} WHERE ${key}=? FOR UPDATE`,[id]);if((old?.version||0)!==version)fail(409,'Settings changed');
  if(old)await c.execute(`UPDATE ${table} SET mode=?,capacity=?,version=version+1${optionId?'':',policy=?,maintenance_message=?'} WHERE ${key}=?`,[mode,capacity,...(optionId?[]:[policy,maintenanceMessage]),id]);
  else await c.execute(`INSERT INTO ${table}(${key},mode,capacity${optionId?'':',policy,maintenance_message'}) VALUES (?,?,?${optionId?'':',?,?'})`,[id,mode,capacity,...(optionId?[]:[policy,maintenanceMessage])]);
  await audit(c,actor,id,'admission_settings',{mode,capacity,policy});return {version:version+1};
 });},
 async change(actor,{id,version,status}){admin(actor);if(!Number.isInteger(version))fail(400,'Version required');return tx(async c=>{
  const [[identity]]=await c.execute('SELECT event_id FROM updhan_applications WHERE id=?',[id]);if(!identity)fail(404,'Not found');
  await c.execute('SELECT id FROM updhan_events WHERE id=? FOR UPDATE',[identity.event_id]);
  const [[app]]=await c.execute('SELECT * FROM updhan_applications WHERE id=? FOR UPDATE',[id]);if(app.version!==version)fail(409,'Application changed');
  let target=status==='restore'&&app.status==='trashed'?app.previous_status:status;
  if(!(status==='restore'&&app.status==='trashed')&&!transitions[app.status]?.includes(target))fail(400,'Invalid transition');
  if(!transitions[target])fail(400,'Invalid restoration');
  if(target==='approved'){
   const option=parse(app.option_snapshot),gate=await admissionGate(c,app.event_id,option.id,{forApproval:true});
   const [[o]]=await c.execute('SELECT approved,starts_on,ends_on FROM updhan_options WHERE id=? AND event_id=?',[option.id,app.event_id]);if(!o?.approved||!o.starts_on||!o.ends_on)fail(409,'Approved category dates required');
   const used=await occupied(c,app.event_id,option.id);if(used.total>=gate.settings.capacity)target='waitlisted';
  }
  await c.execute('UPDATE updhan_applications SET status=?,previous_status=?,version=version+1 WHERE id=?',[target,target==='trashed'?app.status:app.previous_status,id]);
  await c.execute('INSERT INTO updhan_audit(application_id,actor,action,old_status,new_status) VALUES (?,?,?,?,?)',[id,actor.id,status,app.status,target]);return {id,status:target,version:version+1};
 });},
 async attendance(actor,{id,version,checkedIn}){admin(actor);if(typeof checkedIn!=='boolean'||!Number.isInteger(version))fail(400,'Invalid attendance');return tx(async c=>{
  const [[app]]=await c.execute('SELECT status FROM updhan_applications WHERE id=? FOR UPDATE',[id]);if(app?.status!=='approved')fail(409,'Only approved applicants can check in');
  const [[row]]=await c.execute('SELECT version FROM updhan_attendance WHERE application_id=? FOR UPDATE',[id]);if((row?.version||0)!==version)fail(409,'Attendance changed');
  await c.execute('INSERT INTO updhan_attendance(application_id,checked_in) VALUES (?,?) ON DUPLICATE KEY UPDATE checked_in=VALUES(checked_in),version=version+1',[id,checkedIn]);await audit(c,actor,id,'attendance',{checkedIn});return {version:version+1,checkedIn};
 });},
 };
}
