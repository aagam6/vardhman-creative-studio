export function messageOverviewCards(totals={}){
 return {
  main:[['Actionable pending · old queue','legacyActionablePending'],...(totals.pendingNotifications!==undefined?[['Modern outbox · awaiting / held records','pendingNotifications'],['Modern outbox · failed','failedNotifications'],['Modern outbox · blocked','blockedNotifications']]:[])],
  history:[['Old queue · original pending records (includes resolved)','pendingMessages'],['Old queue · history resolved','legacyHistoryResolved'],['Old queue · held / unresolved history','legacyHistoryUnresolved'],['Legacy queue · failure history','failedMessages']]
 };
}
