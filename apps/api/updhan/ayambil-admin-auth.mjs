import {createHash,scrypt as derive,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(derive);
const fingerprint=value=>createHash('sha256').update(value).digest('hex').slice(0,24);
// The injected identity pool needs SELECT on ayambil_admins only. Never calls
// Ayambil login/logout, creates its sessions, changes passwords or writes its DB.
export function createAyambilBackedUpdhanAuthenticator({identityPool}) {
 if(typeof identityPool?.execute!=='function')throw Error('Explicit read-only identity pool required');
 const authenticate=async(email,password)=>{
  if(typeof email!=='string'||typeof password!=='string'||email.length>254||password.length>256)return null;
  const [[a]]=await identityPool.execute('SELECT id,password_hash,enabled FROM ayambil_admins WHERE email=?',[email.trim().toLowerCase()]);
  const parts=typeof a?.password_hash==='string'?a.password_hash.split(':'):[];
  const valid=parts.length===3&&parts[0]==='scrypt'&&/^[a-f0-9]{32}$/.test(parts[1])&&/^[a-f0-9]{128}$/.test(parts[2]);
  const candidate=await scrypt(password,valid?parts[1]:'0'.repeat(32),64);
  if(!valid||!timingSafeEqual(candidate,Buffer.from(parts[2],'hex'))||!a.enabled)return null;
  return {id:`ayambil:${a.id}:${fingerprint(a.password_hash)}`,roles:['updhan_admin']};
 };
 // Recheck on every protected request. Disabled/password-changed identities lose
 // Updhan access immediately, without touching any Ayambil session or account.
 authenticate.revalidate=async actor=>{
  const match=/^ayambil:([a-f0-9-]{36}):([a-f0-9]{24})$/.exec(actor?.id||'');
  if(!match)return false;
  const [[a]]=await identityPool.execute('SELECT password_hash,enabled FROM ayambil_admins WHERE id=?',[match[1]]);
  return !!a?.enabled&&fingerprint(a.password_hash)===match[2];
 };
 return authenticate;
}
