import {programme,ApiError} from './config.mjs';
import {productionSnapshotsApproved} from './production-template-policy.mjs';
export function reminderPolicy(env){
 if(env.AYAMBIL_WHATSAPP_REMINDER_SCHEDULER_ENABLED!=='true'||env.AYAMBIL_WHATSAPP_ENABLED!=='true'||env.AYAMBIL_WHATSAPP_QUEUE_OWNER!=='express-mysql'||!productionSnapshotsApproved(env))throw new ApiError(403,'Approved reminder-only scheduler required');
}
// Event-specific reminder windows end at the previous calendar day's midnight IST.
// No next-day catch-up and no sends at module import/startup.
export function dueReminderSession(now=new Date()){
 const time=new Date(now).getTime();
 return programme.sessions.find(session=>{const eventMidnight=Date.parse(session.date+'T00:00:00+05:30');return time>=reminderStartsAt(session.date) && time<eventMidnight;}) || null;
}
// Only Sairam's 2 November window moves to 16:00 IST; Manan stays unchanged.
export function reminderStartsAt(eventDate){return Date.parse(eventDate+'T00:00:00+05:30')-(eventDate==='2026-11-03'?8:6)*3600000;}
export function startReminderScheduler(queue,env,{schedule=setInterval,cancel=clearInterval,log=()=>{},now=()=>new Date()}={}){
 if(env.AYAMBIL_WHATSAPP_REMINDER_SCHEDULER_ENABLED!=='true')return {enabled:false,active:false,stop(){}};
 reminderPolicy(env);if(!queue)throw Error('Reminder queue required');
 let running=false,stopped=false;const stop=()=>{stopped=true;cancel(timer);};
 const tick=async()=>{if(running||stopped||!dueReminderSession(now()))return;running=true;try{const result=await queue.runScheduledReminder();if(['failed','preflight_failed','uncertain'].includes(result.status)){log('Scheduled reminder worker paused: operator review required.');stop();}}catch{log('Scheduled reminder worker paused: operation unavailable.');stop();}finally{running=false;}};
 const timer=schedule(tick,15000);
 return {enabled:true,get active(){return !stopped;},stop};
}
