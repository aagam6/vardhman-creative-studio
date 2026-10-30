import {entryRevisionDefinitionHash} from './entry-timing-revision-preview.mjs';
export const entryFollowupAction='entry_followup_authorized';
// A prior submission still blocks unless an administrator authorized this exact
// delivered row and reviewed definition for the ordinary scheduled reminder.
export function entryPriorBlocksSql(alias){
 if(!/^[a-z]+$/.test(alias))throw Error('Internal SQL alias required');
 return `NOT EXISTS (SELECT 1 FROM ayambil_notification_audit efa WHERE efa.action='${entryFollowupAction}' AND ${alias}.purpose='entry_timing' AND ${alias}.state IN ('delivered','read') AND BINARY JSON_UNQUOTE(JSON_EXTRACT(efa.detail,'$.oldId'))=BINARY ${alias}.id AND BINARY JSON_UNQUOTE(JSON_EXTRACT(efa.detail,'$.subject'))=BINARY ${alias}.subject AND BINARY JSON_UNQUOTE(JSON_EXTRACT(efa.detail,'$.oldHash'))=BINARY ${alias}.revision_hash AND BINARY JSON_UNQUOTE(JSON_EXTRACT(efa.detail,'$.providerId'))=BINARY ${alias}.provider_id AND JSON_UNQUOTE(JSON_EXTRACT(efa.detail,'$.definitionHash'))='${entryRevisionDefinitionHash}' AND JSON_UNQUOTE(JSON_EXTRACT(efa.detail,'$.purpose'))='reminder')`;
}
