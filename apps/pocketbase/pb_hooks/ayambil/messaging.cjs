const config = require('./config.json');
const flow = require('./vardhmanflow.cjs');
function settings(env) {
  const required = ['AYAMBIL_FLOW_API_KEY','AYAMBIL_FLOW_API_SECRET','AYAMBIL_FLOW_API_PREFIX','AYAMBIL_FLOW_TEMPLATE_02','AYAMBIL_FLOW_TEMPLATE_03','AYAMBIL_FLOW_LANGUAGE_02','AYAMBIL_FLOW_LANGUAGE_03','AYAMBIL_FLOW_PARAMETERS_02','AYAMBIL_FLOW_PARAMETERS_03','AYAMBIL_PUBLIC_SITE_URL'];
  const missing = required.filter(k=>!env(k));
  if (!['/api/v1','/api/v1/api/v1'].includes(env('AYAMBIL_FLOW_API_PREFIX'))) missing.push('verified AYAMBIL_FLOW_API_PREFIX');
  if (!/^https:\/\/[^?#]+$/.test(env('AYAMBIL_PUBLIC_SITE_URL'))) missing.push('HTTPS AYAMBIL_PUBLIC_SITE_URL');
  for (const day of ['02','03']) { try { flow.mapping(env,day); } catch { missing.push('valid AYAMBIL_FLOW_PARAMETERS_'+day); } }
  for (const key of ['AYAMBIL_DEPLOYMENT_VERIFIED','AYAMBIL_FLOW_TEMPLATES_VERIFIED']) if (env(key)!=='true') missing.push(key);
  return {ready:!missing.length,missing:[...new Set(missing)]};
}
function payload(booking, key, env) {
  const session = config.sessions.find(s=>s.date===booking.eventDate);
  if (!session) throw new Error('Only single-evening bookings support automatic confirmation.');
  const day = booking.eventDate.slice(-2);
  const keys = Array.isArray(key) ? key : [key];
  if (!keys.length || keys.some(value => typeof value !== 'string' || !/^[a-zA-Z0-9]{64}$/.test(value))) throw new Error('Valid private pass links required.');
  const passLinks = keys.map(value => env('AYAMBIL_PUBLIC_SITE_URL').replace(/\/$/,'')+'/500-akhand-ayambil-vijayollas/passes#'+value).join(' | ');
  const values = {eventName:config.eventName,eventDate:session.label,time:session.time,performer:session.performer,programme:session.programme,venue:session.venue+', '+session.address,attendeeCount:String(booking.attendees.length),attendeeNames:booking.attendees.map(a=>a.fullName).join(', '),contactName:booking.contactName,passLink:passLinks};
  values.confirmationDetails = [values.contactName,values.eventName,values.eventDate,values.time,values.performer+' — '+values.programme,values.venue,'Attendees: '+values.attendeeCount,values.passLink].join(' | ');
  return {to:booking.mobile.replace(/^\+/,''),templateName:env('AYAMBIL_FLOW_TEMPLATE_'+day),language:env('AYAMBIL_FLOW_LANGUAGE_'+day),components:[{type:'body',parameters:flow.mapping(env,day).map(field=>({type:'text',text:values[field]}))}]};
}
const classify = flow.classify;
function process(app, send, environment) {
  const env = environment || (key => $os.getenv(key));
  if (!settings(env).ready) return;
  flow.preflight(send,env);
  const service = require('./service.cjs');
  const queue = app.findRecordsByFilter('ayambil_messages', 'status = "queued" || status = "sending"', 'created', 10);
  queue.forEach(item => {
    if (item.getString('status') === 'sending') {
      if (Date.now() - Date.parse(item.getString('attempted_at')) > 120000) { item.set('status','uncertain'); item.set('failure','Worker stopped during submission. Reconcile provider status before retrying.'); app.save(item); }
      return;
    }
    let claimed = false; let booking; let message;
    app.runInTransaction(tx => {
      message = tx.findRecordById('ayambil_messages', item.id);
      if (message.getString('status') !== 'queued') return;
      booking = tx.findRecordById('ayambil_bookings', message.getString('booking'));
      if (!booking.getBool('whatsapp_consent') || booking.getString('status') !== 'active') { message.set('status','cancelled'); tx.save(message); return; }
      if (Date.now() >= Date.parse(message.getString('download_expires'))) {
        const key = $security.randomString(64); message.set('download_key',key); message.set('download_hash',$security.sha256(key));
        message.set('download_expires',new Date(Date.now()+7*86400000).toISOString());
      }
      message.set('provider','vardhmanflow'); message.set('status','sending'); message.set('attempts',message.getInt('attempts')+1); message.set('attempted_at',new Date().toISOString()); message.set('failure',''); tx.save(message); claimed = true;
    });
    if (!claimed) return;
    let result;
    try {
      const keys = [];
      app.runInTransaction(tx => {
        const attendees = tx.findRecordsByFilter('ayambil_attendees','booking = {:booking} && status = "active"','created,id',0,0,{booking:booking.id});
        attendees.forEach(attendee => {
          const pass = tx.findFirstRecordByFilter('ayambil_passes','attendee = {:attendee} && status = "active"',{attendee:attendee.id});
          if (!pass.getString('download_key') || Date.now() >= Date.parse(pass.getString('download_expires'))) {
            const key = $security.randomString(64); pass.set('download_key',key); pass.set('download_hash',$security.sha256(key));
            pass.set('download_expires',new Date(Date.now()+7*86400000).toISOString()); tx.save(pass);
          }
          keys.push(pass.getString('download_key'));
        });
      });
      const body = payload(service.bookingData(app,booking,true),keys,env);
      result = classify(send({url:flow.url(env('AYAMBIL_FLOW_API_PREFIX'),'messages/template'),method:'POST',timeout:20,headers:flow.headers(env),body:JSON.stringify(body)}));
    } catch { result = {status:'uncertain',ref:'',failure:'Network response unknown. Reconcile provider status before retrying.'}; }
    app.runInTransaction(tx => { const current = tx.findRecordById('ayambil_messages',item.id);
      if (current.getString('status') !== 'sending') return;
      current.set('status',result.status); current.set('provider_ref',result.ref); current.set('failure',result.failure);
      if(result.ref) current.set('accepted_at',new Date().toISOString()); tx.save(current);
    });
  });
}
function retry(app, e, body) {
  const service = require('./service.cjs'); service.admin(e);
  app.runInTransaction(tx => {
    const booking = tx.findRecordById('ayambil_bookings',body.bookingId);
    if (!booking.getBool('whatsapp_consent') || booking.getString('status') !== 'active') throw new BadRequestError('An active booking and recorded consent are required.');
    const message = tx.findFirstRecordByFilter('ayambil_messages','booking = {:id}',{id:booking.id});
    if (message.getString('status') !== 'failed') throw new BadRequestError('Only confirmed failed messages can be retried. Uncertain submissions require provider reconciliation.');
    const previousHistory = JSON.parse(message.getString('provider_history') || 'null');
    const history = Array.isArray(previousHistory) ? previousHistory : [];
    history.push({provider:message.getString('provider'),providerRef:message.getString('provider_ref'),failure:message.getString('failure'),at:new Date().toISOString()});
    message.set('provider_history',history); message.set('provider_ref',''); message.set('status','queued'); tx.save(message);
    const log = new Record(tx.findCollectionByNameOrId('ayambil_audit')); log.set('actor',e.auth.id); log.set('booking',booking.id);log.set('action','whatsapp_retry');tx.save(log);
  }); return {status:'queued'};
}
function download(app, key) {
  if (typeof key !== 'string' || !/^[a-zA-Z0-9]{64}$/.test(key)) throw new NotFoundError('Pass download unavailable.');
  let pass; try { pass = app.findFirstRecordByFilter('ayambil_passes','download_hash = {:hash}',{hash:$security.sha256(key)}); } catch { throw new NotFoundError('Pass download unavailable.'); }
  const attendee = app.findRecordById('ayambil_attendees',pass.getString('attendee'));
  const booking = app.findRecordById('ayambil_bookings',attendee.getString('booking'));
  const expires = Date.parse(pass.getString('download_expires'));
  if (pass.getString('status') !== 'active' || attendee.getString('status') !== 'active' || booking.getString('status') !== 'active' || !Number.isFinite(expires) || Date.now() >= expires) throw new NotFoundError('Pass download unavailable.');
  return { passes:[require('./service.cjs').passData(pass)] };
}
function applyStatus(app, id, result) {
  if (!result) return;
  app.runInTransaction(tx=>{
    const record=tx.findRecordById('ayambil_messages',id);
    if (record.getString('provider')!=='vardhmanflow' || record.getString('provider_ref')!==result.ref) return;
    const previous=record.getString('status');
    const ranks={accepted:1,sent:2,delivered:3,read:4};
    if (['cancelled','failed'].includes(previous)) return;
    if (result.status==='failed' && ['delivered','read'].includes(previous)) return;
    if (ranks[previous] && ranks[result.status] && ranks[result.status]<ranks[previous]) return;
    record.set('status',result.status); record.set('failure',result.failure);
    if (['delivered','read'].includes(result.status)) {
      const timestamp=Date.parse(result.deliveredAt);
      record.set('delivered_at',Number.isFinite(timestamp)?new Date(timestamp).toISOString():new Date().toISOString());
    }
    tx.save(record);
  });
}
function poll(app, send, environment) {
  const env=environment || (key=>$os.getenv(key));
  if (!settings(env).ready) return;
  const rows=app.findRecordsByFilter('ayambil_messages','provider = "vardhmanflow" && provider_ref != "" && (status = "accepted" || status = "sent" || status = "delivered" || status = "uncertain")','updated',20);
  rows.forEach(row=>{
    try {
      const ref=row.getString('provider_ref');
      const result=flow.status(flow.get(send,env,env('AYAMBIL_FLOW_API_PREFIX'),'messages/status/'+encodeURIComponent(ref)),ref);
      applyStatus(app,row.id,result);
    } catch { /* Keep the last confirmed status; never resend after a polling error. */ }
  });
}
module.exports = {settings,payload,classify,process,retry,download,poll,applyStatus};
