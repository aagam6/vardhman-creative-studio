// Operator-only, read-only diagnostic. No database access or queue processing.
import {createFlow} from '../vardhmanflow.mjs';
try {
  const flow=createFlow({...process.env,AYAMBIL_WHATSAPP_ENABLED:'false'});
  const config=flow.configuration();
  if(!config.configured)throw new Error('Configure VARDHMAN_FLOW_API_KEY and VARDHMAN_FLOW_API_SECRET privately in this temporary process; use the canonical base URL. Channel ID is required unless the key is channel-bound.');
  const result=await flow.inspect({templateDefinitions:true});
  // Do not expose account phone, usage, raw provider response or environment.
  console.log(JSON.stringify({accountVerified:result.accountVerified,channel:{active:result.channel.active,health:result.channel.health},channelHeaderConfigured:!!process.env.VARDHMAN_FLOW_CHANNEL_ID,templates:result.templates,missingTemplates:['ayambil_registration_confirm','ayambil_pass_ready','ayambil_event_reminder'].filter(name=>!result.templates.some(t=>t.name===name))},null,2));
} catch(error) {
  console.error(error.message);process.exitCode=1;
}
