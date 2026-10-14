export function withPrimaryParticipant(booking) {
  return {...booking,attendees:booking.attendees.map((attendee,index)=>index===0?{...attendee,fullName:booking.contactName}:attendee)};
}
