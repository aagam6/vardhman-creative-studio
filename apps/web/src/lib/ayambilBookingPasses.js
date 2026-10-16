export function downloadableBookingPasses(booking) {
  if (booking?.status !== 'active') return [];
  const seen = new Set();
  return (booking.attendees || []).filter(a=>a.status==='active').flatMap(a=>a.passes || []).filter(p=>{
    if (p.status!=='active' || p.trashedAt || !p.number || seen.has(p.number)) return false;
    seen.add(p.number);return true;
  });
}

export function cancelledListBooking(booking) {
  return {...booking,attendees:booking.attendees.map(a=>({...a,passes:a.passes.filter(p=>!p.trashedAt)})).filter(a=>a.passes.some(p=>p.status==='cancelled'))};
}
