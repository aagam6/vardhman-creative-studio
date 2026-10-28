import test from 'node:test';
import assert from 'node:assert/strict';
import {notificationOperationError} from '../src/lib/notificationOperationError.js';
test('delivery-check denial does not imply send uncertainty',()=>{
  const text=notificationOperationError('reconcile',{status:403});
  assert.match(text,/HTTP 403/);assert.match(text,/does not send or resend/);assert.doesNotMatch(text,/unconfirmed/);
});
test('send uncertainty requires durable reconciliation and does not claim no submission',()=>{
  const text=notificationOperationError('send',{status:503,requestId:'private token'});
  assert.match(text,/unconfirmed/);assert.match(text,/do not retry blindly/);assert.doesNotMatch(text,/No send|private token/);
});
