import test from 'node:test';import assert from 'node:assert/strict';
import {duplicateReviewState} from '../duplicate-review-state.mjs';
import {attendanceEligibility} from '../attendance-eligibility.mjs';
import {scopedKpis} from '../booking-review-analysis.mjs';
const b=id=>({id,eventDate:'2026-11-02',mobile:'+919999999999',names:['Guest One']});
const review=(action)=>({id:'review',purpose:'duplicate',event_date:'2026-11-02',contact_key:'919999999999',snapshot:[b('a'),b('b')],response:{attending:'yes',count:1},decision:action?{action}:null});
test('manual cancellation removes obsolete overlap and open review from active KPI without changing history',()=>{const rows=[b('a')],reviews=[review()],before=JSON.stringify(reviews);assert.equal(duplicateReviewState(rows,reviews).groups.length,0);assert.equal(scopedKpis(rows,[],reviews).duplicateAwaitingAdmin,0);assert.equal(attendanceEligibility({bookings:rows,reviews,eventDate:rows[0].eventDate,mobile:rows[0].mobile}).eligible,true);assert.equal(JSON.stringify(reviews),before);});
test('reviewed and applied complete current scopes leave active duplicate queue, but new overlap is held',()=>{for(const action of ['reviewed','applied']){const rows=[b('a'),b('b')],reviews=[review(action)];assert.equal(duplicateReviewState(rows,reviews).groups.length,0);assert.equal(scopedKpis(rows,[],reviews).potentialDuplicateGroups,0);assert.equal(duplicateReviewState([...rows,b('c')],reviews).groups.length,1);}});
test('response alone cannot resolve overlapping active bookings',()=>{assert.equal(duplicateReviewState([b('a'),b('b')],[review()]).groups.length,1);});
