// Operator-only runner; never invoke at startup/build.
import mysql from 'mysql2/promise';
import {configuration,programme} from '../config.mjs';
import {provisionInitialAdmin,validateInitialProgramme} from '../bootstrap.mjs';
let db,password='';
try {
 if(process.argv.length!==2||process.env.AYAMBIL_BOOTSTRAP_APPROVED!=='true')throw Error('Explicit approval and no arguments required');
 if(process.stdin.isTTY)throw Error('Approved non-echoing password provider must supply stdin');
 const config=configuration(process.env);
 if(config.registrationOpen)throw Error('Registration must remain closed');
 validateInitialProgramme(programme);
 for await(const chunk of process.stdin){password+=chunk;if(Buffer.byteLength(password,'utf8')>1024)throw Error('Input too large');}
 password=password.replace(/\r?\n$/,'');
 if(/[\r\n]/.test(password))throw Error('Single password required');
 const {connectionLimit,waitForConnections,queueLimit,...connection}=config.database;
 db=await mysql.createConnection(connection);
 await provisionInitialAdmin(db,{approved:true,email:process.env.AYAMBIL_INITIAL_ADMIN_EMAIL,password,initialProgramme:programme});
 console.log('First administrator and reviewed snapshots provisioned; registration remains closed.');
}catch{
 console.error('Bootstrap refused or failed. Verify approval, closed gates, schema and initial configuration securely.');
 process.exitCode=1;
}finally{password='';if(db)await db.end();}
