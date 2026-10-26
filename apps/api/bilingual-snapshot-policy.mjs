import {createHash} from 'node:crypto';
import catalog from './bilingual-template-catalog.json' with {type:'json'};
const projection=t=>({templateId:t.templateId,name:t.name,languageCode:t.languageCode,header:t.header,body:t.body,button:t.button||null,dynamicUrl:t.dynamicUrl||null,parameters:t.parameters});
const fingerprint=t=>createHash('sha256').update(JSON.stringify(projection(t))).digest('hex');
export const bilingualSnapshotPolicy=Object.freeze({version:'ayambil-bilingual-reviewed-2026-10-25-v1',hash:createHash('sha256').update(JSON.stringify(catalog.map(projection))).digest('hex')});
export function reviewedBilingualDefinition(templates,expected,env,strict){
 if(strict.verified)return strict;
 if(env.AYAMBIL_SITE_ORIGIN!=='https://vardhmancreativestudio.com'||env.AYAMBIL_BILINGUAL_SNAPSHOT_POLICY!==bilingualSnapshotPolicy.version||env.AYAMBIL_BILINGUAL_SNAPSHOT_SHA256!==bilingualSnapshotPolicy.hash)return strict;
 const pinned=catalog.find(t=>t.name===expected.name);
 if(!pinned||fingerprint(pinned)!==fingerprint(expected)||pinned.languageCodeEvidence?.verified!==true||pinned.languageCodeEvidence.templateId!==pinned.templateId||pinned.languageCodeEvidence.code!==pinned.languageCode||pinned.approvalEvidence?.verified!==true)return strict;
 const matches=Array.isArray(templates)?templates.filter(t=>t?.name===expected.name&&t.language===expected.languageCode):[];
 if(matches.length!==1)return strict;
 const t=matches[0];
 if(t.status!=='APPROVED'||String(t.category).toUpperCase()!=='UTILITY')return strict;
 // Only absent fields can use pinned operator evidence. A conflicting supplied ID
 // or partial/mismatched components array is never hidden by a snapshot.
 if(Object.hasOwn(t,'id')&&String(t.id)!==expected.templateId)return strict;
 if(Object.hasOwn(t,'components'))return strict;
 return {...strict,verified:true,issues:[],source:'operator_reviewed_snapshot',providerComponentsVerified:false,providerIdVerified:Object.hasOwn(t,'id'),snapshotPolicy:bilingualSnapshotPolicy.version,snapshotHash:bilingualSnapshotPolicy.hash,limitations:['Full definition supplied by reviewed operator snapshot, not provider API']};
}
