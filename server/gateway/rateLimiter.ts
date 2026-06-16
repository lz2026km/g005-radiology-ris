interface TokenBucket {
  tokens: number;
  lastRefill: number;
  capacity: number;
  refillRate: number;
}

const buckets = new Map<string, TokenBucket>();

function getBucket(key: string, capacity: number, refillRate: number): TokenBucket {
  let bucket = buckets.get(key);
  const now = Date.now();
  if (!bucket) {
    bucket = { tokens: capacity, lastRefill: now, capacity, refillRate };
    buckets.set(key, bucket);
  }
  const elapsed = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(bucket.capacity, bucket.tokens + elapsed * bucket.refillRate);
  bucket.lastRefill = now;
  return bucket;
}

export function rateLimiter(capacity: number = 100, refillRate: number = 10) {
  return (req: any, res: any, next: () => void) => {
    const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const bucket = getBucket(key, capacity, refillRate);
    if (bucket.tokens < 1) {
      return res.status(429).json({ success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    bucket.tokens -= 1;
    next();
  };
}

export function resetRateLimiter(): void {
  buckets.clear();
}
