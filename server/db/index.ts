export { createDamengAdapter } from './dameng'
export type { DamengConfig, DamengAdapter, DomestidDbVendor } from './dameng'
export { createKingbaseAdapter } from './kingbase'
export type { KingbaseConfig } from './kingbase'
export { createGbaseAdapter } from './gbase'
export type { GbaseConfig } from './gbase'
export {
  registerDomesticDb, getDomesticDb, getAllDomesticDbs,
  domesticDbHealthCheck, getDomesticDbDialect, translateToDomesticSql,
} from './domestic'
export type { DomesticDbInstance } from './domestic'
export {
  configureFailover, getConfig, registerPrimary, registerReplica,
  healHeartbeat, checkPrimaryHealth, checkReplicasHealth,
  getHealthyReplicas, getReplicationLag, triggerFailover,
  triggerFailback, getCurrentRole, getPrimary, getAllInstances, getDbHealth,
} from './failover'
export type { DbRole, FailoverStatus, DbInstance, FailoverConfig } from './failover'
