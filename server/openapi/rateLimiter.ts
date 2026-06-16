import { Router, type Request, type Response } from 'express';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const limits = new Map<string, RateLimitEntry>();
let config: RateLimitConfig = { windowMs: 60000, maxRequests: 100 };

export function rateLimiterRouter(): Router {
  const router = Router();

  router.get('/openapi/limits', (_req: Request, res: Response) => {
    res.json({ success: true, data: { ...config, activeKeys: limits.size } });
  });

  router.put('/openapi/limits', (req: Request, res: Response) => {
    if (req.body.windowMs) config.windowMs = req.body.windowMs;
    if (req.body.maxRequests) config.maxRequests = req.body.maxRequests;
    res.json({ success: true, data: { ...config } });
  });

  return router;
}

export function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  let entry = limits.get(key);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + config.windowMs };
    limits.set(key, entry);
  }

  entry.count++;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  return { allowed: entry.count <= config.maxRequests, remaining, resetAt: entry.resetAt };
}

export function getRateLimitConfig(): RateLimitConfig {
  return { ...config };
}
