import config from '../_shared/programme.json' with {type:'json'};
import {createHandler} from '../_shared/handler.mjs';
const env=(key:string)=>Deno.env.get(key)||'';

async function rpc(operation:string,body:unknown={},actor:string|null=null) {
  const fixture=operation==='admin/test-register';
  const response=await fetch(env('SUPABASE_URL')+'/rest/v1/rpc/'+(fixture?'ayambil_test_register_fixture':'ayambil_test_api'),{
    method:'POST',headers:{apikey:env('SUPABASE_SERVICE_ROLE_KEY'),Authorization:'Bearer '+env('SUPABASE_SERVICE_ROLE_KEY'),'Content-Type':'application/json'},
    body:JSON.stringify(fixture?{p_body:body,p_actor:actor}:{p_operation:operation,p_body:body,p_actor:actor}),signal:AbortSignal.timeout(15000)
  });
  if(!response.ok)throw new Error('Database operation failed');
  return await response.json();
}
async function user(token:string) {
  const response=await fetch(env('SUPABASE_URL')+'/auth/v1/user',{
    headers:{apikey:env('AYAMBIL_SUPABASE_PUBLISHABLE_KEY'),Authorization:'Bearer '+token},signal:AbortSignal.timeout(10000)
  });
  if(!response.ok)throw new Error('Authentication failed');
  const data=await response.json();if(typeof data.id!=='string')throw new Error('Authentication failed');return data.id;
}
async function send(options:{url:string;method:string;headers:Record<string,string>;body?:string;timeout:number}) {
  const response=await fetch(options.url,{method:options.method,headers:options.headers,body:options.body,redirect:'error',signal:AbortSignal.timeout(options.timeout*1000)});
  let json;try{json=await response.json();}catch{json={};}return {statusCode:response.status,json};
}
Deno.serve(createHandler({env,rpc,user,send,config}));
