export function tenantMiddleware(req: any, _res: any, next: () => void) {
  const tenantId = req.headers['x-tenant-id'] || req.headers['x-site-id'] || 'default';
  req.tenant = { id: tenantId, isolation: 'database' };
  next();
}
