// VardhmanFlow's documented REST contract. Credentials stay inside PocketBase.
const origin = 'https://vardhmanflow.com';
function headers(env) {
  const result = {'X-API-Key':env('AYAMBIL_FLOW_API_KEY'),'X-API-Secret':env('AYAMBIL_FLOW_API_SECRET'),'Content-Type':'application/json'};
  if (env('AYAMBIL_FLOW_CHANNEL_ID')) result['X-Channel-Id'] = env('AYAMBIL_FLOW_CHANNEL_ID');
  return result;
}
function url(prefix, path) {
  if (!['/api/v1','/api/v1/api/v1'].includes(prefix)) throw new Error('Unverified API prefix.');
  return origin + prefix + '/' + path.replace(/^\/+/, '');
}
function get(send, env, prefix, path) { return send({url:url(prefix,path),method:'GET',timeout:15,headers:headers(env)}); }
function ok(r) { return r.statusCode >= 200 && r.statusCode < 300 && r.json?.success === true; }
// Read-only discovery resolves the two contradictory documented URL examples.
async function discover(send, env) {
  for (const prefix of ['/api/v1','/api/v1/api/v1']) {
    const r = await get(send,env,prefix,'account');
    if (ok(r) && r.json.data?.channel?.id) return {prefix,account:r.json.data};
    if (r.statusCode !== 404) throw new Error('Authenticated account lookup was not confirmed.');
  }
  throw new Error('Neither documented account path returned an authenticated account.');
}
function mapping(env, day) {
  let fields; try { fields = JSON.parse(env('AYAMBIL_FLOW_PARAMETERS_'+day)); } catch { throw new Error('Template mapping required.'); }
  const allowed = ['eventName','eventDate','time','performer','programme','venue','attendeeCount','attendeeNames','contactName','passLink','confirmationDetails'];
  if (!Array.isArray(fields) || fields.some(f=>!allowed.includes(f)) || (!fields.includes('confirmationDetails') && (!fields.includes('passLink') || !fields.includes('contactName') || (!fields.includes('attendeeCount') && !fields.includes('attendeeNames'))))) throw new Error('Invalid template parameter mapping.');
  return fields;
}
function validateTemplate(template, env, day) {
  if (!template || template.status !== 'APPROVED' || template.name !== env('AYAMBIL_FLOW_TEMPLATE_'+day) || template.language !== env('AYAMBIL_FLOW_LANGUAGE_'+day)) throw new Error('Approved template name/language mismatch.');
  // The documentation's list example omits components. Never guess its parameters.
  const components = template.components;
  if (!Array.isArray(components)) throw new Error('Provider template components unavailable; parameter count cannot be verified.');
  const body = components.find(c=>String(c.type).toLowerCase()==='body');
  if (!body || typeof body.text !== 'string') throw new Error('Template body unavailable.');
  const fields = mapping(env,day);
  const slots = [...body.text.matchAll(/\{\{\s*(\d+)\s*\}\}/g)].map(m=>Number(m[1]));
  const unique = [...new Set(slots)].sort((a,b)=>a-b);
  if (unique.length !== fields.length || unique.some((n,i)=>n!==i+1)) throw new Error('Template variable count/order mismatch.');
  if (components.some(c=>String(c.type).toLowerCase()!=='body' && (c.format && c.format!=='TEXT' || /\{\{/.test(c.text||'') || (c.buttons||[]).some(b=>/\{\{/.test(b.url||''))))) throw new Error('Only static headers/buttons and mapped text bodies are supported.');
  return fields;
}
async function preflight(send, env) {
  const prefix = env('AYAMBIL_FLOW_API_PREFIX');
  const account = await get(send,env,prefix,'account');
  const channel = account.json?.data?.channel;
  if (!ok(account) || !channel?.id || channel.isActive !== true || channel.healthStatus !== 'healthy' || (env('AYAMBIL_FLOW_CHANNEL_ID') && channel.id !== env('AYAMBIL_FLOW_CHANNEL_ID'))) throw new Error('Channel account/health not verified.');
  const response = await get(send,env,prefix,'templates?status=APPROVED');
  if (!ok(response) || !Array.isArray(response.json.data)) throw new Error('Approved template lookup failed.');
  const templates = {};
  for (const day of ['02','03']) {
    const template = response.json.data.find(t=>t.name===env('AYAMBIL_FLOW_TEMPLATE_'+day) && t.language===env('AYAMBIL_FLOW_LANGUAGE_'+day));
    templates[day] = validateTemplate(template,env,day);
  }
  return templates;
}
function classify(r) {
  if (ok(r) && r.json.data?.messageId) {
    const status = r.json.data.status;
    return {status:['queued','sent','delivered','read','failed'].includes(status) ? (status==='queued'?'accepted':status) : 'uncertain',ref:r.json.data.messageId,failure:status==='failed'?'Provider reported a failed message.':''};
  }
  if (r.statusCode >= 500 || r.statusCode === 408 || (r.statusCode >= 200 && r.statusCode < 300 && r.json?.success !== false)) return {status:'uncertain',ref:'',failure:'Provider acceptance is uncertain. Reconcile before retrying.'};
  return {status:'failed',ref:'',failure:'Provider rejected message (HTTP '+r.statusCode+').'};
}
function status(r, ref) {
  if (!ok(r) || r.json.data?.id !== ref || !['queued','sent','delivered','read','failed'].includes(r.json.data.status)) return null;
  return {status:r.json.data.status==='queued'?'accepted':r.json.data.status,ref,failure:r.json.data.status==='failed'?'Provider delivery failed (code '+String(r.json.data.errorCode||'unknown').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,40)+').':'',deliveredAt:r.json.data.deliveredAt};
}
export {headers,url,get,ok,discover,mapping,validateTemplate,preflight,classify,status};
