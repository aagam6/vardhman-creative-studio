// Organizer decision: existing database and principal, existing DB_* secrets.
// No new user, credential copying or changes to Ayambil's pool/configuration.
export function updhanSharedDatabaseConfig(env){
 const port=Number(env.DB_PORT||3306);
 if(env.DB_NAME!=='u531246927_vcs'||!env.DB_HOST||!env.DB_USER||!env.DB_PASSWORD||!Number.isInteger(port)||port<1||port>65535)throw Error('Existing shared database configuration required');
 return {host:env.DB_HOST,port,database:env.DB_NAME,user:env.DB_USER,password:env.DB_PASSWORD,dateStrings:true,timezone:'Z',connectTimeout:8000,waitForConnections:true,queueLimit:10,connectionLimit:4};
}
export function updhanIdentityReader(pool){
 return {execute(sql,args){if(!/^SELECT (id,password_hash,enabled|password_hash,enabled) FROM ayambil_admins WHERE (email|id)=\?$/.test(sql))throw Error('Updhan identity SQL outside reviewed read-only boundary');return pool.execute(sql,args);}};
}
