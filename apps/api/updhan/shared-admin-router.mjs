import {createAyambilBackedUpdhanAuthenticator} from './ayambil-admin-auth.mjs';
import {createUpdhanProductionRouter} from './production-server.mjs';
// Explicit composition entry point. identityPool is a separately provisioned
// SELECT-only account for ayambil_admins; pool writes Updhan tables only.
// Never creates accounts, migrates, connects, starts workers or changes Ayambil.
export function createUpdhanSharedAdminRouter({identityPool,...options}) {
 if(options.authenticate)throw Error('Shared admin authentication cannot be overridden');
 return createUpdhanProductionRouter({...options,authenticate:createAyambilBackedUpdhanAuthenticator({identityPool})});
}
