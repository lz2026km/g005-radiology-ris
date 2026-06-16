import { Router, type Request, type Response } from 'express';
import { randomUUID } from 'crypto';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  scopes: string[];
  status: 'active' | 'revoked';
  rateLimit: number;
  createdAt: string;
  lastUsed?: string;
}

const apiKeys: ApiKey[] = [];
let nextId = 1;

export function keysRouter(): Router {
  const router = Router();

  router.post('/openapi/keys', (req: Request, res: Response) => {
    const id = `key-${nextId++}`;
    const key = `g005_${randomUUID().replace(/-/g, '').slice(0, 24)}`;
    const newKey: ApiKey = {
      id,
      key,
      name: req.body.name ?? 'Unnamed Key',
      scopes: req.body.scopes ?? ['read'],
      status: 'active',
      rateLimit: req.body.rateLimit ?? 100,
      createdAt: new Date().toISOString()
    };
    apiKeys.push(newKey);
    res.status(201).json({ success: true, data: { ...newKey, key } });
  });

  router.get('/openapi/keys', (_req: Request, res: Response) => {
    res.json({ success: true, data: apiKeys.map(k => ({ id: k.id, name: k.name, scopes: k.scopes, status: k.status, rateLimit: k.rateLimit, createdAt: k.createdAt, lastUsed: k.lastUsed })) });
  });

  router.get('/openapi/keys/:id', (req: Request, res: Response) => {
    const key = apiKeys.find(k => k.id === req.params.id);
    if (!key) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    res.json({ success: true, data: { ...key, key: key.key.slice(0, 8) + '...' } });
  });

  router.delete('/openapi/keys/:id', (req: Request, res: Response) => {
    const idx = apiKeys.findIndex(k => k.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    apiKeys.splice(idx, 1);
    res.json({ success: true, data: { id: req.params.id, status: 'revoked' } });
  });

  return router;
}

export function validateApiKey(key: string): ApiKey | undefined {
  return apiKeys.find(k => k.key === key && k.status === 'active');
}
