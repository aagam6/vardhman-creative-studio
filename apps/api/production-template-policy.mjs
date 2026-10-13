import {createHash} from 'node:crypto';
import {reviewedTemplateBodies} from './reviewed-template-bodies.mjs';
// Operator reconfirmed these exact English copies on 13 October 2026.
// This is operator evidence, not provider-retrieved BODY verification.
export const productionTemplatePolicy = Object.freeze({
 version:'ayambil-en-2026-10-13-v1',
 provenance:'operator_reviewed_snapshot',
 language:'en',
 bodyHashes:Object.freeze(Object.fromEntries(Object.entries(reviewedTemplateBodies).map(([name,text])=>[name,createHash('sha256').update(text).digest('hex')]))),
});
export function productionSnapshotsApproved(env){
 return env.AYAMBIL_STAGING_BUILD!=='true' && env.AYAMBIL_SITE_ORIGIN==='https://vardhmancreativestudio.com' && env.AYAMBIL_PRODUCTION_TEMPLATE_POLICY===productionTemplatePolicy.version && env.AYAMBIL_WHATSAPP_TEST_BODY_OVERRIDE!=='true';
}
