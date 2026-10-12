import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export function productionInstallBuild({ env = process.env, run = spawnSync, exists = existsSync } = {}) {
  if (env.AYAMBIL_PRODUCTION_BUILD !== 'true') return 0;
  if (env.AYAMBIL_STAGING_BUILD === 'true') {
    console.error('Production build refused: disable AYAMBIL_STAGING_BUILD.');
    return 1;
  }
  const root = fileURLToPath(new URL('../', import.meta.url));
  // Invoke the existing full-site build script with the install's Node runtime.
  const result = run(process.execPath, ['tools/build.mjs'], {
    cwd: path.join(root, 'apps/web'), env, stdio: 'inherit',
  });
  if (result.error || result.status !== 0) {
    console.error('Production frontend build failed; installation cannot complete.');
    return result.status || 1;
  }
  if (!exists(path.join(root, 'dist/apps/web/index.html'))) {
    console.error('Production frontend build did not create dist/apps/web/index.html.');
    return 1;
  }
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = productionInstallBuild();
}
