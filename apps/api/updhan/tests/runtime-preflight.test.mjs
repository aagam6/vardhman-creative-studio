import test from 'node:test';import assert from 'node:assert/strict';
import {checkUpdhanGrants,updhanTables} from '../runtime-preflight.mjs';
test('runtime rejects shared broad grants and unrelated tables',()=>{
 const grants=updhanTables.map(t=>({grant:`GRANT SELECT, INSERT, UPDATE, DELETE ON \`u531246927_vcs\`.\`${t}\` TO 'up'@'localhost'`}));
 assert.equal(checkUpdhanGrants(grants,'u531246927_vcs'),true);
 assert.equal(checkUpdhanGrants([{grant:"GRANT ALL PRIVILEGES ON `u531246927_vcs`.* TO 'up'@'localhost'"}],'u531246927_vcs'),false);
 assert.equal(checkUpdhanGrants([{grant:"GRANT SELECT ON `u531246927_vcs`.`ayambil_admins` TO 'id'@'localhost'"}],'u531246927_vcs',true),true);
 assert.equal(checkUpdhanGrants([{grant:"GRANT SELECT, UPDATE ON `u531246927_vcs`.`ayambil_admins` TO 'id'@'localhost'"}],'u531246927_vcs',true),false);
});
