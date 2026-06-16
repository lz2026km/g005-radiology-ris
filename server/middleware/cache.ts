const cacheStore = new Map<string, { data: unknown; expiry: number }>();

export function cacheMiddleware(durationMs: number = 60000) {
  return (req: any, res: any, next: () => void) => {
    if (req.method !== 'GET') return next();
    const key = `cache:${req.originalUrl || req.url}`;
    const cached = cacheStore.get(key);
    if (cached && Date.now() < cached.expiry) {
      return res.json(cached.data);
    }
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      cacheStore.set(key, { data: body, expiry: Date.now() + durationMs });
      return originalJson(body);
    };
    next();
  };
}

export function invalidateCache(pattern?: string): number {
  if (!pattern) {
    const count = cacheStore.size;
    cacheStore.clear();
    return count;
  }
  let count = 0;
  for (const key of cacheStore.keys()) {
    if (key.includes(pattern)) {
      cacheStore.delete(key);
      count++;
    }
  }
  return count;
}
