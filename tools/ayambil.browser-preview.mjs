// Development-only preview. Starts real local PocketBase + Vite without creating admin accounts.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backend = spawn(path.join(root, '.ayambil-runtime/pocketbase.exe'), ['serve', '--automigrate=false', '--http=127.0.0.1:8091', `--dir=${path.join(root, '.ayambil-runtime/browser-data')}`, `--hooksDir=${path.join(root, 'apps/pocketbase/pb_hooks')}`, `--migrationsDir=${path.join(root, 'apps/pocketbase/pb_migrations')}`], { env: { ...process.env, AYAMBIL_REGISTRATION_OPEN: 'true' }, windowsHide: true, stdio: 'pipe' });
// PocketBase may emit a first-install credential in its startup banner; never forward it.
backend.stdout.resume(); backend.stderr.resume();
console.log('Local PocketBase preview: http://127.0.0.1:8091 (startup logs suppressed)');
const frontend = spawn(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', '3002', '--strictPort'], { cwd: path.join(root, 'apps/web'), env: { ...process.env, VITE_AYAMBIL_POCKETBASE_URL: 'http://127.0.0.1:8091' }, windowsHide: true, stdio: 'inherit' });
const stop = () => { backend.kill(); frontend.kill(); };
process.on('SIGINT', () => { stop(); process.exit(); });
process.on('SIGTERM', () => { stop(); process.exit(); });
backend.on('exit', code => { if (code) { frontend.kill(); process.exitCode = code; } });
frontend.on('exit', code => { if (code) { backend.kill(); process.exitCode = code; } });
