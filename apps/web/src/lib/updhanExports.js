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

export function exportFailure(error){
 const message=String(error?.message||'');
 if(/dynamically imported module|Loading chunk|Importing a module script failed/i.test(message))return 'वेबसाइट का नया अपडेट आया है। पेज Refresh करके export फिर शुरू करें। / Refresh this page to load the latest export tools.';
 if(error?.name==='TimeoutError'||error?.name==='AbortError'||/Failed to fetch|NetworkError/i.test(message))return 'कनेक्शन पूरा नहीं हुआ। इंटरनेट जाँचें और export फिर शुरू करें। / Check your connection and retry the export.';
 return message||'Export नहीं हो सका। कृपया फिर कोशिश करें।';
}
