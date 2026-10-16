import test from 'node:test';
import assert from 'node:assert/strict';
import {validateResponse,supportedOperations} from '../src/lib/ayambilExpressClient.js';
test('Trash responses validate names, booking association, cancelled state and bounded pagination',()=>{
 const pass={passNumber:'AYV26-EXAMPLE',attendeeName:'Example Guest',bookingId:'booking-id',bookingNumber:'BOOK26-EXAMPLE',contactName:'Contact Guest',trashedAt:'2026-10-15 13:00:00',eventDate:'2026-11-03',status:'cancelled'};
 const result={items:[pass],page:1,hasMore:false};validateResponse('admin/trash',result);assert.deepEqual(supportedOperations['admin/trash'],['GET']);
 validateResponse('admin/trash',{items:[],page:1,hasMore:false});
 for(const invalid of [{...result,page:0},{...result,items:Array(51).fill(pass)},{...result,items:[{...pass,status:'active'}]},{...result,items:[{...pass,bookingId:''}]},{...result,items:[{...pass,trashedAt:null}]}])assert.throws(()=>validateResponse('admin/trash',invalid));
});
