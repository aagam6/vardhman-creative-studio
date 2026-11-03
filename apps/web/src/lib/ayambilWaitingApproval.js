// Reuse the authenticated single-group transaction. Never retry a mutation.
export function waitingApprovalPlan(items) {
  if (!Array.isArray(items) || !items.length || items.length > 1000) throw new Error('Choose 1–1000 waiting groups.');
  if (new Set(items.map(b => b.id)).size !== items.length || items.some(b => !b.id || b.status !== 'waiting' || !b.number?.startsWith('WAIT26-') || !b.attendees?.length)) throw new Error('Refresh and select waiting groups only.');
  const dates = new Set(items.map(b => b.eventDate));
  if (dates.size !== 1 || !['2026-11-02', '2026-11-03'].includes(items[0].eventDate)) throw new Error('Choose one evening before bulk approval.');
  return {eventDate: items[0].eventDate, persons: items.reduce((n, b) => n + b.attendees.length, 0), items: items.map(b => ({id:b.id, number:b.number, contactName:b.contactName, persons:b.attendees.length}))};
}

export async function collectWaitingApprovalPlan(request, filters) {
  if (!['2026-11-02', '2026-11-03'].includes(filters.date)) throw new Error('Choose one evening before selecting all pages.');
  const items = [];
  for (let page = 1; page <= 20; page++) {
    const result = await request('admin/bookings', {query:{search:filters.search || '', date:filters.date, status:'waiting', message:'', messageType:'', page}});
    if (result.page !== page || !Array.isArray(result.items) || result.items.some(b => b.eventDate !== filters.date)) throw new Error('Waiting list changed or returned an unexpected evening. Refresh before approval.');
    items.push(...result.items);
    if (!result.hasMore) return waitingApprovalPlan(items);
  }
  throw new Error('More than 1000 waiting groups; select a smaller scope.');
}

export async function approveWaitingPlan(request, plan, onProgress = () => {}, shouldStop = () => false) {
  const results = [];
  for (const item of plan.items) {
    if (shouldStop()) break;
    try {
      const saved = await request('admin/booking-controls/approve', {method:'POST', body:{id:item.id}});
      if (!saved?.number?.startsWith('BOOK26-')) throw new Error('Unconfirmed approval response');
      results.push({...item, state:'approved', bookingNumber:saved.number});
    } catch (error) {
      results.push({...item, state:[400,401,403,404,409,429].includes(error.status)?'blocked':'unconfirmed', reason:error.status===409?'Capacity or current-state conflict. Refresh and check the group.':error.status===401||error.status===403?'Administrator session requires confirmation.':error.status===429?'Application rate limit reached. Stop and refresh later.':'Approval not confirmed. Refresh the group before any further action.'});
      onProgress([...results]);
      break;
    }
    onProgress([...results]);
  }
  return {results, remaining:plan.items.slice(results.length)};
}
