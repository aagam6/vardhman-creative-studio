import test from 'node:test';
import assert from 'node:assert/strict';
import { productionInstallBuild } from './production-postinstall.mjs';

test('absent or false approval does not build', () => {
  for (const env of [{}, { AYAMBIL_PRODUCTION_BUILD: 'false' }]) {
    assert.equal(productionInstallBuild({ env, run: () => assert.fail('unexpected build') }), 0);
  }
});
test('conflicting staging approval fails before building', () => {
  assert.equal(productionInstallBuild({ env: { AYAMBIL_PRODUCTION_BUILD: 'true', AYAMBIL_STAGING_BUILD: 'true' }, run: () => assert.fail('unexpected build') }), 1);
});
test('approved production invokes full-site build and verifies index', () => {
  assert.equal(productionInstallBuild({ env: { AYAMBIL_PRODUCTION_BUILD: 'true' }, run: (exe, args, options) => {
    assert.equal(exe, process.execPath);
    assert.deepEqual(args, ['tools/build.mjs']);
    assert.match(options.cwd, /apps[\\/]web$/);
    return { status: 0 };
  }, exists: p => p.endsWith(pathSuffix()) }), 0);
});
function pathSuffix() { return process.platform === 'win32' ? 'dist\\apps\\web\\index.html' : 'dist/apps/web/index.html'; }
test('build failure is propagated', () => {
  assert.equal(productionInstallBuild({ env: { AYAMBIL_PRODUCTION_BUILD: 'true' }, run: () => ({ status: 2 }), exists: () => assert.fail('unexpected output check') }), 2);
});
test('missing output fails installation', () => {
  assert.equal(productionInstallBuild({ env: { AYAMBIL_PRODUCTION_BUILD: 'true' }, run: () => ({ status: 0 }), exists: () => false }), 1);
});
