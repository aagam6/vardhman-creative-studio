import test from 'node:test';import assert from 'node:assert/strict';
import {queueSummary,queueNeedsReview,queueExplanation} from '../src/lib/ayambilQueuePresentation.js';
test('queue metrics distinguish delivered evidence from accepted/sent and attempted queued jobs',()=>{
 const messages=[{status:'read'},{status:'delivered'},{status:'sent'},{status:'accepted'},{status:'queued',attempts:0},{status:'queued',attempts:2},{status:'uncertain',attempts:1}];
 assert.deepEqual(queueSummary(messages),{loaded:7,queued:1,delivered:2,review:2});assert.equal(queueNeedsReview(messages[5]),true);assert.match(queueExplanation(messages[4]),/Not submitted/);assert.match(queueExplanation(messages[6]),/do not retry/);assert.match(queueExplanation(messages[2]),/not confirmed/);
});
