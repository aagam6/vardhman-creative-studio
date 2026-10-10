// Read-only account/template inspection; never sends a WhatsApp message.
import {createRequire} from 'node:module';
const flow=createRequire(import.meta.url)('../apps/pocketbase/pb_hooks/ayambil/vardhmanflow.cjs');
const env=key=>process.env[key]||'';
if (!env('AYAMBIL_FLOW_API_KEY') || !env('AYAMBIL_FLOW_API_SECRET')) {
  console.error('Missing server environment: AYAMBIL_FLOW_API_KEY, AYAMBIL_FLOW_API_SECRET. No authenticated request made.');
  process.exitCode=1;
} else {
  try {
    let prefix;
    for (const candidate of ['/api/v1','/api/v1/api/v1']) {
      const response=await fetch(flow.url(candidate,'account'),{headers:flow.headers(env),redirect:'error',signal:AbortSignal.timeout(15000)});
      let json;try {json=await response.json();} catch {json={};}
      if(response.ok && json.success===true && json.data?.channel?.id) {
        if(env('AYAMBIL_FLOW_CHANNEL_ID') && json.data.channel.id!==env('AYAMBIL_FLOW_CHANNEL_ID'))throw new Error('Channel mismatch');
        if(json.data.channel.isActive!==true || json.data.channel.healthStatus!=='healthy')throw new Error('Channel is not healthy');
        prefix=candidate;break;
      }
      if(response.status!==404)throw new Error('Account not verified');
    }
    if(!prefix)throw new Error('Account not verified');
    const response=await fetch(flow.url(prefix,'templates?status=APPROVED'),{headers:flow.headers(env),redirect:'error',signal:AbortSignal.timeout(15000)});
    const json=await response.json();if(!response.ok||json.success!==true||!Array.isArray(json.data))throw new Error('Templates not verified');
    console.log('Authenticated healthy account verified; AYAMBIL_FLOW_API_PREFIX='+prefix);
    // Do not print account identifiers, phones, credentials, bodies, or parameter examples.
    console.log(JSON.stringify(json.data.map(t=>({name:t.name,language:t.language,status:t.status,bodySchemaAvailable:Array.isArray(t.components)})),null,2));
    for(const day of ['02','03']) {
      const template=json.data.find(t=>t.name===env('AYAMBIL_FLOW_TEMPLATE_'+day)&&t.language===env('AYAMBIL_FLOW_LANGUAGE_'+day));
      try {flow.validateTemplate(template,env,day);console.log('Evening '+day+': configured mapping verified.');}
      catch {console.log('Evening '+day+': approved name/language/body schema and ordered mapping still require verification.');}
    }
  } catch {console.error('Authenticated provider inspection failed. Check credentials, channel binding, endpoint and provider availability. No messages were sent.');process.exitCode=1;}
}
