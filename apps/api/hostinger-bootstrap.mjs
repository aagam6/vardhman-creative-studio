import {programme} from './config.mjs';
import {provisionInitialAdmin,validateInitialProgramme} from './bootstrap.mjs';
export async function hostingerBootstrap(pool,env){
 if(env.AYAMBIL_BOOTSTRAP_APPROVED!=='true')return {requested:false};
 try{
  if(env.AYAMBIL_REGISTRATION_OPEN!=='false'||env.AYAMBIL_WHATSAPP_ENABLED!=='false'||!env.AYAMBIL_INITIAL_ADMIN_EMAIL||!env.AYAMBIL_INITIAL_ADMIN_PASSWORD)throw Error('Bootstrap gates required');
  validateInitialProgramme(programme);
  const db=await pool.getConnection();
  try{return {requested:true,...await provisionInitialAdmin(db,{approved:true,email:env.AYAMBIL_INITIAL_ADMIN_EMAIL,password:env.AYAMBIL_INITIAL_ADMIN_PASSWORD,initialProgramme:programme,hostingerOneTime:true})};}finally{db.release();}
 }finally{
  // Process memory only. Operator must also remove the stored Hostinger values.
  delete env.AYAMBIL_INITIAL_ADMIN_PASSWORD;delete env.AYAMBIL_BOOTSTRAP_APPROVED;
 }
}
