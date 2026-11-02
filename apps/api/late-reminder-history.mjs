// Complete authenticated recipient history only; no new round to bypass a receipt.
export function assertNoReminderReceipt(receipts){
 if(!Array.isArray(receipts)||receipts.some(r=>!r||typeof r.id!=='string'||!r.id||typeof r.status!=='string'))throw Error('Complete recipient receipt history required');
 if(receipts.some(r=>['ayambil_entry_timing_bilingual','ayambil_event_reminder'].includes(r.template)))throw Error('Recipient reminder already recorded; no resend');
}
