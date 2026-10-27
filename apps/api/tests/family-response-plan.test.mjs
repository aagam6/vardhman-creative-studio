import test from 'node:test';
import assert from 'node:assert/strict';
import {familyResponsePlan} from '../family-response-plan.mjs';
const names=['One Guest','Two Guest','Three Guest','Four Guest','Five Guest','Six Guest'];
const snap=[{id:'b',names}],current=names.map((full_name,i)=>({id:String(i),booking_id:'b',full_name,status:'active',valid_passes:1}));
test('six to five preserves five identities, rejects additions and total mismatch',()=>{
 assert.deepEqual(familyResponsePlan(snap,current,{attending:'yes',names:names.slice(0,5),count:5},'attendance'),{keepIds:['0','1','2','3','4'],cancelIds:['5']});
 for(const input of [{attending:'yes',names:[...names,'Extra Guest'],count:7},{attending:'yes',names:['Replacement Guest'],count:1},{attending:'yes',names:[names[0],names[0]],count:2},{attending:'yes',names:[],count:0}])assert.throws(()=>familyResponsePlan(snap,current,input,'attendance'));
});
test('No cancels scope; duplicate choice retains only its existing identities',()=>{
 assert.equal(familyResponsePlan(snap,current,{attending:'no',names:[],count:0},'attendance').cancelIds.length,6);
 const other={id:'other',booking_id:'older',full_name:names[0],status:'active',valid_passes:1};
 assert.deepEqual(familyResponsePlan([...snap,{id:'older',names:[names[0]]}],[...current,other],{attending:'yes',names:names.slice(0,5),count:5,finalBookingId:'b'},'duplicate').cancelIds,['5','other']);
 assert.throws(()=>familyResponsePlan(snap,current,{attending:'yes',names:[names[0]],count:1,finalBookingId:'foreign'},'duplicate'));
 assert.throws(()=>familyResponsePlan(snap,current.map(a=>({...a,valid_passes:0})),{attending:'yes',names:[names[0]],count:1},'attendance'));
});
