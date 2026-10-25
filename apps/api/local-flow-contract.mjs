// Exercises the unchanged real provider serializer/parser with in-memory HTTP responses.
// No caller-supplied fetcher, process environment, credentials or network fallback.
import {createFlow} from './vardhmanflow.mjs';
const branded=new WeakSet();
export const isLocalFlow=flow=>branded.has(flow);
export function createLocalFlowContract(){
 const requests=[],responses=[];
 const flow=createFlow({VARDHMAN_FLOW_API_KEY:'synthetic-only',VARDHMAN_FLOW_API_SECRET:'synthetic-only',AYAMBIL_WHATSAPP_ENABLED:'true'},async(url,options)=>{
  const statusRead=options.method==='GET'&&/^https:\/\/vardhmanflow\.com\/api\/v1\/messages\/status\/[a-zA-Z0-9_-]+$/.test(url);
  if(!statusRead&&(url!=='https://vardhmanflow.com/api/v1/messages/template'||options.method!=='POST'))throw Error('Only mocked template/status endpoint allowed');
  requests.push(statusRead?{statusRead:true,id:url.split('/').at(-1)}:JSON.parse(options.body));
  const next=responses.shift()||(statusRead?{status:200,body:{success:true,data:{id:url.split('/').at(-1),status:'sent'}}}:{status:200,body:{success:true,data:{messageId:'mock-'+requests.length,status:'queued'}}});
  if(next instanceof Error)throw next;
  return new Response(typeof next.body==='string'?next.body:JSON.stringify(next.body),{status:next.status,headers:{'Content-Type':next.contentType||'application/json'}});
 });
 branded.add(flow);return {flow,requests,responses,actualNetworkCalls:0};
}
