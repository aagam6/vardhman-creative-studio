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
  ['Valid only for the selected evening and printed date.', 'પસંદ કરેલા સાંજના કાર્યક્રમ અને પાસ પરની તારીખ માટે જ છે.'],
  ['One pass is for one registered attendee.', 'એક પાસ એક રજિસ્ટર્ડ વ્યક્તિ માટે છે.'],
  ['Present your pass at entry.', 'પ્રવેશ વખતે તમારો પાસ બતાવો.'],
  ['Registration is free. Do not pay for this pass.', 'રજિસ્ટ્રેશન ફ્રી છે. આ પાસ માટે પૈસા આપશો નહીં.'],
  ['Entry and seating follow venue capacity and organiser arrangements.', 'પ્રવેશ અને બેઠક સ્થળની ક્ષમતા અને આયોજકોની વ્યવસ્થા મુજબ રહેશે.'],
  ['Follow organiser and venue instructions.', 'આયોજકો અને સ્થળની સૂચનાઓ મુજબ ચાલો.'],
  ['Cancellation, correction and reissue use the authorised process.', 'પાસ રદ કરવા, સુધારવા કે નવો મેળવવા અધિકૃત પ્રક્રિયા વાપરો.'],
  ['Do not share private pass download links publicly.', 'પાસની ખાનગી ડાઉનલોડ લિંક જાહેરમાં શેર કરશો નહીં.'],
];
