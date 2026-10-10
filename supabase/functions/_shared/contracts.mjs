export function validateBooking(body, config) {
  const name = value => {
    if (typeof value !== 'string') throw new Error('Name required');
    const text = value.trim().replace(/\s+/g,' ');
    if (text.length<2 || text.length>120 || /[<>]/.test(text) || Array.from(text).some(c=>c.charCodeAt(0)<32)) throw new Error('Invalid name');
    return text;
  };
  const mobile = typeof body.mobile==='string'?body.mobile.replace(/[\s()-]/g,''):'';
  if (!/^\+[1-9]\d{7,14}$/.test(mobile)) throw new Error('Invalid mobile');
  if (!config.sessions.some(s=>s.date===body.eventDate) || body.whatsappConsent!==true) throw new Error('Invalid evening or consent');
  if (body.termsAccepted !== true) throw new Error('Pass terms acceptance required');
  if (Array.isArray(body.attendees) && body.attendees.length > 2) throw new Error('Maximum two attendees');
  if (!Array.isArray(body.attendees) || !body.attendees.length || !/^[a-f0-9]{64}$/.test(body.requestKey||'')) throw new Error('Invalid submission');
  return {contactName:name(body.contactName),mobile,eventDate:body.eventDate,whatsappConsent:true,termsAccepted:true,requestKey:body.requestKey,
    attendees:body.attendees.map(a=>{
      if (!a || !Array.isArray(a.dates) || a.dates.length!==1 || a.dates[0]!==body.eventDate) throw new Error('One matching evening required');
      return {fullName:name(a.fullName),dates:[body.eventDate]};
    })};
}
export function assertTarget(env) {
  const ref=env('AYAMBIL_EXPECTED_PROJECT_REF');
  const url=new URL(env('SUPABASE_URL'));
  if (env('AYAMBIL_TARGET')!=='test' || !ref || url.protocol!=='https:' || url.hostname!==ref+'.supabase.co') throw new Error('Test target not verified');
}
export function allowedOrigin(origin, env) {
  let origins;try {origins=JSON.parse(env('AYAMBIL_ALLOWED_ORIGINS'));}catch{return false;}
  return Array.isArray(origins) && origins.every(o=>{try{return new URL(o).origin===o;}catch{return false;}}) && origins.includes(origin);
}
export function messagePayload(booking, keys, env, config, mapping) {
  const session=config.sessions.find(s=>s.date===booking.eventDate);
  if (!session || !Array.isArray(keys) || keys.length!==booking.attendees.length || keys.some(k=>!/^[a-f0-9]{64}$/.test(k))) throw new Error('Invalid saved confirmation');
  const site=env('AYAMBIL_PUBLIC_SITE_URL');
  if (!/^https:\/\/[^?#]+$/.test(site)) throw new Error('Verified HTTPS preview site required');
  const links=keys.map(key=>site.replace(/\/$/,'')+'/500-akhand-ayambil-vijayollas/passes#'+key).join(' | ');
  const values={contactName:booking.contactName,eventName:config.eventName,eventDate:session.label,time:session.time,performer:session.performer,programme:session.programme,venue:session.venue+', '+session.address,attendeeCount:String(booking.attendees.length),attendeeNames:booking.attendees.map(a=>a.fullName).join(', '),passLink:links};
  values.confirmationDetails=[values.contactName,values.eventName,values.eventDate,values.time,values.performer+' — '+values.programme,values.venue,'Attendees: '+values.attendeeCount,links].join(' | ');
  const day=booking.eventDate.slice(-2);
  return {to:booking.mobile.replace(/^\+/,''),templateName:env('AYAMBIL_FLOW_TEMPLATE_'+day),language:env('AYAMBIL_FLOW_LANGUAGE_'+day),components:[{type:'body',parameters:mapping(env,day).map(field=>({type:'text',text:values[field]}))}]};
}
