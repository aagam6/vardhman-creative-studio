// Only bounded categories and numbers may enter telemetry. Never pass field
// values, validation text, exception messages, file names or applicant IDs.
export const formIssueKinds=['validation','photo_type','photo_size','photo_dimensions','photo_decode','network','session','server','uncertain'];
export function formIssuePayload({issue_kind,step,error_count=1}={}){
 if(!formIssueKinds.includes(issue_kind)||!Number.isInteger(step)||step<1||step>5||!Number.isInteger(error_count)||error_count<1||error_count>40)return null;
 return {issue_kind,step,error_count};
}
export function submissionIssue(error,{uncertain=false}={}){
 if(uncertain)return 'uncertain';
 if(error?.status===401||error?.status===403)return 'session';
 if(error?.status>=500)return 'server';
 if(error?.status>=400)return 'validation';
 return 'network';
}
