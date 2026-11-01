// Public programme dates supplied by the organizer/user, 1 November 2026.
// Display only: this does not open admission or approve backend option policy.
// Eighteen-day completions count the entry date as day one.
export const updhanSchedule=[
 {start:'2027-04-25',end:'2027-06-12'},
 {start:'2027-04-25',end:'2027-05-30'},
 {start:'2027-04-25',end:'2027-05-23'},
 {start:'2027-04-25',end:'2027-05-12'},
 {start:'2027-05-13',end:'2027-05-30'},
 {start:'2027-05-31',end:null},
];
export function formatProgrammeDate(date,language='hi'){
 if(!date)return '';
 return new Intl.DateTimeFormat({hi:'hi-IN',gu:'gu-IN',en:'en-IN'}[language]||'hi-IN',{day:'numeric',month:'long',year:'numeric',weekday:'long',timeZone:'Asia/Kolkata'}).format(new Date(date+'T12:00:00+05:30'));
}
