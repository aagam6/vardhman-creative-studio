import test from 'node:test';import assert from 'node:assert/strict';
import {createUpdhanReceiptView} from '../src/lib/updhanReceiptView.js';
test('saved receipt still renders correct name/reference after editable form is erased',()=>{
 const form={name:'भावेश शाह',health:'private',whatsapp:'9999999999'};
 const receipt=createUpdhanReceiptView({id:'synthetic-id',reference:'UPD-2027-0025',status:'received'},form.name);
 form.name='';form.health='';form.whatsapp='';
 assert.match(receipt.acknowledgement,/भावेश शाह/);assert.match(receipt.acknowledgement,/UPD-2027-0025/);
 assert.deepEqual(Object.keys(receipt).sort(),['acknowledgement','id','reference','status']);
 assert.equal(receipt.status,'received');assert.equal(receipt.health,undefined);assert.equal(receipt.whatsapp,undefined);
});
