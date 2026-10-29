import {entryRevision,entryRevisionDefinitionHash} from './entry-timing-revision-preview.mjs';
import {entryRevisionPolicy} from './entry-timing-revision-policy.mjs';
import {createHash} from 'node:crypto';
import {entryDefinitionProjection} from './entry-timing-revision-policy.mjs';
// Reviewed, explicit activation only. Keep the six-template v1 catalog intact.
export function selectEntryRuntimeCatalog(catalog,env){
 if(!env.AYAMBIL_ENTRY_REVISION_POLICY||!env.AYAMBIL_ENTRY_REVISION_SHA256)return structuredClone(catalog);
 if(env.AYAMBIL_ENTRY_REVISION_POLICY!==entryRevisionPolicy.version||env.AYAMBIL_ENTRY_REVISION_SHA256!==entryRevisionDefinitionHash)throw Error('Exact reviewed entry revision policy required');
 return catalog.map(t=>t.purpose==='entry_timing'?{...structuredClone(t),...structuredClone(entryRevision),languageCodeEvidence:{verified:true,templateId:entryRevision.templateId,name:entryRevision.name,code:'en',source:'operator-reviewed-provider-preview'},approvalEvidence:null}:structuredClone(t));
}
export function reviewedEntryRuntimeDefinition(templates,expected,env,strict){
 if(strict.verified)return strict;
 if(env.AYAMBIL_ENTRY_REVISION_POLICY!==entryRevisionPolicy.version||env.AYAMBIL_ENTRY_REVISION_SHA256!==entryRevisionDefinitionHash||env.AYAMBIL_SITE_ORIGIN!=='https://vardhmancreativestudio.com')return strict;
 if(createHash('sha256').update(JSON.stringify(entryDefinitionProjection(expected))).digest('hex')!==entryRevisionDefinitionHash)return strict;
 const matches=templates.filter(t=>t.name===expected.name&&t.language===expected.languageCode);
 if(!strict.identityVerified||matches.length!==1||Object.hasOwn(matches[0],'components'))return strict;
 return {...strict,verified:true,issues:[],source:'versioned_operator_reviewed_snapshot',providerComponentsVerified:false,snapshotPolicy:entryRevisionPolicy.version,snapshotHash:entryRevisionDefinitionHash};
}
