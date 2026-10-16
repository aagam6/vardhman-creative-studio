import test from 'node:test';
import assert from 'node:assert/strict';
import {jsPDF} from 'jspdf';
import {downloadableBookingPasses,cancelledListBooking} from '../src/lib/ayambilBookingPasses.js';
import {assemblePassCollectionPdf} from '../src/lib/ayambilPassLayout.js';

test('combined download includes only distinct active passes of active attendees and bookings',()=>{
 const booking={status:'active',attendees:[{status:'active',passes:[{number:'one',status:'active'},{number:'two',status:'active'},{number:'old',status:'superseded'},{number:'cancel',status:'cancelled'},{number:'trash',status:'active',trashedAt:'date'},{number:'one',status:'active'}]},{status:'cancelled',passes:[{number:'three',status:'active'}]}]};
 const original=structuredClone(booking);
 assert.deepEqual(downloadableBookingPasses(booking).map(p=>p.number),['one','two']);
 assert.deepEqual(downloadableBookingPasses({...booking,status:'cancelled'}),[]);assert.deepEqual(booking,original);
});
test('Cancelled list omits trashed passes and their participants without changing history',()=>{
 const booking={attendees:[{fullName:'Mixed',passes:[{number:'cancel',status:'cancelled'},{number:'trash',status:'cancelled',trashedAt:'date'}]},{fullName:'Trash only',passes:[{status:'cancelled',trashedAt:'date'}]}]};
 const original=structuredClone(booking),result=cancelledListBooking(booking);
 assert.equal(result.attendees.length,1);assert.deepEqual(result.attendees[0].passes.map(p=>p.number),['cancel']);assert.deepEqual(booking,original);
});
for(const count of [5,6])test(`${count} passes download in one PDF with ordered front/reverse pages and original dimensions`,()=>{
 const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGP4DwQACfsD/fteaysAAAAASUVORK5CYII=';
 const pages=Array.from({length:count*2},(_,i)=>({image,ratio:120/205,links:[{url:`https://maps.google.com/?q=${i}`,x:0,y:0,width:0.1,height:0.1}]}));
 const pdf=assemblePassCollectionPdf(jsPDF,pages);assert.equal(pdf.getNumberOfPages(),count*2);
 for(let i=1;i<=count*2;i++){pdf.setPage(i);assert.ok(Math.abs(pdf.internal.pageSize.getWidth()-205)<0.001);assert.ok(Math.abs(pdf.internal.pageSize.getHeight()-120)<0.001);}
 assert.throws(()=>assemblePassCollectionPdf(jsPDF,pages.slice(1)),/Invalid pass layout/);
});
