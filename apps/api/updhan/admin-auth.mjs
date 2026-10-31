import {scrypt as derive,timingSafeEqual,randomBytes} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(derive);
export async function hashUpdhanAdminPassword(password){if(typeof password!=='string'||password.length<16||password.length>256)throw Error('Password must contain 16–256 characters');const salt=randomBytes(16).toString('hex'),key=await scrypt(password,salt,64);return `scrypt:${salt}:${key.toString('hex')}`;}
// Explicit named identities only. No fixture, fallback password, remote request
// or Ayambil credential mutation. Password hashing stays outside configuration logs.
export function createUpdhanAdminAuthenticator(identities){
 if(!Array.isArray(identities)||!identities.length||identities.some(a=>!a.id||!a.email||!/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(a.passwordHash)||!Array.isArray(a.roles)||a.roles.some(r=>!['updhan_admin','updhan_health','updhan_documents'].includes(r))))throw Error('Named Updhan identities required');
 return async(email,password)=>{const a=identities.find(v=>v.email.toLowerCase()===email),hash=a?.passwordHash||identities[0].passwordHash,[,salt,expected]=hash.split(':');const key=await scrypt(password,salt,64);return a&&!a.disabled&&timingSafeEqual(key,Buffer.from(expected,'hex'))?{id:a.id,roles:[...a.roles]}:null;};
}
