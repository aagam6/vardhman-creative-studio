import test from 'node:test';import assert from 'node:assert/strict';
import {queueCrypto} from '../message-queue.mjs';
test('Queue authenticated encryption protects recipients and capabilities, rejects tampering and missing keys',()=>{assert.throws(()=>queueCrypto(''));const crypto=queueCrypto('a'.repeat(64));const payload={to:'12025550123',passLink:'synthetic-private-only'};const encrypted=crypto.seal(payload);assert.doesNotMatch(encrypted,/synthetic-private/);assert.deepEqual(crypto.open(encrypted),payload);assert.throws(()=>queueCrypto('b'.repeat(64)).open(encrypted));});
