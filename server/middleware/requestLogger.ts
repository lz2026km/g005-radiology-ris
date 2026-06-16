export function requestLoggerMiddleware(req: any, _res: any, next: () => void) {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  const originalEnd = _res.end.bind(_res);
  _res.end = function (...args: any[]) {
    const duration = Date.now() - start;
    console.log(`[REQ] ${timestamp} ${req.method} ${req.originalUrl || req.url} ${_res.statusCode} ${duration}ms`);
    if (_res.statusCode >= 400) {
      console.log(`[REQ_ERR] Body: ${JSON.stringify(req.body)}`);
    }
    return originalEnd(...args);
  };
  next();
}
