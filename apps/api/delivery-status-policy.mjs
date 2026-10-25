export function nextDeliveryStatus(previous,incoming){
 const rank={accepted:0,sent:1,delivered:2,read:3};
 if(!['accepted','sent','delivered','read','failed'].includes(incoming))throw Error('Unverified provider status');
 if(['delivered','read'].includes(previous)&&incoming==='failed')return previous;
 if(previous==='failed'&&!['delivered','read'].includes(incoming))return previous;
 if(incoming!=='failed'&&(rank[incoming]??-1)<(rank[previous]??-1))return previous;
 return incoming;
}
