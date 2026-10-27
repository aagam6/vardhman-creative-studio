export const bookingMessageTypes = [['confirmation', 'Confirmation'], ['pass', 'Pass PDF link'], ['reminder', 'Reminder']];
export function bookingMessageStates(booking) {
  const history = booking.whatsapp?.history;
  const primary=booking.status==='waiting'?[['waiting_received','Waiting acknowledgement']]:bookingMessageTypes;
  const extra=[...new Set((history||[]).map(x=>x.type))].filter(type=>!primary.some(p=>p[0]===type)).map(type=>[type,({attendance:'Attendance response',booking_verify:'Duplicate verification',entry_timing:'Entry timing'})[type]||type]);
  return [...primary,...extra].map(([type, label]) => {
    const entries = (history || []).filter(entry => entry.type === type);
    const counts = {};
    for (const entry of entries) counts[entry.status] = (counts[entry.status] || 0) + 1;
    const pending = entries.filter(entry => ['held','ready','processing','queued','preparing','sending','uncertain'].includes(entry.status)).length;
    const text = entries.length ? Object.entries(counts).map(([status, n]) => `${status}${n > 1 ? ` ×${n}` : ''}`).join(', ') : history ? 'Not queued' : 'Status unavailable';
    const canSend = booking.status === 'waiting' || booking.status === 'active' && booking.attendees?.some(a => a.status === 'active' && a.passes?.some(p => p.status === 'active' && !p.trashedAt));
    const eligiblePending = canSend ? pending : 0;
    return {type, label, text, pending: eligiblePending, blocked: !canSend && pending > 0, review: entries.some(entry => ['failed','uncertain','preparing','sending'].includes(entry.status) || (entry.status === 'queued' && Number(entry.attempts) > 0))};
  });
}
