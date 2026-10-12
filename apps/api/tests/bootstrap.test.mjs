import test from 'node:test';
import assert from 'node:assert/strict';
import {programme} from '../config.mjs';
import {validateInitialProgramme} from '../bootstrap.mjs';
test('Bootstrap snapshot validation rejects missing, altered and duplicate evenings',()=>{
 validateInitialProgramme(programme);
 for(const value of [null,{}, {...programme,sessions:[]},{...programme,sessions:[programme.sessions[0],programme.sessions[0]]},{...programme,sessions:programme.sessions.map(s=>({...s,venue:''}))}])assert.throws(()=>validateInitialProgramme(value));
});
