import test from 'node:test';import assert from 'node:assert/strict';
import {updhanProviderCredentials} from '../provider-credentials.mjs';
import {createUpdhanFlowProvider} from '../flow-provider.mjs';
test('production uses existing provider env atomically; verification credentials require explicit opt-in',()=>{
 const env={VARDHMAN_FLOW_API_KEY:'existing-key',VARDHMAN_FLOW_API_SECRET:'existing-secret',VARDHMAN_FLOW_CHANNEL_ID:'existing-channel',UPDHAN_FLOW_API_KEY:'test-key',UPDHAN_FLOW_API_SECRET:'test-secret',UPDHAN_FLOW_CHANNEL_ID:'test-channel'};
 assert.deepEqual(updhanProviderCredentials(env),{key:'existing-key',secret:'existing-secret',channel:'existing-channel',source:'existing-vardhman-flow'});
 assert.equal(updhanProviderCredentials({...env,UPDHAN_FLOW_CREDENTIAL_SOURCE:'verification'}).key,'test-key');
 assert.equal(createUpdhanFlowProvider({env,allowNetwork:true}).configuration().enabled,false);
 assert.equal(createUpdhanFlowProvider({env:{UPDHAN_FLOW_API_KEY:'test',UPDHAN_FLOW_API_SECRET:'test',UPDHAN_FLOW_CHANNEL_ID:'test'}}).configuration().configured,false);
});
