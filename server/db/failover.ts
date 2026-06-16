export type DbRole = 'primary' | 'replica' | 'standby';
export type FailoverStatus = 'healthy' | 'degraded' | 'failed' | 'switching' | 'recovering';

export interface DbInstance {
  id: string;
  name: string;
  role: DbRole;
  host: string;
  port: number;
  database: string;
  user: string;
  status: FailoverStatus;
  replicationLagMs: number;
  lastHeartbeat: string;
  connectedClients: number;
  maxConnections: number;
}

export interface FailoverConfig {
  autoFailover: boolean;
  failoverThresholdMs: number;
  healthCheckIntervalMs: number;
  maxReplicationLagMs: number;
  replicaReadWeight: number;
  primaryWriteWeight: number;
}

let primary: DbInstance | null = null;
let replicas: DbInstance[] = [];
let currentRole: DbRole = 'primary';
let isSwitching = false;

const config: FailoverConfig = {
  autoFailover: true,
  failoverThresholdMs: 30000,
  healthCheckIntervalMs: 10000,
  maxReplicationLagMs: 5000,
  replicaReadWeight: 70,
  primaryWriteWeight: 100,
};

export function configureFailover(cfg: Partial<FailoverConfig>): void {
  Object.assign(config, cfg);
}

export function getConfig(): FailoverConfig {
  return { ...config };
}

export function registerPrimary(instance: Omit<DbInstance, 'status' | 'lastHeartbeat'>): DbInstance {
  primary = { ...instance, status: 'healthy', lastHeartbeat: new Date().toISOString() };
  return primary;
}

export function registerReplica(instance: Omit<DbInstance, 'status' | 'lastHeartbeat'>): DbInstance {
  const replica = { ...instance, status: 'healthy', lastHeartbeat: new Date().toISOString() };
  replicas.push(replica);
  return replica;
}

export function healHeartbeat(instanceId: string): boolean {
  const instance = primary?.id === instanceId ? primary : replicas.find(r => r.id === instanceId);
  if (!instance) return false;
  instance.lastHeartbeat = new Date().toISOString();
  instance.status = 'healthy';
  return true;
}

export function checkPrimaryHealth(): FailoverStatus {
  if (!primary) return 'failed';
  const now = Date.now();
  const lastBeat = new Date(primary.lastHeartbeat).getTime();
  if (now - lastBeat > config.failoverThresholdMs) {
    primary.status = 'failed';
    if (config.autoFailover && !isSwitching) {
      triggerFailover();
    }
    return 'failed';
  }
  primary.status = 'healthy';
  return 'healthy';
}

export function checkReplicasHealth(): DbInstance[] {
  const unhealthy: DbInstance[] = [];
  for (const replica of replicas) {
    const now = Date.now();
    const lastBeat = new Date(replica.lastHeartbeat).getTime();
    if (now - lastBeat > config.failoverThresholdMs) {
      replica.status = 'failed';
      unhealthy.push(replica);
    } else {
      replica.status = 'healthy';
    }
  }
  return unhealthy;
}

export function getHealthyReplicas(): DbInstance[] {
  return replicas.filter(r => r.status === 'healthy');
}

export function getReplicationLag(): number {
  return Math.max(...replicas.map(r => r.replicationLagMs), 0);
}

export async function triggerFailover(): Promise<{ success: boolean; newPrimary?: DbInstance; message: string }> {
  if (isSwitching) return { success: false, message: 'Failover already in progress' };
  isSwitching = true;
  try {
    const healthyReplicas = getHealthyReplicas();
    if (healthyReplicas.length === 0) {
      return { success: false, message: 'No healthy replicas available for failover' };
    }
    const newPrimary = healthyReplicas.reduce((best, r) => r.replicationLagMs < best.replicationLagMs ? r : best);
    if (primary) primary.status = 'standby';
    newPrimary.role = 'primary';
    currentRole = 'primary';
    primary = newPrimary;
    replicas = replicas.filter(r => r.id !== newPrimary.id);
    return { success: true, newPrimary, message: `Failover completed. New primary: ${newPrimary.name}` };
  } finally {
    isSwitching = false;
  }
}

export async function triggerFailback(): Promise<{ success: boolean; message: string }> {
  if (!primary) return { success: false, message: 'No primary to fail back from' };
  return { success: true, message: `Failback initiated from ${primary.name}` };
}

export function getCurrentRole(): DbRole {
  return currentRole;
}

export function getPrimary(): DbInstance | null {
  return primary;
}

export function getAllInstances(): DbInstance[] {
  return primary ? [primary, ...replicas] : [...replicas];
}

export function getDbHealth(): { primary: FailoverStatus; replicaCount: number; healthyReplicas: number; replicationLagMs: number } {
  const primaryStatus = checkPrimaryHealth();
  checkReplicasHealth();
  return {
    primary: primaryStatus,
    replicaCount: replicas.length,
    healthyReplicas: getHealthyReplicas().length,
    replicationLagMs: getReplicationLag(),
  };
}
