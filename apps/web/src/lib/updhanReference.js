// Pad the event's durable sequence without resetting after 9999.
export function updhanReference(sequence){
 if(typeof sequence==='number'&&!Number.isSafeInteger(sequence))throw new Error('Valid registration sequence required');
 const token=String(sequence);
 if(!/^[1-9][0-9]*$/.test(token))throw new Error('Valid registration sequence required');
 return `UPD-2027-${token.padStart(4,'0')}`;
}
