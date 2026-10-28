export function notificationSettings(env){
 const enabled=env.AYAMBIL_NOTIFICATION_SERVICE_ENABLED==='true',dispatch=env.AYAMBIL_BILINGUAL_DISPATCH_ENABLED==='true';
 if(env.AYAMBIL_BILINGUAL_REMINDERS_ENABLED==='true'&&(!dispatch||env.AYAMBIL_BILINGUAL_WORKER_ENABLED!=='true'))throw Error('Reminders require the exclusive bilingual automatic sender');
 if(enabled&&env.AYAMBIL_BOOKING_CONTROLS_ENABLED!=='true')throw Error('Notification service requires booking-controls safety boundary');
 if(dispatch&&(!enabled||env.AYAMBIL_BOOKING_CONTROLS_ENABLED!=='true'||env.AYAMBIL_WHATSAPP_ENABLED!=='true'||env.AYAMBIL_BILINGUAL_DISPATCH_APPROVAL!=='reviewed-v1'||env.AYAMBIL_WHATSAPP_AUTO_WORKER_ENABLED==='true'||env.AYAMBIL_WHATSAPP_REMINDER_SCHEDULER_ENABLED==='true'||env.AYAMBIL_WHATSAPP_NORMAL_PROCESSING_APPROVED==='true'||env.AYAMBIL_WHATSAPP_MANUAL_PROCESSING_APPROVED==='true'))throw Error('Independent bilingual approval and exclusive queue ownership required');
 return {notificationService:enabled,notificationDispatch:dispatch};
}
