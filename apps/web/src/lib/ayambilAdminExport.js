export async function collectAttendeeCsv(request,filters={}) {
 const rows=[['Booking number','Contact name','Mobile','Attendee name','Evening dates','Registration status','Current pass number','Pass status','Registered at']];
 let page=1,more=true;
 while(more){
  const result=await request('admin/bookings',{query:{...filters,page}});
  if(result.page!==page)throw new Error('Invalid export pagination response');
  result.items.forEach(b=>b.attendees.filter(a=>!filters.date||a.dates.includes(filters.date)).forEach(a=>{
   const pass=a.passes.find(p=>p.status!=='superseded');
   rows.push([b.number,b.contactName,b.mobile,a.fullName,a.dates.join(' / '),a.status,pass?.number||'',pass?.status||'',b.created]);
  }));
  more=result.hasMore;if(more&&++page>100000)throw new Error('Export pagination limit reached');
 }
 return rows;
}
