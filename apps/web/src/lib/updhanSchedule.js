// Public programme dates supplied by the organizer/user, 29 October 2026.
// Display only: this does not open admission or approve backend option policy.
// Eighteen-day completions count the entry date as day one.
export const updhanSchedule=[
 {start:'2027-04-26',end:'2027-06-14'},
 {start:'2027-04-26',end:'2027-05-31'},
 {start:'2027-04-26',end:'2027-05-24'},
 {start:'2027-04-26',end:'2027-05-13'},
 {start:'2027-05-15',end:'2027-06-01'},
 {start:'2027-06-01',end:'2027-06-13'},
];
export function formatProgrammeDate(date,language='hi'){
 return new Intl.DateTimeFormat({hi:'hi-IN',gu:'gu-IN',en:'en-IN'}[language]||'hi-IN',{day:'numeric',month:'long',year:'numeric',weekday:'long',timeZone:'Asia/Kolkata'}).format(new Date(date+'T12:00:00+05:30'));
}
