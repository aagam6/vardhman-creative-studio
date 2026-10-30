// Production reuses the already configured Vardhman Flow provider identity.
// Updhan activation, encryption, queues and budgets remain independent.
export function updhanProviderCredentials(env){
 const verification=env.UPDHAN_FLOW_CREDENTIAL_SOURCE==='verification';
 const prefix=verification?'UPDHAN_FLOW_':'VARDHMAN_FLOW_';
 return {key:env[prefix+'API_KEY'],secret:env[prefix+'API_SECRET'],channel:env[prefix+'CHANNEL_ID'],source:verification?'verification':'existing-vardhman-flow'};
}
