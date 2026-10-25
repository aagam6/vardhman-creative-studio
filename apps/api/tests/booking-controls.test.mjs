import test from 'node:test';
import assert from 'node:assert/strict';
import {assertLocalControls,attachBookingControls,potentialDuplicates,normalizeName} from '../booking-controls.mjs';
test('local controls reject production, missing disposable consent and WhatsApp',()=>{
 for(const config of [{},{disposable:true,database:{host:'production',database:'ayambil_test_x'},origin:'http://127.0.0.1:3136'},{disposable:true,database:{host:'127.0.0.1',database:'live'},origin:'http://127.0.0.1:3136'},{disposable:true,database:{host:'127.0.0.1',database:'ayambil_test_x'},origin:'http://127.0.0.1:3136',whatsappEnabled:true}])assert.throws(()=>assertLocalControls(config));
 const local={disposable:true,database:{host:'127.0.0.1',database:'ayambil_test_x'},origin:'http://127.0.0.1:3136'};
 assert.throws(()=>attachBookingControls({},{pool:{config:{connectionConfig:{host:'remote',database:'ayambil_test_x'}}}},local));
 assert.throws(()=>attachBookingControls({},{pool:{config:{connectionConfig:{host:'127.0.0.1',database:'live'}}}},local));
});
test('duplicate hints require phone/date/name overlap; normalize English and Gujarati without transliteration guesses',()=>{
 assert.equal(normalizeName('  SHAH   Jay '),'shah jay');assert.equal(normalizeName('  મીનાક્ષીબેન   શાહ '),'મીનાક્ષીબેન શાહ');
 const b=(id,names,eventDate='2026-11-02',mobile='+91 12345')=>({id,names,eventDate,mobile});
 assert.equal(potentialDuplicates([b('1',['Shah Jay']),b('2',[' SHAH  JAY','Extra'])]).length,1);
 assert.equal(potentialDuplicates([b('1',['Shah Jay']),b('2',['Other person'])]).length,0);
 assert.equal(potentialDuplicates([b('1',['Shah Jay']),b('2',['Shah Jay'],'2026-11-03')]).length,0);
 assert.equal(potentialDuplicates([b('1',['Shah Jay']),b('2',['Shah Jay'],'2026-11-02','98765')]).length,0);
});
