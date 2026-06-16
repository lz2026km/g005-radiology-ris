import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'gateway', version: '3.0.3.30' });
});

router.get('/metrics', (_req, res) => {
  res.json({ uptime: process.uptime(), memory: process.memoryUsage(), timestamp: new Date().toISOString() });
});

export default router;
export { rateLimiter } from './rateLimiter';
export { circuitBreaker, registerCircuit, getCircuitState, recordFailure, recordSuccess } from './circuitBreaker';
export { loadBalancer, getNextTarget, setTargets, setAlgorithm, forwardRequest } from './loadBalancer';
export type { UpstreamTarget } from './loadBalancer';
export { registerInstance, deregisterInstance, discoverService, heartbeat, cleanupStaleInstances, getServiceTargets } from './serviceDiscovery';
export type { ServiceInstance } from './serviceDiscovery';
export { apiVersioning, registerRoute, resolveVersion, findHandler, compareVersions } from './apiVersioning';
export type { VersionedRoute } from './apiVersioning';
