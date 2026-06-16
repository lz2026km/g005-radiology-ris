const metrics = {
  requestsTotal: 0,
  requestsByMethod: {} as Record<string, number>,
  requestsByPath: {} as Record<string, number>,
  requestsByStatus: {} as Record<string, number>,
  errorsTotal: 0,
  responseTimeTotal: 0,
  responseTimeCount: 0,
  avgResponseTimeMs: 0,
  startTime: Date.now(),
};

export function metricsMiddleware(req: any, res: any, next: () => void) {
  const start = Date.now();
  metrics.requestsTotal++;
  metrics.requestsByMethod[req.method] = (metrics.requestsByMethod[req.method] || 0) + 1;
  const path = req.route?.path || req.path || req.url;
  metrics.requestsByPath[path] = (metrics.requestsByPath[path] || 0) + 1;

  const originalEnd = res.end.bind(res);
  res.end = function (...args: any[]) {
    const duration = Date.now() - start;
    const statusKey = String(res.statusCode);
    metrics.requestsByStatus[statusKey] = (metrics.requestsByStatus[statusKey] || 0) + 1;
    if (res.statusCode >= 500) metrics.errorsTotal++;
    metrics.responseTimeTotal += duration;
    metrics.responseTimeCount++;
    metrics.avgResponseTimeMs = metrics.responseTimeTotal / metrics.responseTimeCount;
    return originalEnd(...args);
  };
  next();
}

export function getMetrics() {
  return {
    ...metrics,
    uptime: Math.floor((Date.now() - metrics.startTime) / 1000),
    timestamp: new Date().toISOString(),
  };
}

export function resetMetrics() {
  metrics.requestsTotal = 0;
  metrics.requestsByMethod = {};
  metrics.requestsByPath = {};
  metrics.requestsByStatus = {};
  metrics.errorsTotal = 0;
  metrics.responseTimeTotal = 0;
  metrics.responseTimeCount = 0;
  metrics.avgResponseTimeMs = 0;
  metrics.startTime = Date.now();
}
