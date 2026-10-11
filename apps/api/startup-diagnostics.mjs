// Return only reviewed constant messages. Never forward arbitrary error text.
export function startupDiagnostic(stage,error){
 const message=typeof error?.message==='string'?error.message:'';
 const missing=/^Missing server setting: (DB_HOST|DB_PORT|DB_NAME|DB_USER|DB_PASSWORD|AYAMBIL_SITE_ORIGIN|AYAMBIL_RATE_LIMIT_SECRET)$/.exec(message);
 if(stage==='configuration'&&missing)return 'Missing required environment key: '+missing[1];
 const safe=['Invalid DB_PORT','Exact HTTPS site origin required','Rate-limit secret must contain at least 32 characters','Verified messaging configuration required','Valid platform PORT required','Unsupported listen host'];
 if(safe.includes(message))return message;
 if(stage==='configuration'&&error?.code==='ERR_INVALID_URL')return 'AYAMBIL_SITE_ORIGIN must be an exact HTTPS origin';
 return 'Failure at startup stage: '+(['configuration','port','pool','messaging','application','listener','bootstrap','queue-schema','readiness'].includes(stage)?stage:'unknown');
}
