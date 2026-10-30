export const updhanTables=['updhan_events','updhan_options','updhan_applications','updhan_companions','updhan_consents','updhan_photos','updhan_audit','updhan_outbox','updhan_delivery_events','updhan_admin_sessions','updhan_rate_limits','updhan_attribution','updhan_schema_version','updhan_admission_settings','updhan_category_limits','updhan_operation_audit','updhan_attendance','updhan_duplicate_reviews','updhan_notification_reviews','updhan_worker_ownership'];
// Validate effective grants, never print their contents (USAGE can contain a
// credential hash). Schema-prefix separation alone is insufficient isolation.
export function checkUpdhanGrants(rows,databaseName,identity=false){
 if(!Array.isArray(rows)||!rows.length)return false;
 const seen=new Set();
 for(const row of rows){const grant=String(Object.values(row)[0]);if(/^GRANT USAGE ON \*\.\* TO /i.test(grant))continue;
  const m=/^GRANT (.+) ON `([^`]+)`\.`([^`]+)` TO /i.exec(grant);if(!m||m[2]!==databaseName||/WITH GRANT OPTION/i.test(grant))return false;
  if(identity){if(m[3]!=='ayambil_admins'||!/^SELECT(?:\s*\([`a-z_, ]+\))?$/i.test(m[1]))return false;seen.add(m[3]);}
  else{if(!updhanTables.includes(m[3])||m[1].split(',').some(p=>!['SELECT','INSERT','UPDATE','DELETE'].includes(p.trim().toUpperCase())))return false;seen.add(m[3]);}
 }
 return identity?seen.has('ayambil_admins'):updhanTables.every(t=>seen.has(t));
}
export async function verifyUpdhanRuntime({pool,identityPool,databaseName,sharedPrincipal=false}){
 const [[db]]=await pool.query('SELECT DATABASE() AS name,VERSION() AS version');
 const [[identity]]=await identityPool.query('SELECT DATABASE() AS name');
 if(db.name!==databaseName||identity.name!==databaseName||!/^11\.8\.\d+-MariaDB/.test(db.version))throw Error('Updhan database identity/engine mismatch');
 const [tables]=await pool.execute('SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA=?',[databaseName]);
 if(!updhanTables.every(t=>tables.some(r=>r.name===t)))throw Error('Reviewed Updhan schema not installed');
 if(sharedPrincipal){if(pool!==identityPool)throw Error('Existing shared principal must use the same Updhan-owned pool');return {ready:true,engine:db.version,tables:updhanTables.length,isolation:'reviewed-sql-boundary-shared-principal'};}
 const [runtimeGrants]=await pool.query('SHOW GRANTS'),[identityGrants]=await identityPool.query('SHOW GRANTS');
 if(!checkUpdhanGrants(runtimeGrants,databaseName)||!checkUpdhanGrants(identityGrants,databaseName,true))throw Error('Updhan least-privilege grants required');
 return {ready:true,engine:db.version,tables:updhanTables.length};
}
