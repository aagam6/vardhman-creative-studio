import test from 'node:test';
import assert from 'node:assert/strict';
import {stagingInstallBuild} from '../../../tools/ayambil-staging-postinstall.mjs';
test('conditional install hook no-ops unless explicitly true, runs staging command and propagates failure',async()=>{
 let calls=0;const run=(node,args)=>{calls++;assert.deepEqual(args,['synthetic-npm-cli','run','build:ayambil-staging','--prefix','apps/web']);return {status:0};};
 for(const flag of [undefined,'false','1'])assert.equal(await stagingInstallBuild({AYAMBIL_STAGING_BUILD:flag},run),0);
 assert.equal(calls,0);assert.equal(await stagingInstallBuild({AYAMBIL_STAGING_BUILD:'true',npm_execpath:'synthetic-npm-cli'},run),0);assert.equal(calls,1);
 assert.equal(await stagingInstallBuild({AYAMBIL_STAGING_BUILD:'true',npm_execpath:'synthetic-npm-cli'},()=>({status:1})),1);
});
