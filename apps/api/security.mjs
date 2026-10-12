import {randomBytes,scrypt as derive,timingSafeEqual,createHash,createHmac} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(derive);
export const capability=()=>randomBytes(32).toString('hex');
export const hash=value=>createHash('sha256').update(value).digest('hex');
export const rateHash=(secret,value)=>createHmac('sha256',secret).update(value).digest('hex');
export async function passwordHash(password) {
  if(typeof password!=='string'||password.length<12||password.length>256)throw new Error('Password must contain 12–256 characters');
  const salt=randomBytes(16).toString('hex');
  return `scrypt:${salt}:${(await scrypt(password,salt,64)).toString('hex')}`;
}
export async function passwordMatches(password,encoded) {
  if(typeof password!=='string'||password.length>256)return false;
  const parts=typeof encoded==='string'?encoded.split(':'):[];
  const valid=parts.length===3&&parts[0]==='scrypt'&&/^[a-f0-9]{32}$/.test(parts[1])&&/^[a-f0-9]{128}$/.test(parts[2]);
  // Still perform expensive work for unknown accounts; no fast user enumeration.
  const candidate=await scrypt(password,valid?parts[1]:'00000000000000000000000000000000',64);
  return valid&&timingSafeEqual(candidate,Buffer.from(parts[2],'hex'));
}
