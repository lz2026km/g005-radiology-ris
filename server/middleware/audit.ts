export function auditMiddleware(req: any, _res: any, next: () => void) {
  const start = Date.now();
  const originalEnd = _res.end.bind(_res);
  _res.end = function (...args: any[]) {
    const duration = Date.now() - start;
    console.log(`[AUDIT] ${req.method} ${req.url} ${_res.statusCode} ${duration}ms`);
    return originalEnd(...args);
  };
  next();
}
