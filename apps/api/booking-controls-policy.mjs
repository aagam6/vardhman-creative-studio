export function assertControlsConfiguration(config,pool){
 const actual=pool?.pool?.config?.connectionConfig;
 if(!actual||actual.host!==config.database?.host||actual.database!==config.database?.database||(config.database?.port&&actual.port!==config.database.port))throw Error('Booking control pool/config mismatch');
 if(config.disposable===true){if(actual.host!=='127.0.0.1'||!/^ayambil_test_[a-z0-9_]+$/.test(actual.database)||!/^http:\/\/127\.0\.0\.1:\d+$/.test(config.origin)||config.whatsappEnabled===true)throw Error('Disposable control safeguards required');return;}
 if(config.bookingControls!==true||config.bookingControlsProduction!==true||config.origin!=='https://vardhmancreativestudio.com'||!['127.0.0.1','localhost'].includes(actual.host)||actual.database.startsWith('ayambil_test_')||config.notificationDispatchEnabled!==false)throw Error('Explicit production controls and dispatch-off policy required');
}
export async function assertControlsReady(pool,config){
 const [[gate]]=await pool.execute('SELECT enabled FROM ayambil_booking_controls_release WHERE id=1');
 const [events]=await pool.execute('SELECT event_date,mode,capacity,approval_capacity_configured FROM ayambil_booking_controls ORDER BY event_date');
 await pool.execute('SELECT review_round,contact_key,communication_key FROM ayambil_family_reviews LIMIT 0');
 await pool.execute('SELECT dedupe_hash,state,context FROM ayambil_notification_intents LIMIT 0');
 await pool.execute('SELECT payload,status FROM ayambil_waiting LIMIT 0');
 await pool.execute('SELECT subject,action,detail FROM ayambil_control_audit LIMIT 0');
 await pool.execute('SELECT subject,kind,body FROM ayambil_notification_previews LIMIT 0');
 if(!gate?.enabled||events.length!==2||events.some(e=>!Number.isSafeInteger(Number(e.capacity))||Number(e.capacity)<0||!['open','waiting','closed'].includes(e.mode)||e.mode==='open'&&!e.approval_capacity_configured))return false;
 return config.disposable===true||events.every(e=>['2026-11-02','2026-11-03'].includes(e.event_date));
}
