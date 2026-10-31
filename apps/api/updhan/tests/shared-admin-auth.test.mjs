import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {hashUpdhanAdminPassword} from '../admin-auth.mjs';
import {createAyambilBackedUpdhanAuthenticator} from '../ayambil-admin-auth.mjs';
test('shared identity: SELECT only, enabled check, separate role, password rotation invalidates sessions',async()=>{
 const record={id:randomUUID(),password_hash:await hashUpdhanAdminPassword('Synthetic shared identity 123'),enabled:true};let calls=0;
 const auth=createAyambilBackedUpdhanAuthenticator({identityPool:{async execute(sql,args){calls++;assert.match(sql,/^SELECT /);assert.match(sql,/ FROM ayambil_admins WHERE (email|id)=\?$/);return [[args[0]==='test@example.invalid'||args[0]===record.id?{...record}:undefined].filter(Boolean)];}}});
 assert.equal(await auth('unknown@example.invalid','wrong'),null);assert.equal(await auth('test@example.invalid','wrong'),null);
 const actor=await auth('test@example.invalid','Synthetic shared identity 123');assert.deepEqual(actor.roles,['updhan_admin']);assert.equal(await auth.revalidate(actor),true);assert.equal(await auth.revalidate({id:'synthetic'}),false);
 record.enabled=false;assert.equal(await auth('test@example.invalid','Synthetic shared identity 123'),null);assert.equal(await auth.revalidate(actor),false);
 record.enabled=true;record.password_hash=await hashUpdhanAdminPassword('Synthetic changed identity 456');assert.equal(await auth.revalidate(actor),false);assert.equal(await auth('test@example.invalid','Synthetic shared identity 123'),null);assert.ok(await auth('test@example.invalid','Synthetic changed identity 456'));assert.ok(calls>=8);
});
