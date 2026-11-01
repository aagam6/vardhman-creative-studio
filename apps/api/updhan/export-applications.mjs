import {UpdhanError} from './errors.mjs';
const parse=value=>typeof value==='string'?JSON.parse(value):value;
export async function exportUpdhanApplications({pool,photos,actor,ids,includePhotos=false}){
 if(!actor?.roles?.includes('updhan_admin'))throw new UpdhanError(403,'Administrator access required');
 const max=includePhotos?10:25;
 if(typeof includePhotos!=='boolean'||!Array.isArray(ids)||!ids.length||ids.length>max||new Set(ids).size!==ids.length||ids.some(id=>typeof id!=='string'||! /^[a-f0-9-]{36}$/i.test(id)))throw new UpdhanError(400,'Invalid export selection');
 const marks=ids.map(()=>'?').join(',');
 const [rows]=await pool.execute(`SELECT id,reference,status,applicant,option_snapshot,created_at FROM updhan_applications WHERE id IN (${marks})`,ids);
 if(rows.length!==ids.length)throw new UpdhanError(404,'Application unavailable');
 const [companions]=await pool.execute(`SELECT application_id,name,form_number FROM updhan_companions WHERE application_id IN (${marks})`,ids);
 const items=[];
 for(const id of ids){const row=rows.find(r=>r.id===id),applicant={...parse(row.applicant)};delete applicant.health;
  const item={...row,applicant,option_snapshot:parse(row.option_snapshot),companions:companions.filter(c=>c.application_id===id).map(({name,form_number})=>({name,form_number}))};
  if(includePhotos){
   // Explicit admin export includes archived applicants without restoring them.
   // Expiry, authentication and private-file validation remain mandatory.
   const [[photo]]=await pool.execute('SELECT object_key FROM updhan_photos WHERE application_id=? AND expires_at>UTC_TIMESTAMP()',[id]);
   if(!photo)throw new UpdhanError(404,'Photo unavailable for export');
   const bytes=await photos.read(photo.object_key);item.photo={mime:'image/jpeg',base64:bytes.toString('base64')};
  }
  items.push(item);
 }
 await pool.execute("INSERT INTO updhan_operation_audit(actor,subject,action,detail) VALUES (?,?,'forms_export',?)",[actor.id,'applications',JSON.stringify({ids,includePhotos})]);
 return {items};
}
