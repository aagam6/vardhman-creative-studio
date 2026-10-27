import {notificationSettings} from './notification-settings.mjs';
import { readFileSync } from 'node:fs';
import { validateBooking as validateFields } from '../web/src/lib/ayambilBookingValidation.js';
export const programme = JSON.parse(readFileSync(new URL('./programme.json', import.meta.url), 'utf8'));
export function configuration(env) {
  for (const key of ['DB_HOST','DB_PORT','DB_NAME','DB_USER','DB_PASSWORD','AYAMBIL_SITE_ORIGIN','AYAMBIL_RATE_LIMIT_SECRET']) {
    if (typeof env[key] !== 'string' || !env[key]) throw new Error(`Missing server setting: ${key}`);
  }
  const port = Number(env.DB_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid DB_PORT');
  const origin = new URL(env.AYAMBIL_SITE_ORIGIN);
  if (origin.protocol !== 'https:' || origin.origin !== env.AYAMBIL_SITE_ORIGIN) throw new Error('Exact HTTPS site origin required');
  if (env.AYAMBIL_RATE_LIMIT_SECRET.length < 32) throw new Error('Rate-limit secret must contain at least 32 characters');
  if (env.AYAMBIL_WHATSAPP_ENABLED === 'true' && (!/^[a-f0-9]{64}$/.test(env.AYAMBIL_QUEUE_ENCRYPTION_KEY||'') || !env.AYAMBIL_FLOW_TEMPLATE_MAPPINGS || !env.VARDHMAN_FLOW_API_KEY || !env.VARDHMAN_FLOW_API_SECRET)) throw new Error('Verified messaging configuration required');
  if(env.AYAMBIL_NOTIFICATION_DISPATCH_ENABLED==='true')throw Error('Notification dispatch is not supported by this release');
  return {...notificationSettings(env),directFamilyResponses:env.AYAMBIL_DIRECT_FAMILY_RESPONSES_ENABLED==='true',bookingControls:env.AYAMBIL_BOOKING_CONTROLS_ENABLED==='true',bookingControlsProduction:env.AYAMBIL_BOOKING_CONTROLS_PRODUCTION==='true',notificationDispatchEnabled:false,trashPurgeEnabled:env.AYAMBIL_TRASH_PURGE_ENABLED==='true',maintenanceSchemaEnabled:env.AYAMBIL_MAINTENANCE_SCHEMA_ENABLED==='true',stagingBuild:env.AYAMBIL_STAGING_BUILD==='true',normalProcessingApproved:env.AYAMBIL_WHATSAPP_NORMAL_PROCESSING_APPROVED==='true',whatsappEnabled:env.AYAMBIL_WHATSAPP_ENABLED==='true',database:{host:env.DB_HOST,port,database:env.DB_NAME,user:env.DB_USER,password:env.DB_PASSWORD,connectionLimit:5,waitForConnections:true,queueLimit:50,connectTimeout:10000,charset:'utf8mb4',timezone:'Z',dateStrings:true,multipleStatements:false},origin:origin.origin,rateSecret:env.AYAMBIL_RATE_LIMIT_SECRET,registrationOpen:env.AYAMBIL_REGISTRATION_OPEN==='true'};
}
export class ApiError extends Error { constructor(status,message){super(message);this.status=status;} }
export function bookingInput(body) {
  if (!body || typeof body !== 'object') throw new ApiError(400,'Invalid booking');
  const error=validateFields(body,programme.sessions.map(s=>s.date));
  if(error) throw new ApiError(400,error);
  if(!/^[a-f0-9]{64}$/.test(body.requestKey||'')) throw new ApiError(400,'Invalid submission identifier');
  return {contactName:body.contactName.trim(),occupation:(body.occupation||'').trim(),referralSource:(body.referralSource||'').trim(),mobile:body.mobile.replace(/[\s()-]/g,''),eventDate:body.eventDate,whatsappConsent:true,termsAccepted:true,attendees:body.attendees.map(a=>({fullName:a.fullName.trim(),dates:[body.eventDate]})),requestKey:body.requestKey};
}
