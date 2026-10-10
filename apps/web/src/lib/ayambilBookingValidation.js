export function validateBooking(booking, dates) {
  const validName = name => typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 120 && !/[\x00-\x1f<>]/.test(name);
  if (!validName(booking.contactName)) return 'Enter your full name (2–120 characters). / તમારું પૂરું નામ લખો (૨–૧૨૦ અક્ષર).';
  if (!/^\+[1-9]\d{7,14}$/.test(String(booking.mobile || '').replace(/[\s()-]/g, ''))) return 'Enter a WhatsApp number with country code, e.g. +91. / દેશના કોડ સાથે સાચો WhatsApp નંબર લખો, જેમ કે +91.';
  if (!dates.includes(booking.eventDate)) return 'Select an evening event. / સાંજનો કાર્યક્રમ પસંદ કરો.';
  if (booking.whatsappConsent !== true) return 'WhatsApp consent is required. / WhatsApp પર કન્ફર્મેશન અને પાસ મેળવવાની મંજૂરી આપો.';
  if (!Array.isArray(booking.attendees) || !booking.attendees.length) return 'Add at least one attendee. / ઓછામાં ઓછું એક નામ ઉમેરો.';
  if (booking.attendees.length > 2) return 'Maximum 2 attendees per booking. / એક રજિસ્ટ્રેશનમાં વધુમાં વધુ ૨ લોકોનાં નામ ઉમેરો.';
  if (booking.termsAccepted !== true) return 'Accept the pass terms. / પાસ માટેના નિયમો સ્વીકારો.';
  for (let i = 0; i < booking.attendees.length; i++) {
    const a = booking.attendees[i];
    if (!a || !validName(a.fullName)) return `Enter attendee ${i + 1}’s full name. / આવનાર વ્યક્તિ ${i + 1}નું પૂરું નામ લખો.`;
    if (!Array.isArray(a.dates) || a.dates.length !== 1 || a.dates[0] !== booking.eventDate) return `Attendee ${i + 1} must attend this evening. / વ્યક્તિ ${i + 1} માટે આ જ સાંજનો કાર્યક્રમ પસંદ કરો.`;
  }
  return '';
}
