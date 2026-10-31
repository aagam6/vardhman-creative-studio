import {randomBytes,createHash,timingSafeEqual} from 'node:crypto';
import {UpdhanError} from './errors.mjs';
const hash=value=>createHash('sha256').update(value).digest('hex');
const parse=value=>typeof value==='string'?JSON.parse(value):value;
export function createSessionStore(pool,{lifetimeMs=3600000,now=()=>Date.now()}={}) {
 if(!Number.isInteger(lifetimeMs)||lifetimeMs<1||lifetimeMs>8*3600000)throw new Error('Invalid session lifetime');
 return {
  async issue(actor){
   if(typeof actor?.id!=='string'||!actor.id||!Array.isArray(actor.roles)||actor.roles.some(r=>!['updhan_admin','updhan_health','updhan_documents'].includes(r)))throw new Error('Invalid session actor');
   const token=randomBytes(32).toString('hex'),csrf=randomBytes(32).toString('hex');
   await pool.execute('INSERT INTO updhan_admin_sessions (token_hash,csrf_token,actor_id,roles,expires_at) VALUES (?,?,?,?,?)',[hash(token),csrf,actor.id,JSON.stringify(actor.roles),new Date(now()+lifetimeMs)]);
   return {token,csrf,lifetimeMs};
  },
  async read(token,csrf){
   if(!/^[a-f0-9]{64}$/.test(token||''))throw new UpdhanError(401,'Administrator sign-in required');
   const [[session]]=await pool.execute('SELECT actor_id,roles,csrf_token FROM updhan_admin_sessions WHERE token_hash=? AND revoked_at IS NULL AND expires_at>?',[hash(token),new Date(now())]);
   if(!session)throw new UpdhanError(401,'Administrator sign-in required');
   if(csrf!==undefined&&(!/^[a-f0-9]{64}$/.test(csrf)||!timingSafeEqual(Buffer.from(csrf),Buffer.from(session.csrf_token))))throw new UpdhanError(403,'Session confirmation required');
   return {actor:{id:session.actor_id,roles:parse(session.roles)},csrf:session.csrf_token};
  },
  async revoke(token){if(/^[a-f0-9]{64}$/.test(token||''))await pool.execute('UPDATE updhan_admin_sessions SET revoked_at=? WHERE token_hash=?',[new Date(now()),hash(token)]);},
  async revokeActor(id){await pool.execute('UPDATE updhan_admin_sessions SET revoked_at=? WHERE actor_id=? AND revoked_at IS NULL',[new Date(now()),id]);},
  async purgeExpired(){const [result]=await pool.execute('DELETE FROM updhan_admin_sessions WHERE expires_at<?',[new Date(now())]);return {removed:result.affectedRows};},
 };
}
