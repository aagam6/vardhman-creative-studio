import {createHmac,timingSafeEqual} from 'node:crypto';
import {passExpiresAt} from './pass-expiry.mjs';
const pattern=/^B1\.([a-f0-9-]{36})\.(\d{13})\.([a-f0-9]{64})$/;
function signature(secret,value){
 if(!/^[a-f0-9]{64}$/.test(secret||''))throw Error('Booking link signing unavailable');
 const key=createHmac('sha256',Buffer.from(secret,'hex')).update('ayambil-booking-pass-link-v1').digest();
 return createHmac('sha256',key).update(value).digest('hex');
}
export function bookingPassToken(secret,bookingId,session){
 if(!/^[a-f0-9-]{36}$/.test(bookingId||''))throw Error('Invalid booking');
 const value=`B1.${bookingId}.${passExpiresAt(session).getTime()}`;
 return `${value}.${signature(secret,value)}`;
}
export function verifyBookingPassToken(secret,token,now=Date.now()){
 const match=typeof token==='string'&&token.match(pattern);
 if(!match||Number(match[2])<=now)throw Error('Booking link unavailable');
 const expected=signature(secret,token.slice(0,token.lastIndexOf('.')));
 if(!timingSafeEqual(Buffer.from(expected,'hex'),Buffer.from(match[3],'hex')))throw Error('Booking link unavailable');
 return match[1];
}
