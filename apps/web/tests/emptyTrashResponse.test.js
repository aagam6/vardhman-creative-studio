import test from 'node:test';
import assert from 'node:assert/strict';
import {validateResponse} from '../src/lib/ayambilExpressClient.js';
test('admin can display explicitly purged attendee history without weakening registration validation',()=>{
 const attendee={id:'local-attendee',fullName:'Local History',status:'cancelled',dates:['2026-11-02'],passes:[],passHistoryPurged:true};
 const booking={id:'local-booking',number:'BOOK26-LOCAL',status:'cancelled',attendees:[attendee]};
 const response={items:[booking],page:1,hasMore:false,integration:{ready:false,missing:[]}};
 assert.doesNotThrow(()=>validateResponse('admin/bookings',response));
 assert.throws(()=>validateResponse('register',booking),/Invalid attendee/);
 delete attendee.passHistoryPurged;assert.throws(()=>validateResponse('admin/bookings',response),/Invalid attendee/);
});
