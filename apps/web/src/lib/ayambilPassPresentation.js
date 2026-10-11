import { organisers, invitingOrganisations, mananBeneficiaries } from './ayambilOfficialCredits.js';
// Display-only metadata. Approved saved beneficiary/organiser snapshots take
// precedence; populate date-specific defaults only after organiser confirmation.
export const ayambilPassCredits = {
  '2026-11-02': { labharthi: mananBeneficiaries, aayojak: organisers, nimantrak: invitingOrganisations },
  '2026-11-03': { labharthi: organisers, aayojak: organisers, nimantrak: invitingOrganisations },
};

export function passCredits(pass) {
  const defaults = pass.sessions.length === 1 ? ayambilPassCredits[pass.sessions[0].date] : null;
  return { labharthi: pass.labharthi || defaults?.labharthi || null, aayojak: pass.aayojak || defaults?.aayojak || null, nimantrak: pass.nimantrak || defaults?.nimantrak || null };
}

// Wording supplied by the organiser in the pass redesign request.
export const digitalPassTerms = [
  ['Only for the printed evening and date.', 'પાસ પરની સાંજ અને તારીખ માટે જ.'],
  ['One pass, one registered attendee.', 'એક પાસ, એક રજિસ્ટર્ડ વ્યક્તિ.'],
  ['Show your pass at entry.', 'પ્રવેશ વખતે પાસ બતાવો.'],
  ['Free registration. Do not pay for this pass.', 'રજિસ્ટ્રેશન ફ્રી છે. પાસ માટે પૈસા આપશો નહીં.'],
  ['Entry/seating depend on venue capacity and organiser arrangements.', 'પ્રવેશ અને બેઠક સ્થળની ક્ષમતા અને આયોજકોની વ્યવસ્થા મુજબ.'],
  ['Follow organiser and venue instructions.', 'આયોજકો અને સ્થળની સૂચનાઓ પાળો.'],
  ['Cancel, correct or reissue through the authorised process.', 'પાસ રદ કરવા, સુધારવા કે નવો લેવા અધિકૃત પ્રક્રિયા વાપરો.'],
  ['Keep private download links out of public sharing.', 'ખાનગી ડાઉનલોડ લિંક જાહેરમાં શેર ન કરો.'],
];
