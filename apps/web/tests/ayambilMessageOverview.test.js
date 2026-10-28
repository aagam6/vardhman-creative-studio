import test from 'node:test';import assert from 'node:assert/strict';
import {messageOverviewCards} from '../src/lib/ayambilMessageOverview.js';
test('main pending uses actionable source only; historical and awaiting records are separate units',()=>{
 const totals={pendingMessages:24,legacyHistoryResolved:24,legacyHistoryUnresolved:7,legacyActionablePending:0,pendingNotifications:17};
 const cards=messageOverviewCards(totals);const pending=cards.main.filter(([label])=>/pending/i.test(label));
 assert.deepEqual(pending,[['Actionable pending · old queue','legacyActionablePending']]);assert.equal(totals[pending[0][1]],0);
 assert.ok(cards.history.some(([,key])=>key==='pendingMessages'));assert.ok(!cards.main.some(([,key])=>key==='pendingMessages'));
 assert.ok(cards.main.some(([label,key])=>key==='pendingNotifications'&&/awaiting \/ held/.test(label)&&!/pending/i.test(label)));
 assert.equal(messageOverviewCards({}).main[0][1],'legacyActionablePending');
});
