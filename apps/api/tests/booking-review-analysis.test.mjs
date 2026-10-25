import test from 'node:test';
import assert from 'node:assert/strict';
import {potentialDuplicates,duplicateGroups,nameReviewReasons,scopedKpis} from '../booking-review-analysis.mjs';
const b=(id,names,mobile='+91 12345',eventDate='2026-11-02')=>({id,number:id,names,mobile,eventDate,contactName:names[0]});
test('exact, 5-versus-4 subset and partial overlap form one potential group; same phone alone does not',()=>{
 const rows=[b('a',['A name','B name','C name','D name','E name']),b('b',[' a NAME ','B name','C name','D name']),b('c',['A name','B name','C name','D name']),b('d',['D name','Other member']),b('e',['Unrelated person'])];
 const pairs=potentialDuplicates(rows);assert.equal(pairs.find(p=>p.bookingIds.join()==='a,b').relation,'subset');assert.equal(pairs.find(p=>p.bookingIds.join()==='b,c').relation,'exact');assert.equal(pairs.find(p=>p.bookingIds.join()==='a,d').relation,'partial');assert.equal(duplicateGroups(rows).length,1);assert.equal(duplicateGroups(rows)[0].bookingCount,4);
 assert.equal(potentialDuplicates([b('1',['Name']),b('2',['Name'],'+9112345','2026-11-03')]).length,0);
});
test('name review remains separate from duplicate proof',()=>{assert.ok(nameReviewReasons('LOCAL Test Guest').length);assert.ok(nameReviewReasons('પરીક્ષણ એક').length);assert.ok(nameReviewReasons('12345').length);assert.deepEqual(nameReviewReasons('મીનાક્ષીબેન શાહ'),[]);assert.equal(potentialDuplicates([b('x',['LOCAL Test Guest'])]).length,0);});
test('KPIs distinguish forms/persons/unique phones and contact-event attendance responses',()=>{
 const bookings=[b('a',['Person A','Person B']),b('b',['Person C'],'+919999'),b('c',['Person D'],'+918888'),b('d',['Person E'],'+9112345','2026-11-03')];
 const waiting=[{status:'waiting',groupSize:5,mobile:'+91 777'},{status:'waiting',groupSize:4,mobile:'+91777'},{status:'approved',groupSize:6,mobile:'+91888'}];
 const review=(id,booking,attending,count)=>({id,purpose:'attendance',event_date:booking.eventDate,snapshot:[booking],created_at:'2026-10-25 '+id,response:{attending,count}});
 const reviews=[review('09:00',bookings[0],'yes',2),review('09:01',bookings[1],'no',0)];const k=scopedKpis(bookings,waiting,reviews);
 assert.equal(k.waitingBookings,2);assert.equal(k.waitingPersons,9);assert.equal(k.uniqueWaitingMobiles,1);assert.equal(k.attendanceYes,1);assert.equal(k.attendanceNo,1);assert.equal(k.attendanceUnanswered,2);assert.equal(k.confirmedAttendingPersons,2);assert.equal(k.responseCoverage,50);assert.equal(k.confirmedContacts,4);
});
