import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('STATIC SQL review assertions: max two, relational links, hashes and no open gate',()=>{
 const sql=readFileSync(new URL('../migrations/001_ayambil.sql',import.meta.url),'utf8');
 for(const expected of ['CHECK(ordinal BETWEEN 1 AND 2)','UNIQUE(booking_id,ordinal)','key_hash CHAR(64) PRIMARY KEY','revoked_at DATETIME(3)','UNIQUE(current_attendee)','FOREIGN KEY(booking_id,event_date)','registration_open BOOLEAN NOT NULL DEFAULT FALSE'])assert.ok(sql.includes(expected),expected);
 assert.doesNotMatch(sql,/DROP TABLE|TRUNCATE|registration_open.*DEFAULT TRUE/i);
});
