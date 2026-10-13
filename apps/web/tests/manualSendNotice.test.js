import test from 'node:test';
import assert from 'node:assert/strict';
import {manualSendFailureNotice} from '../src/lib/ayambilManualSendNotice.js';
test('manual send distinguishes eligibility, approval and throttling without echoing private errors',()=>{
  for(const status of [400,401,403,409,429]) {
    const notice=manualSendFailureNotice({status,message:'PRIVATE TOKEN AND PROVIDER BODY'});
    assert.ok(!notice.includes('PRIVATE'));
    assert.ok(!notice.includes('could not be confirmed'));
  }
  assert.match(manualSendFailureNotice({status:409}),/predate manual activation/);
  assert.match(manualSendFailureNotice({status:429}),/rate limit/);
});
test('network and server failures retain uncertain-send warning without suggesting retry',()=>{
  for(const error of [undefined,new Error('private details'),{status:500},{status:503}]) {
    assert.match(manualSendFailureNotice(error),/reconcile provider status before any retry/);
  }
});
