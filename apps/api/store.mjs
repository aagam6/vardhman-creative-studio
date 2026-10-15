import {randomUUID} from 'node:crypto';
import {ApiError,bookingInput,programme} from './config.mjs';
import {capability,hash,passwordMatches} from './security.mjs';
import {attendeeContext} from './notification-context.mjs';
import {passExpiresAt} from './pass-expiry.mjs';
import {queueSummary} from './queue-summary.mjs';
import {isDeepStrictEqual} from 'node:util';
const json=value=>typeof value==='string'?JSON.parse(value):value;
export async function transaction(pool,action) {
  const db=await pool.getConnection();
  try {await db.beginTransaction();const result=await action(db);await db.commit();return result;}
  catch(error){await db.rollback();throw error;}finally{db.release();}
}
export function createStore(pool,config,{queue,adminRecipients=[]}={}) {
  const rows=async(db,sql,args=[])=> (await db.execute(sql,args))[0];
  const one=async(db,sql,args=[])=> (await rows(db,sql,args))[0];
  const issued=async(db,attendee,session)=>{
    const number='AYV26-'+randomUUID().replaceAll('-','').toUpperCase(),id=randomUUID(),key=capability();
    const revision=Number((await one(db,'SELECT COALESCE(MAX(revision),0)+1 AS revision FROM ayambil_passes WHERE attendee_id=?',[attendee.id])).revision);
    const snapshot={eventName:programme.eventName,attendeeName:attendee.full_name,number,sessions:[session],issuedAt:new Date().toISOString()};
    await rows(db,'INSERT INTO ayambil_passes(id,attendee_id,number,snapshot,revision) VALUES(?,?,?,?,?)',[id,attendee.id,number,JSON.stringify(snapshot),revision]);
    await rows(db,'INSERT INTO ayambil_capabilities(key_hash,pass_id,expires_at) VALUES(?,?,?)',[hash(key),id,passExpiresAt(session)]);
    return {key,pass:{...snapshot,status:'active'}};
  };
  const booking=async(db,id,privileged=false)=>{
    const b=await one(db,'SELECT * FROM ayambil_bookings WHERE id=?',[id]);if(!b)throw new ApiError(404,'Booking unavailable');
    const attendees=[];
    for(const a of await rows(db,'SELECT * FROM ayambil_attendees WHERE booking_id=? ORDER BY ordinal',[id])) {
      const passes=(await rows(db,'SELECT snapshot,status FROM ayambil_passes WHERE attendee_id=? ORDER BY revision',[a.id])).map(p=>({...json(p.snapshot),status:p.status}));
      attendees.push({...(privileged?{id:a.id}:{}),fullName:a.full_name,status:a.status,dates:[b.event_date],passes});
    }
    const whatsapp=privileged?(queue?queueSummary(await rows(db,'SELECT notification_type,status,attempts,updated_at FROM ayambil_message_queue WHERE booking_id=? ORDER BY updated_at',[id])):{status:'Queue not loaded (sending disabled)',attempts:null,history:[]}):undefined;
    return {...(privileged?{id:b.id,contactName:b.contact_name,mobile:b.mobile,occupation:b.occupation||'',referralSource:b.referral_source||''}:{}),number:b.number,status:b.status,eventDate:b.event_date,created:b.created_at,attendees,...(privileged?{whatsapp}: {})};
  };
  return {
    async ready(){const versions=await rows(pool,'SELECT version FROM ayambil_schema_version ORDER BY version');const events=await rows(pool,'SELECT event_date,snapshot FROM ayambil_events ORDER BY event_date');return JSON.stringify(versions.map(v=>Number(v.version)))==='[1,2]'&&events.length===2&&programme.sessions.every((s,index)=>events[index].event_date===s.date&&isDeepStrictEqual(json(events[index].snapshot),s));},
    async enqueueReminder(queue,bookingId){return transaction(pool,async db=>{
      const record=await one(db,'SELECT * FROM ayambil_bookings WHERE id=? FOR UPDATE',[bookingId]);if(!record||record.status!=='active'||!record.whatsapp_consent)throw new ApiError(409,'Active consented booking required');
      const attendees=await rows(db,"SELECT a.id,a.full_name,p.snapshot FROM ayambil_attendees a JOIN ayambil_passes p ON p.attendee_id=a.id WHERE a.booking_id=? AND a.status='active' AND p.status='active'",[bookingId]);if(!attendees.length)throw new ApiError(409,'Active saved pass required');
      const saved=json(attendees[0].snapshot),session=saved.sessions[0];if(Date.parse(session.date+'T20:00:00+05:30')<=Date.now())throw new ApiError(409,'Evening has already started');
      for(const attendee of attendees){const event=json(attendee.snapshot).sessions[0];await queue.enqueue(db,{bookingId,type:'reminder',dedupe:bookingId+':'+attendee.id+':'+event.date,context:attendeeContext(event,attendee.full_name,record.mobile)});}
    });},
    async enqueueTest(queue,item){return transaction(pool,async db=>{await queue.enqueue(db,item);return queue.testId(db,item.dedupe);});},
    async status(){const setting=await one(pool,'SELECT registration_open FROM ayambil_settings WHERE id=1');return {ready:true,open:config.registrationOpen&&!!setting?.registration_open,whatsapp:queue?'configured':'disabled'};},
    async limit(bucket,max){return transaction(pool,async db=>{const window=Math.floor(Date.now()/60000);await rows(db,'INSERT INTO ayambil_rate_limits(bucket,window_start,attempts) VALUES(?,?,1) ON DUPLICATE KEY UPDATE attempts=IF(window_start=VALUES(window_start),attempts+1,1),window_start=VALUES(window_start)',[bucket,window]);const result=await one(db,'SELECT attempts FROM ayambil_rate_limits WHERE bucket=? FOR UPDATE',[bucket]);return result.attempts<=max;});},
    async login(email,password){
      const a=await one(pool,'SELECT id,password_hash,enabled FROM ayambil_admins WHERE email=?',[email]);
      if(!await passwordMatches(password,a?.password_hash)||!a?.enabled)throw new ApiError(401,'Sign-in failed');
      const token=capability(),csrf=hash('ayambil-session-csrf:'+token);
      await rows(pool,'INSERT INTO ayambil_admin_sessions(token_hash,admin_id,csrf_hash,expires_at) VALUES(?,?,?,DATE_ADD(UTC_TIMESTAMP(3),INTERVAL 8 HOUR))',[hash(token),a.id,hash(csrf)]);
      return {token,csrf};
    },
    async session(token){if(!/^[a-f0-9]{64}$/.test(token||''))throw new ApiError(401,'Administrator sign-in required');const a=await one(pool,'SELECT s.admin_id,s.csrf_hash FROM ayambil_admin_sessions s JOIN ayambil_admins a ON a.id=s.admin_id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP(3) AND a.enabled=TRUE',[hash(token)]);if(!a)throw new ApiError(401,'Administrator sign-in required');return a;},
    async restoreSession(token){
      // Exact-origin POST plus a valid HttpOnly cookie permits a fresh CSRF
      // proof after reload. Stable per session so another tab cannot invalidate it.
      // It never extends the authenticated session expiry.
      await this.session(token);
      const csrf=hash('ayambil-session-csrf:'+token);
      await rows(pool,'UPDATE ayambil_admin_sessions SET csrf_hash=? WHERE token_hash=? AND expires_at>UTC_TIMESTAMP(3)',[hash(csrf),hash(token)]);
      return {authenticated:true,csrfToken:csrf};
    },
    async logout(token){await rows(pool,'DELETE FROM ayambil_admin_sessions WHERE token_hash=?',[hash(token)]);},
    async register(input){
      const body=bookingInput(input),requestHash=hash(body.requestKey);const {requestKey:ignored,...payload}=body;void ignored;const payloadHash=hash(JSON.stringify(payload));
      return transaction(pool,async db=>{
        if(!config.registrationOpen)throw new ApiError(403,'Registration closed');
        await rows(db,'INSERT INTO ayambil_idempotency(key_hash,payload_hash) VALUES(?,?) ON DUPLICATE KEY UPDATE key_hash=key_hash',[requestHash,payloadHash]);
        const previous=await one(db,'SELECT * FROM ayambil_idempotency WHERE key_hash=? FOR UPDATE',[requestHash]);
        if(previous.payload_hash!==payloadHash)throw new ApiError(409,'Submission identifier conflict');
        if(previous.booking_id)return booking(db,previous.booking_id);
        const setting=await one(db,'SELECT registration_open FROM ayambil_settings WHERE id=1 FOR UPDATE');if(!setting?.registration_open)throw new ApiError(403,'Registration closed');
        const event=await one(db,'SELECT snapshot FROM ayambil_events WHERE event_date=?',[body.eventDate]);if(!event)throw new ApiError(503,'Event configuration unavailable');
        const id=randomUUID(),number='BOOK26-'+randomUUID().replaceAll('-','').toUpperCase();
        await rows(db,'INSERT INTO ayambil_bookings(id,number,contact_name,mobile,event_date,whatsapp_consent,terms_version,terms_accepted_at,created_at) VALUES(?,?,?,?,?,TRUE,?,UTC_TIMESTAMP(3),UTC_TIMESTAMP(3))',[id,number,body.contactName,body.mobile,body.eventDate,'2026-10-14']);
        if(body.occupation || body.referralSource) await rows(db,'UPDATE ayambil_bookings SET occupation=?,referral_source=? WHERE id=?',[body.occupation,body.referralSource,id]);
        const links=[];
        for(const [index,a] of body.attendees.entries()) {
          const attendee={id:randomUUID(),full_name:a.fullName};
          await rows(db,'INSERT INTO ayambil_attendees(id,booking_id,full_name,ordinal) VALUES(?,?,?,?)',[attendee.id,id,a.fullName,index+1]);
          await rows(db,'INSERT INTO ayambil_registrations(attendee_id,booking_id,event_date) VALUES(?,?,?)',[attendee.id,id,body.eventDate]);
          links.push((await issued(db,attendee,json(event.snapshot))).key);
        }
        await rows(db,'UPDATE ayambil_idempotency SET booking_id=? WHERE key_hash=?',[id,requestHash]);
        await rows(db,'INSERT INTO ayambil_whatsapp_attempts(id,booking_id,created_at) VALUES(?,?,UTC_TIMESTAMP(3))',[randomUUID(),id]);
        // Raw links are returned only once, never stored. Same-key retries return
        // saved PDFs without rotating capabilities or issuing duplicate passes.
        const receipt={...await booking(db,id),downloadKeys:links};
        if(queue){
          const session=json(event.snapshot),context={eventName:programme.eventName,eventDate:session.date,time:session.time,performer:session.performer,programme:session.programme,venue:session.venue,contactName:body.contactName,attendeeCount:String(body.attendees.length),attendeeNames:body.attendees.map(a=>a.fullName).join(', ')};
          for(const [index,key] of links.entries()){
            const individual=attendeeContext(session,body.attendees[index].fullName,body.mobile);
            await queue.enqueue(db,{bookingId:id,type:'confirmation',dedupe:id+':'+index,context:individual});
            await queue.enqueue(db,{bookingId:id,type:'pass',dedupe:id+':'+index,context:{...individual,passLink:config.origin+'/500-akhand-ayambil-vijayollas/passes#'+key}});
          }
          for(const to of adminRecipients)await queue.enqueue(db,{bookingId:id,type:'admin',dedupe:id+':'+to,context:{...context,to}});
        }
        return receipt;
      });
    },
    async download(key){
      if(!/^[a-zA-Z0-9]{64}$/.test(key||''))throw new ApiError(404,'Pass download unavailable');
      const pass=await one(pool,"SELECT p.snapshot,p.status FROM ayambil_capabilities c JOIN ayambil_passes p ON p.id=c.pass_id JOIN ayambil_attendees a ON a.id=p.attendee_id JOIN ayambil_bookings b ON b.id=a.booking_id WHERE c.key_hash=? AND c.expires_at>UTC_TIMESTAMP(3) AND c.revoked_at IS NULL AND p.status='active' AND a.status='active' AND b.status='active'",[hash(key)]);
      if(!pass)throw new ApiError(404,'Pass download unavailable');return {passes:[{...json(pass.snapshot),status:pass.status}]};
    },
    async list(query){
      let stage='bookings.filters';try {
      const date=String(query.date||''),status=String(query.status||''),search=String(query.search||'');const page=Number(query.page||1);
      if(!['','2026-11-02','2026-11-03'].includes(date)||!['','active','cancelled'].includes(status)||search.length>120||!Number.isInteger(page)||page<1||page>100000)throw new ApiError(400,'Invalid filters');
      // Normalize each operand before CONCAT, not just its result: imported
      // column and connection collations can differ without a schema change.
      stage='bookings.select';const ids=await rows(pool,`SELECT b.id FROM ayambil_bookings b
        WHERE (CONVERT(? USING utf8mb4) COLLATE utf8mb4_unicode_ci=_utf8mb4'' COLLATE utf8mb4_unicode_ci OR CONVERT(b.event_date USING utf8mb4) COLLATE utf8mb4_unicode_ci=CONVERT(? USING utf8mb4) COLLATE utf8mb4_unicode_ci)
        AND (CONVERT(? USING utf8mb4) COLLATE utf8mb4_unicode_ci=_utf8mb4'' COLLATE utf8mb4_unicode_ci OR CONVERT(b.status USING utf8mb4) COLLATE utf8mb4_unicode_ci=CONVERT(? USING utf8mb4) COLLATE utf8mb4_unicode_ci)
        AND (CONVERT(? USING utf8mb4) COLLATE utf8mb4_unicode_ci=_utf8mb4'' COLLATE utf8mb4_unicode_ci OR LOCATE(CONVERT(? USING utf8mb4) COLLATE utf8mb4_unicode_ci,
          CONCAT(CONVERT(b.number USING utf8mb4) COLLATE utf8mb4_unicode_ci,_utf8mb4' ' COLLATE utf8mb4_unicode_ci,
            CONVERT(b.contact_name USING utf8mb4) COLLATE utf8mb4_unicode_ci,_utf8mb4' ' COLLATE utf8mb4_unicode_ci,
            CONVERT(b.mobile USING utf8mb4) COLLATE utf8mb4_unicode_ci))>0
          OR EXISTS(SELECT 1 FROM ayambil_attendees a WHERE a.booking_id=b.id
            AND LOCATE(CONVERT(? USING utf8mb4) COLLATE utf8mb4_unicode_ci,
              CONVERT(a.full_name USING utf8mb4) COLLATE utf8mb4_unicode_ci)>0))
        ORDER BY b.created_at DESC,b.id LIMIT 51 OFFSET ?`,[date,date,status,status,search,search,search,(page-1)*50]);
      stage='bookings.hydrate';const items=[];
      // Bound each page to the pool's five connections. Concurrent dashboard
      // and export requests must not enqueue fifty hydration chains apiece.
      for(let offset=0;offset<Math.min(ids.length,50);offset+=5)items.push(...await Promise.all(ids.slice(offset,Math.min(offset+5,50)).map(b=>booking(pool,b.id,true))));
      return {items,page,hasMore:ids.length>50,integration:{ready:false,missing:queue?['Provider channel and template validation required']:['WhatsApp sending disabled']}};
      }catch(error){error.ayambilStage=stage;throw error;}
    },
    async change(actor,body){
      if(!body||!['cancel','restore','reissue','cancel-pass'].includes(body.action)||typeof body.bookingId!=='string')throw new ApiError(400,'Invalid change');
      return transaction(pool,async db=>{
        const b=await one(db,'SELECT * FROM ayambil_bookings WHERE id=? FOR UPDATE',[body.bookingId]);if(!b)throw new ApiError(404,'Booking unavailable');
        let downloadKey;
        if(body.action==='cancel-pass') {
          if(typeof body.passNumber!=='string'||body.passNumber.length>64)throw new ApiError(400,'Exact pass required');
          const pass=await one(db,'SELECT p.id,p.status FROM ayambil_passes p JOIN ayambil_attendees a ON a.id=p.attendee_id WHERE p.number=? AND a.booking_id=? FOR UPDATE',[body.passNumber,b.id]);
          if(!pass)throw new ApiError(404,'Pass unavailable for this booking');
          if(pass.status!=='active')throw new ApiError(409,'Only an active pass can be cancelled');
          await rows(db,"UPDATE ayambil_passes SET status='cancelled' WHERE id=?",[pass.id]);
          await rows(db,'UPDATE ayambil_capabilities SET revoked_at=UTC_TIMESTAMP(3) WHERE pass_id=?',[pass.id]);
        } else if(body.action==='reissue') {
          const a=await one(db,'SELECT * FROM ayambil_attendees WHERE id=? AND booking_id=?',[body.attendeeId||'',b.id]);
          if(b.status!=='active'||!a||a.status!=='active')throw new ApiError(409,'Active attendee required');
          await rows(db,'UPDATE ayambil_capabilities c JOIN ayambil_passes p ON p.id=c.pass_id SET c.revoked_at=UTC_TIMESTAMP(3) WHERE p.attendee_id=?',[a.id]);
          await rows(db,"UPDATE ayambil_passes SET status='superseded' WHERE attendee_id=? AND status<>'superseded'",[a.id]);
          const old=await one(db,'SELECT snapshot FROM ayambil_passes WHERE attendee_id=? ORDER BY revision DESC LIMIT 1',[a.id]);
          if(!old)throw new ApiError(409,'Saved pass unavailable');downloadKey=(await issued(db,a,json(old.snapshot).sessions[0])).key;
        } else {
          const status=body.action==='cancel'?'cancelled':'active';
          await rows(db,'UPDATE ayambil_bookings SET status=? WHERE id=?',[status,b.id]);
          await rows(db,'UPDATE ayambil_attendees SET status=? WHERE booking_id=?',[status,b.id]);
          await rows(db,"UPDATE ayambil_passes p JOIN ayambil_attendees a ON a.id=p.attendee_id SET p.status=? WHERE a.booking_id=? AND p.status<>'superseded' AND (?='cancelled' OR EXISTS(SELECT 1 FROM ayambil_capabilities c WHERE c.pass_id=p.id AND c.revoked_at IS NULL))",[status,b.id,status]);
          // Cancellation denies links by active-state checks. Restoration retains
          // the previous key only until its original expiry, matching old backend.
        }
        await rows(db,'INSERT INTO ayambil_audit(id,admin_id,booking_id,action,created_at) VALUES(?,?,?,?,UTC_TIMESTAMP(3))',[randomUUID(),actor.admin_id,b.id,body.action]);
        return {...await booking(db,b.id,true),...(downloadKey?{downloadKey}: {})};
      });
    }
  };
}



