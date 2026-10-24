export function maintenanceStatus(setting,now=Date.now()){
 if(!setting?.maintenance_active)return null;
 const raw=setting.maintenance_until;const until=raw instanceof Date?raw.getTime():typeof raw==='string'?Date.parse(raw.replace(' ','T')+'Z'):NaN;
 return {active:true,estimatedEnd:Number.isFinite(until)?new Date(until).toISOString():null,serverTime:new Date(now).toISOString(),estimated:true};
}
