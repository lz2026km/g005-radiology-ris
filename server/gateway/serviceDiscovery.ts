import type { UpstreamTarget } from './loadBalancer';

export interface ServiceInstance {
  id: string;
  name: string;
  version: string;
  url: string;
  healthEndpoint: string;
  metadata: Record<string, string>;
  registeredAt: string;
  lastHeartbeat: string;
  ttl: number;
}

const instances = new Map<string, ServiceInstance>();

export function registerInstance(instance: Omit<ServiceInstance, 'id' | 'registeredAt' | 'lastHeartbeat'>): ServiceInstance {
  const svc: ServiceInstance = {
    ...instance,
    id: `${instance.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    registeredAt: new Date().toISOString(),
    lastHeartbeat: new Date().toISOString(),
  };
  instances.set(svc.id, svc);
  return svc;
}

export function deregisterInstance(id: string): boolean {
  return instances.delete(id);
}

export function getInstance(id: string): ServiceInstance | undefined {
  return instances.get(id);
}

export function discoverService(name: string, version?: string): ServiceInstance[] {
  const results = Array.from(instances.values()).filter(i => i.name === name);
  return version ? results.filter(i => i.version === version) : results;
}

export function heartbeat(instanceId: string): boolean {
  const inst = instances.get(instanceId);
  if (!inst) return false;
  inst.lastHeartbeat = new Date().toISOString();
  return true;
}

export function cleanupStaleInstances(maxAgeMs: number = 60000): number {
  const now = Date.now();
  let count = 0;
  for (const [id, inst] of instances) {
    if (now - new Date(inst.lastHeartbeat).getTime() > maxAgeMs) {
      instances.delete(id);
      count++;
    }
  }
  return count;
}

export function getServiceTargets(name: string): UpstreamTarget[] {
  const services = discoverService(name);
  return services.map(s => ({
    id: s.id,
    url: s.url,
    weight: 1,
    healthy: true,
    activeConnections: 0,
    maxConnections: 100,
  }));
}
