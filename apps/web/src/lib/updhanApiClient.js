import {updhanCampaignMemory} from './updhanMarketing.js';
export const connectedLocalApi = !!(import.meta.env?.DEV && import.meta.env?.VITE_UPDHAN_LOCAL_API === 'true' && typeof window !== 'undefined' && window.location.hostname === '127.0.0.1');
export function createUpdhanApiClient({fetchImpl=fetch,timeoutMs=15000}={}) {
 let csrf='';
 async function request(path,{method='GET',body}={}){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
  const response=await fetchImpl(`/api/updhan${path}`,{signal:controller.signal,method,credentials:'same-origin',cache:'no-store',headers:{...(body?{'Content-Type':'application/json'}:{}),...(csrf&&method==='POST'?{'X-CSRF-Token':csrf}:{})},...(body?{body:JSON.stringify(body)}:{})});
  if(!response.headers.get('content-type')?.includes('application/json'))throw new Error('Local API returned an invalid response');
  const payload=await response.json();if(!response.ok){const error=new Error(payload.error||'Local API unavailable');error.status=response.status;throw error;}
  return payload;
  }finally{clearTimeout(timer);}
 }
 async function authenticate(path,options){const payload=await request(path,options);if(payload.authenticated!==true||payload.localMockIdentity!==true||!/^[a-f0-9]{64}$/.test(payload.csrfToken||''))throw new Error('Invalid local operator session');csrf=payload.csrfToken;return payload;}
 return {
  async submit({key,data,photo}){
   const bytes=new Uint8Array(await photo.arrayBuffer());let binary='';for(const b of bytes)binary+=String.fromCharCode(b);
   const receipt=await request('/register',{method:'POST',body:{key,data,photo:{mime:photo.type,base64:btoa(binary)},attribution:updhanCampaignMemory.get()}});
   if(typeof receipt.id!=='string'||!/^[A-Z0-9-]{6,40}$/.test(receipt.reference||'')||receipt.demo!==true||receipt.database!=='disposable-mysql')throw new Error('Invalid local submission receipt');
   return receipt;
  },
  async mockReceiptPdf({id,key,reference,pdf,language}){
   const encoded=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=reject;reader.readAsDataURL(pdf);});
   const result=await request('/register/mock-whatsapp',{method:'POST',body:{id,key,reference,pdf:encoded,language}});
   if(result.mock!==true||result.state!=='mock_submitted'||result.reference!==reference||result.document?.mime!=='application/pdf')throw new Error('Invalid mock document response');return result;
  },
  status:()=>request('/status'),readiness:()=>request('/admin/readiness'),session:()=>authenticate('/admin/session'),login:()=>authenticate('/admin/local-login',{method:'POST',body:{}}),
  logout:async()=>{const result=await request('/admin/logout',{method:'POST',body:{}});csrf='';return result;},
  list:filters=>request(`/admin/applications?${new URLSearchParams(filters)}`),detail:id=>request(`/admin/application/${encodeURIComponent(id)}`),
  history:id=>request(`/admin/history/${encodeURIComponent(id)}`),change:body=>request('/admin/change',{method:'POST',body}),
  async documentPdf(id){
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
   try{const response=await fetchImpl(`/api/updhan/admin/document/${encodeURIComponent(id)}`,{credentials:'same-origin',cache:'no-store',signal:controller.signal});
    if(!response.ok){const error=new Error('PDF unavailable. Reload the dashboard and try again.');error.status=response.status;throw error;}
    if(!response.headers.get('content-type')?.startsWith('application/pdf'))throw new Error('Invalid PDF response');
    const blob=await response.blob();if(!blob.size||blob.size>6291456)throw new Error('Invalid PDF size');return blob;
   }finally{clearTimeout(timer);}
  },
  outbox:()=>request('/admin/outbox'),mockCalls:()=>request('/admin/mock-calls'),
  ayambilSession:()=>request('/admin/ayambil-readonly/session'),
  ayambilLogin:body=>request('/admin/ayambil-readonly/login',{method:'POST',body}),
  ayambilDisconnect:()=>request('/admin/ayambil-readonly/disconnect',{method:'POST',body:{}}),
  ayambilBookings:page=>request(`/admin/ayambil-readonly/bookings?page=${page}`),
  mockDecision:body=>request('/admin/mock-decision',{method:'POST',body}),
  mockSend:body=>request('/admin/mock-send',{method:'POST',body}),mockDelivery:body=>request('/admin/mock-delivery',{method:'POST',body}),
 };
}
