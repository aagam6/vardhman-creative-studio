export function dashboardMetrics(bookings) {
  return {
    bookings: bookings.length,
    active: bookings.filter(b => b.status === 'active').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    attendees: bookings.filter(b => b.status === 'active').reduce((count,b) => count + b.attendees.filter(a => a.status === 'active').length,0),
  };
}
