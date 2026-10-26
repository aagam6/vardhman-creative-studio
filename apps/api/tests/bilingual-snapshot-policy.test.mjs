import test from 'node:test';
import assert from 'node:assert/strict';
import {bilingualSnapshotPolicy,reviewedBilingualDefinition} from '../bilingual-snapshot-policy.mjs';
import {bilingualDefinitionMetadata,createFlow} from '../vardhmanflow.mjs';
import catalog from '../bilingual-template-catalog.json' with {type:'json'};
const env={AYAMBIL_SITE_ORIGIN:'https://vardhmancreativestudio.com',AYAMBIL_BILINGUAL_SNAPSHOT_POLICY:bilingualSnapshotPolicy.version,AYAMBIL_BILINGUAL_SNAPSHOT_SHA256:bilingualSnapshotPolicy.hash};
const definition=t=>({id:`11111111-2222-4333-8444-${String(catalog.indexOf(t)+1).padStart(12,'0')}`,name:t.name,language:t.languageCode,status:'APPROVED',category:'UTILITY'});
test('legacy-style reviewed evidence requires explicit exact policy and hash for every bilingual template',()=>{
 for(const t of catalog){const templates=[definition(t)],strict=bilingualDefinitionMetadata(templates,t);
  assert.equal(strict.verified,false);assert.equal(reviewedBilingualDefinition(templates,t,{},strict).verified,false);
  const result=reviewedBilingualDefinition(templates,t,env,strict);assert.equal(result.verified,true);assert.equal(result.source,'operator_reviewed_snapshot');assert.equal(result.providerComponentsVerified,false);assert.equal(result.providerIdVerified,true);assert.equal(result.providerIdStatus,'valid_uuid');assert.equal(result.metaTemplateId,t.templateId);assert.notEqual(result.providerTemplateId,t.templateId);
  assert.equal(reviewedBilingualDefinition(templates,t,{...env,AYAMBIL_BILINGUAL_SNAPSHOT_SHA256:'wrong'},strict).verified,false);
  assert.equal(reviewedBilingualDefinition(templates,{...t,body:t.body+' changed'},env,strict).verified,false);
 }
});
test('snapshot never overrides conflicting IDs, partial definitions, category, language or duplicate matches',()=>{
 const t=catalog[0];for(const templates of [[{...definition(t),id:'different'}],[{...definition(t),components:[]}],[{...definition(t),category:'MARKETING'}],[{...definition(t),language:'gu'}],[definition(t),definition(t)]]){
  assert.equal(reviewedBilingualDefinition(templates,t,env,bilingualDefinitionMetadata(templates,t)).verified,false);
 }
});
test('actual provider verification uses GET only and returns explicit operator provenance',async()=>{
 let posts=0;const flow=createFlow({...env,VARDHMAN_FLOW_API_KEY:'synthetic',VARDHMAN_FLOW_API_SECRET:'synthetic'},async(url,options)=>{if(options.method!=='GET')posts++;return Response.json({success:true,data:url.endsWith('/account')?{channel:{id:'mock',isActive:true,healthStatus:'healthy'}}:catalog.map(definition)});});
 const result=await flow.verifyBilingual(catalog[0]);assert.equal(result.source,'operator_reviewed_snapshot');assert.equal(result.providerComponentsVerified,false);assert.equal(posts,0);
});
test('documented UUID namespace cannot substitute for Meta identity or conceal supplied components',()=>{
 const t=catalog[0],provider=definition(t);
 for(const invalid of [undefined,null,'',t.templateId,'not-a-uuid']){
  const candidate={...provider,id:invalid};assert.equal(reviewedBilingualDefinition([candidate],t,env,bilingualDefinitionMetadata([candidate],t)).verified,false);
 }
 for(const components of [null,[],[null],[{type:'BODY',text:t.body}],[{type:'HEADER',text:t.header},{type:'BODY',text:t.body+' wrong'}]]){
  const candidate={...provider,components};assert.equal(reviewedBilingualDefinition([candidate],t,env,bilingualDefinitionMetadata([candidate],t)).verified,false);
 }
 const collision=[provider,{...definition(catalog[1]),id:provider.id}];assert.equal(reviewedBilingualDefinition(collision,t,env,bilingualDefinitionMetadata(collision,t)).verified,false);
 const duplicates=[provider,{...provider,id:'99999999-2222-4333-8444-000000000001'}];assert.equal(reviewedBilingualDefinition(duplicates,t,env,bilingualDefinitionMetadata(duplicates,t)).verified,false);
});
