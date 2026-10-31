// Holds one immutable attempt in page memory. A lost response may mean the
// database committed; edits must not silently change a pending retry's payload.
export function createSubmissionAttempt(client) {
 let payload=null,uncertain=false;
 return {
  get uncertain(){return uncertain;},
  async submit(input){
   payload ||= {key:input.key,data:structuredClone(input.data),photo:input.photo};
   try{const receipt=await client.submit(payload);payload=null;uncertain=false;return receipt;}
   catch(error){
    const definitelyRejected=error.definitelyRejected===true||[400,401,403,404,413,422,429].includes(error.status);
    if(uncertain||!definitelyRejected)uncertain=true;else payload=null;
    throw error;
   }
  },
  clear(){payload=null;uncertain=false;},
 };
}
