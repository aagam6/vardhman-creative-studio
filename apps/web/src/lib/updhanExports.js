import {fields} from './updhanRegistration.js';
export const columns=[
 ['reference','Registration number'],['status','Status'],['created_at','Application received'],
 ['name','Name / નામ / नाम'],['gender','Gender'],['category','Sadhana'],
 ['startsOn','Recorded sadhana entry'],['endsOn','Recorded sadhana end'],['dialCode','WhatsApp country code'],
 ...fields.filter(([key])=>!['name','health'].includes(key)).map(([key,label])=>[key,label]),
 ['companions','Companion names / references'],
];
// Only these public-form fields are exported. Never spread private detail payloads.
export function exportRecord(detail){
 const value=key=>{
  if(['reference','status','created_at'].includes(key))return detail[key]??'';
  if(['startsOn','endsOn'].includes(key))return detail.option_snapshot?.[key]??'';
  if(key==='dialCode')return detail.applicant.code==='other'?detail.applicant.customCode:detail.applicant.code;
  if(key==='companions')return(detail.companions||[]).map(c=>`${c.name} (${c.form_number||'—'})`).join('; ');
  return detail.applicant[key]??'';
 };
 return Object.fromEntries(columns.map(([key,label])=>[label,String(value(key)??'')]));
}
