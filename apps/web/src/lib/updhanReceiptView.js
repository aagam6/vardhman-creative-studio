import {updhanAcknowledgement} from './updhanAcknowledgement.js';
// Freeze the receipt's display text before clearing the editable form. Nothing
// is persisted in browser storage and no health/contact/photo fields are copied.
export function createUpdhanReceiptView(receipt,name){
 return {...receipt,acknowledgement:updhanAcknowledgement(receipt.reference,'hi',name)};
}
