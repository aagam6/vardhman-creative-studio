import test from 'node:test';import assert from 'node:assert/strict';
import {createUpdhanProductionService} from '../production-service.mjs';
test('closed admin runtime needs no invented policy; absent policy blocks intake before photo decoding',async()=>{
 const databaseName='u531246927_vcs',pool={pool:{config:{connectionConfig:{database:databaseName}}},execute:async()=>[[{registration_open:1,mode:'open',maintenance_message:''}]]};
 const service=createUpdhanProductionService({pool,databaseName,encryptionKey:'cd'.repeat(32),photoRetentionDays:null,photos:{stage:()=>assert.fail('private upload')},decodePhoto:()=>assert.fail('photo decoder')});
 const status=await service.status();assert.equal(status.registrationOpen,false);assert.equal(status.mode,'closed');await assert.rejects(service.register({}),e=>e.status===503);
});
