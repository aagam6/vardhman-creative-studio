import test from 'node:test';
import assert from 'node:assert/strict';
import {bookingPassToken,verifyBookingPassToken} from '../booking-pass-link.mjs';
import {programme} from '../config.mjs';
test('booking link is scoped, signed, expires, and cannot act as an individual capability',()=>{
 const secret='a'.repeat(64),id='11111111-1111-4111-8111-111111111111';
 const token=bookingPassToken(secret,id,programme.sessions[0]);
 assert.equal(verifyBookingPassToken(secret,token,0),id);assert.notEqual(token.length,64);
 for(const changed of [token.replace(id,'22222222-2222-4222-8222-222222222222'),token.replace(/.$/,'z'),token.replace('B1.','B2.'),'A'.repeat(64)])assert.throws(()=>verifyBookingPassToken(secret,changed,0));
 assert.throws(()=>verifyBookingPassToken('b'.repeat(64),token,0));
 assert.throws(()=>verifyBookingPassToken(secret,token,Date.parse('2026-11-04T00:00:00Z')));
});
