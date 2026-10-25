import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {randomBytes} from 'node:crypto';
import net from 'node:net';
import {fileURLToPath} from 'node:url';
import mysql from 'mysql2/promise';

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const workspace=fileURLToPath(new URL('..',import.meta.url));
export const defaultMysqlBase='C:/Users/aagam/AppData/Local/AyambilMySQLTestRuntime/mysql-8.0.46-winx64';
function run(executable,args,input='') {
 return new Promise((resolveResult,reject)=>{
  const child=spawn(executable,args,{windowsHide:true});let output='';
  child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);
  child.on('error',reject);child.on('close',code=>resolveResult({code,output}));child.stdin.end(input);
 });
}
async function freePort(){const probe=net.createServer();await new Promise((r,j)=>{probe.once('error',j);probe.listen(0,'127.0.0.1',r);});const port=probe.address().port;await new Promise(r=>probe.close(r));return port;}

// Never reads .env, production configuration, or any historical data directory.
export async function startDisposableMysql({base=defaultMysqlBase}={}) {
 const [major,minor]=process.versions.node.split('.').map(Number);if(major<22||major===22&&minor<22)throw new Error('Use Node >=22.22.0; the bundled Node 24 runtime is available for local testing.');
 const stamp=`${Date.now()}_${randomBytes(3).toString('hex')}`;
 const runtimeDirectory=resolve(workspace,'tmp/booking-controls',stamp),data=resolve(runtimeDirectory,'data');
 const databaseName=`ayambil_test_${stamp}`,user=`up_${randomBytes(5).toString('hex')}`;
 const password=randomBytes(32).toString('hex'),pipe=`ayambil_${stamp}`;
 await mkdir(runtimeDirectory,{recursive:true});await mkdir(data);
 const executable=resolve(base,'bin/mysqld.exe');let child,pool,root,phase='pipe',port;
 async function start(extra){
  let output='';child=spawn(executable,['--no-defaults',`--basedir=${base}`,`--datadir=${data}`,'--console','--mysqlx=OFF','--skip-log-bin','--innodb-buffer-pool-size=64M',...extra],{windowsHide:true});
  child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);let spawnError;child.on('error',e=>{spawnError=e;});
  for(let n=0;n<200;n++){
   if(spawnError)throw spawnError;
   if(output.includes('ready for connections'))return;
   if(child.exitCode!==null)throw new Error('Disposable MySQL startup failed');
   await sleep(100);
  }throw new Error('Disposable MySQL startup timed out');
 }
 async function waitForExit(){for(let n=0;n<200&&child.exitCode===null&&child.signalCode===null;n++)await sleep(100);if(child.exitCode===null&&child.signalCode===null)throw new Error('Owned MySQL did not shut down');}
 async function close(){
  if(pool){await pool.end();pool=null;}
  if(child&&child.exitCode===null&&child.signalCode===null){
   try{if(phase==='tcp'){root ||= await mysql.createConnection({host:'127.0.0.1',port,user:'root',password});await root.query('SHUTDOWN');}else await run(resolve(base,'bin/mysql.exe'),['--no-defaults','--protocol=PIPE',`--socket=${pipe}`,'--user=root'],'SHUTDOWN;');await waitForExit();}
   catch(error){child.kill();await waitForExit();throw error;}
  }
  await root?.end().catch(()=>{});
 }
 try{
  const init=await run(executable,['--no-defaults','--initialize-insecure',`--basedir=${base}`,`--datadir=${data}`,'--console']);
  if(init.code)throw new Error('Disposable MySQL initialization failed');
  await start(['--skip-networking','--enable-named-pipe',`--socket=${pipe}`]);
  const provision=await run(resolve(base,'bin/mysql.exe'),['--no-defaults','--protocol=PIPE',`--socket=${pipe}`,'--user=root'],
   `ALTER USER 'root'@'localhost' IDENTIFIED BY '${password}'; CREATE DATABASE ${databaseName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER '${user}'@'127.0.0.1' IDENTIFIED BY '${password}'; GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES, TRIGGER ON ${databaseName}.* TO '${user}'@'127.0.0.1'; SHUTDOWN;`);
  if(provision.code)throw new Error('Disposable provisioning failed: '+provision.output.replaceAll(password,'[redacted]'));
  await waitForExit();phase='tcp';port=await freePort();await start(['--bind-address=127.0.0.1',`--port=${port}`]);
  root=await mysql.createConnection({host:'127.0.0.1',port,user:'root',password,database:databaseName,dateStrings:true});
  const [[version]]=await root.query('SELECT VERSION() AS version');
  if(!/^8\./.test(version.version))throw new Error('MySQL 8 required');
  pool=mysql.createPool({host:'127.0.0.1',port,user,password,database:databaseName,connectionLimit:8,dateStrings:true,timezone:'Z'});
  const identity={databaseName,port,version:version.version,runtimeDirectory,mysqlPid:child.pid,host:'127.0.0.1',disposable:true};
  await writeFile(resolve(runtimeDirectory,'identity.json'),JSON.stringify(identity,null,2));
  return {...identity,pool,root,close};
 }catch(error){await close().catch(()=>{});throw error;}
}
