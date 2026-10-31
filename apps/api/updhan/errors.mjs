export class UpdhanError extends Error{constructor(status,message){super(message);this.status=status;}}
export function updhanFailure(error,requestId){
 const status=error instanceof UpdhanError?error.status:error.type==='entity.too.large'?413:error.type==='entity.parse.failed'?400:503;
 const known={'Registration is closed':'registration_closed','Option not approved':'option_unavailable','Approved privacy version required':'privacy_not_configured'};
 const code=known[error.message]||({400:'invalid_request',401:'sign_in_required',403:'permission_denied',409:'conflict',413:'payload_too_large',429:'rate_limited'}[status])||'service_unavailable';
 return {status,body:{error:status>=500?'Updhan temporarily unavailable':error instanceof UpdhanError?error.message:'Invalid request',code,requestId,...(known[error.message]?{registrationSaved:false}:{})}};
}
