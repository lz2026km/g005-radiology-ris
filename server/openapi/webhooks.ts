import { Router, type Request, type Response } from 'express';

interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  status: 'active' | 'disabled';
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

interface DeliveryLog {
  id: string;
  webhookId: string;
  event: string;
  status: 'success' | 'failed' | 'retrying';
  statusCode?: number;
  responseBody?: string;
  attemptedAt: string;
}

const webhooks: Webhook[] = [];
const deliveryLogs: DeliveryLog[] = [];
const DELIVERY_LOG_MAX = 1000;
let nextWebhookId = 1;
let nextDeliveryId = 1;

export function webhooksRouter(): Router {
  const router = Router();

  router.post('/openapi/webhooks', (req: Request, res: Response) => {
    const wh: Webhook = {
      id: `wh-${nextWebhookId++}`,
      url: req.body.url,
      events: req.body.events ?? ['*'],
      secret: req.body.secret,
      status: 'active',
      retryCount: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    webhooks.push(wh);
    res.status(201).json({ success: true, data: wh });
  });

  router.get('/openapi/webhooks', (_req: Request, res: Response) => {
    res.json({ success: true, data: webhooks });
  });

  router.get('/openapi/webhooks/:id', (req: Request, res: Response) => {
    const wh = webhooks.find(w => w.id === req.params.id);
    if (!wh) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    res.json({ success: true, data: wh });
  });

  router.put('/openapi/webhooks/:id', (req: Request, res: Response) => {
    const idx = webhooks.findIndex(w => w.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    webhooks[idx] = { ...webhooks[idx], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
    res.json({ success: true, data: webhooks[idx] });
  });

  router.delete('/openapi/webhooks/:id', (req: Request, res: Response) => {
    const idx = webhooks.findIndex(w => w.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    const removed = webhooks.splice(idx, 1)[0]!;
    res.json({ success: true, data: removed });
  });

  router.post('/openapi/webhooks/:id/test', async (req: Request, res: Response) => {
    const wh = webhooks.find(w => w.id === req.params.id);
    if (!wh) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    try {
      const response = await fetch(wh.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'test', data: { message: 'G005 RIS webhook test', timestamp: new Date().toISOString() } })
      });
      const d: DeliveryLog = { id: `del-${nextDeliveryId++}`, webhookId: wh.id, event: 'test', status: response.ok ? 'success' : 'failed', statusCode: response.status, attemptedAt: new Date().toISOString() };
      deliveryLogs.unshift(d);
      if (deliveryLogs.length > DELIVERY_LOG_MAX) deliveryLogs.length = DELIVERY_LOG_MAX;
      res.json({ success: response.ok, data: d });
    } catch {
      const d: DeliveryLog = { id: `del-${nextDeliveryId++}`, webhookId: wh.id, event: 'test', status: 'failed', attemptedAt: new Date().toISOString() };
      deliveryLogs.unshift(d);
      res.status(502).json({ success: false, error: { code: 'DELIVERY_FAILED' }, data: d });
    }
  });

  router.get('/openapi/webhooks/:id/deliveries', (req: Request, res: Response) => {
    const logs = deliveryLogs.filter(d => d.webhookId === req.params.id);
    res.json({ success: true, data: logs });
  });

  return router;
}

export async function dispatchWebhook(event: string, data: unknown): Promise<void> {
  const matching = webhooks.filter(w => w.status === 'active' && (w.events.includes('*') || w.events.includes(event)));
  for (const wh of matching) {
    try {
      const response = await fetch(wh.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Webhook-Secret': wh.secret ?? '' },
        body: JSON.stringify({ event, data, timestamp: new Date().toISOString() })
      });
      deliveryLogs.unshift({ id: `del-${nextDeliveryId++}`, webhookId: wh.id, event, status: response.ok ? 'success' : 'failed', statusCode: response.status, attemptedAt: new Date().toISOString() });
    } catch {
      deliveryLogs.unshift({ id: `del-${nextDeliveryId++}`, webhookId: wh.id, event, status: 'failed', attemptedAt: new Date().toISOString() });
    }
    if (deliveryLogs.length > DELIVERY_LOG_MAX) deliveryLogs.length = DELIVERY_LOG_MAX;
  }
}
