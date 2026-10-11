import test from 'node:test';
import assert from 'node:assert/strict';
import {startupDiagnostic} from '../startup-diagnostics.mjs';
test('startup diagnostics expose only constant stage/key guidance, never raw secrets',()=>{
 assert.equal(startupDiagnostic('configuration',Error('Missing server setting: DB_PASSWORD')),'Missing required environment key: DB_PASSWORD');
 assert.match(startupDiagnostic('configuration',Object.assign(Error('secret-url'),{code:'ERR_INVALID_URL'})),/exact HTTPS origin/);
 assert.equal(startupDiagnostic('port',Error('Valid platform PORT required')),'Valid platform PORT required');
 for(const stage of ['pool','bootstrap','readiness','secret-stage'])assert.doesNotMatch(startupDiagnostic(stage,Error('password=synthetic-secret; token=synthetic')),/synthetic|password=|token=|secret-stage/);
});
