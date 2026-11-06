import {UpdhanError} from './errors.mjs';
export const updhanToday=(now=new Date())=>new Date(now.getTime()+330*60000).toISOString().slice(0,10);
// Application timestamps are UTC; date filters and today's count use India.
export function updhanDayBounds(day){
 if(typeof day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(day))throw new UpdhanError(400,'Invalid date');
 const date=new Date(day+'T00:00:00Z');
 if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==day)throw new UpdhanError(400,'Invalid date');
 const start=new Date(date.getTime()-330*60000);
 const sql=d=>d.toISOString().slice(0,19).replace('T',' ');
 return {start:sql(start),end:sql(new Date(start.getTime()+86400000))};
}
