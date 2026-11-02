// These errors prove no provider acceptance; actual POST outcomes stay terminal/uncertain.
export const isProviderBudgetDeferral=error=>['LOCAL_FLOW_BUDGET','PROVIDER_COOLDOWN','PROVIDER_HTTP_429'].includes(error?.code);
