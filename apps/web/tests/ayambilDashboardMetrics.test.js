import test from 'node:test';
import assert from 'node:assert/strict';
import {dashboardMetrics} from '../src/lib/ayambilDashboardMetrics.js';
test('page metrics count active attendees without including cancelled bookings or attendees',()=>{
 assert.deepEqual(dashboardMetrics([{status:'active',attendees:[{status:'active'},{status:'cancelled'}]},{status:'cancelled',attendees:[{status:'active'}]}]),{bookings:2,active:1,cancelled:1,attendees:1});
 assert.deepEqual(dashboardMetrics([]),{bookings:0,active:0,cancelled:0,attendees:0});
});
