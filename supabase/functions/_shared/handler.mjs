import {validateBooking,assertTarget,allowedOrigin,messagePayload} from './contracts.mjs';
import * as flow from './vardhmanflow.mjs';

// Injectable HTTP/DB interfaces let local tests exercise the actual request handler.
export function createHandler({env,rpc,user,send,config}) {
  return async req => {
    const origin=req.headers.get('origin');
    const cors=origin && allowedOrigin(origin,env)?{'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS'}:{};
    const reply=(code,data)=>new Response(JSON.stringify(data),{status:code,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
    if(origin && !allowedOrigin(origin,env))return reply(403,{error:'Origin not allowed'});
    if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
    if(req.method!=='POST')return reply(405,{error:'POST required'});
    try {assertTarget(env);}catch{return reply(503,{error:'Test backend configuration required'});}
    let operation,body;
    try {if(Number(req.headers.get('content-length'))>1048576) return reply(413,{error:'Request too large'});
      const reader=req.body?.getReader();const chunks=[];let size=0;
      if(reader){while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>1048576){await reader.cancel();return reply(413,{error:'Request too large'});}chunks.push(value);}}
      const joined=new Uint8Array(size);let offset=0;for(const c of chunks){joined.set(c,offset);offset+=c.length;}
      const parsed=JSON.parse(new TextDecoder().decode(joined));operation=parsed.operation;body=parsed.body||{};
    }catch{return reply(400,{error:'Invalid request'});}
    if(!['status','register','download','admin-check','admin/bookings','admin/change','admin/whatsapp-retry','admin/test-register','worker'].includes(operation))return reply(404,{error:'Operation unavailable'});
    try {
      if(operation==='status')return reply(200,{ready:true,open:false,whatsapp:'test_backend'});
      if(operation==='worker') {
        const secret=env('AYAMBIL_WORKER_SECRET');
        // Worker secret is never sent by a browser or exposed by status/config RPCs.
        const supplied=req.headers.get('authorization')||'';
        const hash=async v=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)));
        const [left,right]=await Promise.all([hash(supplied),hash('Bearer '+secret)]);
        let mismatch=0;for(let i=0;i<left.length;i++)mismatch|=left[i]^right[i];
        if(!secret || secret.length<32 || mismatch)return reply(401,{error:'Worker access required'});
        if(env('AYAMBIL_TEST_WHATSAPP_SEND_ENABLED')!=='true')return reply(403,{error:'Test sending disabled'});
        // No messages are claimed until both real templates and channel pass checks.
        await flow.preflight(send,env);
        const records=await rpc('poll-list',{});
        for(const row of records){try{const response=await flow.get(send,env,env('AYAMBIL_FLOW_API_PREFIX'),'messages/status/'+encodeURIComponent(row.ref));const result=flow.status(response,row.ref);if(result)await rpc('poll-result',{id:row.id,...result});}catch{/* preserve last confirmed status */}}
        // One job per invocation keeps work bounded within Edge Function runtime limits.
        const job=await rpc('claim',{});if(!job)return reply(200,{processed:0});
        let result;
        try {
          const recipients=JSON.parse(env('AYAMBIL_TEST_RECIPIENTS_JSON')||'[]');
          if(!Array.isArray(recipients)||!recipients.includes(job.booking.mobile))result={status:'failed',ref:'',failure:'Recipient not authorized for test messaging.'};
          else {
            const payload=messagePayload(job.booking,job.links,env,config,flow.mapping);
            result=flow.classify(await send({url:flow.url(env('AYAMBIL_FLOW_API_PREFIX'),'messages/template'),method:'POST',timeout:20,headers:flow.headers(env),body:JSON.stringify(payload)}));
          }
        }catch{result={status:'uncertain',ref:'',failure:'Provider response unknown. Reconcile before retry.'};}
        await rpc('send-result',{id:job.id,attemptId:job.attemptId,...result});
        return reply(200,{processed:1,status:result.status});
      }
      let actor=null;
      if(operation.startsWith('admin')){
        const token=(req.headers.get('authorization')||'').replace(/^Bearer /,'');
        if(!token)return reply(401,{error:'Administrator sign-in required'});
        try {actor=await user(token);await rpc('admin-check',{},actor);}catch{return reply(403,{error:'Enabled administrator required'});}
      }
      // Report the closed gate even before optional test credentials are set.
      if(operation==='register' && env('AYAMBIL_TEST_REGISTRATION_OPEN')!=='true')return reply(403,{error:'Test registration closed'});
      if(!env('AYAMBIL_RATE_LIMIT_SALT'))return reply(503,{error:'Test backend configuration required'});
      const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(env('AYAMBIL_RATE_LIMIT_SALT')+':'+operation+':'+(actor||'public')));
      const bucket=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
      const limit=await rpc('limit',{bucket});if(!limit.allowed)return reply(429,{error:'Too many requests; try later'});
      if(operation==='register' || operation==='admin/test-register'){
        // Unconditional test-only gate; existing production flags are never read.
        if(operation==='register' && env('AYAMBIL_TEST_REGISTRATION_OPEN')!=='true')return reply(403,{error:'Test registration closed'});
        try{body=validateBooking(body,config);}catch{return reply(400,{error:'Check names, WhatsApp number, one or two attendees, selected evening and both consents. / નામ, WhatsApp નંબર, એક કે બે વ્યક્તિઓ, સાંજનો કાર્યક્રમ અને બંને મંજૂરી ચકાસો.'});}
      }
      const result=await rpc(operation,body,actor);
      return reply(200,result);
    }catch{
      // Never include SQL errors, raw provider responses, tokens, request body or PII.
      return reply(operation==='download'?404:operation==='worker'?503:400,{error:operation==='download'?'Pass download unavailable':'Request could not be confirmed; review and retry safely'});
    }
  };
}
