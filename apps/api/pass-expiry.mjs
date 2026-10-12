import {ApiError,programme} from './config.mjs';
// New/reissued capabilities last until 24 hours after their reviewed evening start.
export function passExpiresAt(session) {
  const reviewed=programme.sessions.find(s=>s.date===session?.date);
  if(!reviewed || reviewed.time!=='8:00 PM IST')throw new ApiError(503,'Reviewed pass expiry configuration required');
  return new Date(Date.parse(reviewed.date+'T20:00:00+05:30')+24*60*60*1000);
}
