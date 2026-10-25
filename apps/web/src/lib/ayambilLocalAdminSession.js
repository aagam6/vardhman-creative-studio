// Only the loopback disposable runner exposes this capability-login endpoint.
// Production continues to use the existing secure admin session unchanged.
export async function restoreAdminSession(api,win=window,transport=fetch){
 if(import.meta.env?.PROD!==true&&win.location.protocol==='http:'&&win.location.hostname==='127.0.0.1'&&/^[a-f0-9]{64}$/.test(win.location.hash.slice(1))){
  const key=win.location.hash.slice(1);win.history.replaceState(null,'',win.location.pathname+win.location.search);
  const response=await transport('/api/local-fixture/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({key})});
  if(!response.ok)throw Error('Local fixture sign-in unavailable');
 }
 return api.restore();
}
