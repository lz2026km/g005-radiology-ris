import { Router, type Request, type Response } from 'express';
import { getChannels, addChannel, updateChannel, removeChannel, startChannel, stopChannel } from './channels.js';
import { sendMessage, getMessages, getMessage } from './messages.js';
import { getTransforms, addTransform, updateTransform, executeTransform } from './transforms.js';

export function integrationRouter(): Router {
  const router = Router();

  router.get('/status', (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        status: 'running',
        uptime: process.uptime(),
        channels: getChannels().length,
        messagesProcessed: getMessages().length,
        activeChannels: getChannels().filter(c => c.status === 'started').length
      }
    });
  });

  router.get('/channels', (_req: Request, res: Response) => {
    res.json({ success: true, data: getChannels() });
  });

  router.post('/channels', (req: Request, res: Response) => {
    const channel = addChannel(req.body);
    res.status(201).json({ success: true, data: channel });
  });

  router.put('/channels/:id', (req: Request, res: Response) => {
    const channel = updateChannel(req.params.id, req.body);
    if (!channel) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    res.json({ success: true, data: channel });
  });

  router.delete('/channels/:id', (req: Request, res: Response) => {
    const removed = removeChannel(req.params.id);
    if (!removed) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    res.json({ success: true, data: removed });
  });

  router.post('/channels/:id/start', (req: Request, res: Response) => {
    const channel = startChannel(req.params.id);
    if (!channel) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    res.json({ success: true, data: channel });
  });

  router.post('/channels/:id/stop', (req: Request, res: Response) => {
    const channel = stopChannel(req.params.id);
    if (!channel) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    res.json({ success: true, data: channel });
  });

  router.get('/messages', (_req: Request, res: Response) => {
    res.json({ success: true, data: getMessages() });
  });

  router.get('/messages/:id', (req: Request, res: Response) => {
    const msg = getMessage(req.params.id);
    if (!msg) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    res.json({ success: true, data: msg });
  });

  router.post('/messages', (req: Request, res: Response) => {
    const result = sendMessage(req.body);
    res.status(201).json({ success: true, data: result });
  });

  router.get('/transforms', (_req: Request, res: Response) => {
    res.json({ success: true, data: getTransforms() });
  });

  router.post('/transforms', (req: Request, res: Response) => {
    const t = addTransform(req.body);
    res.status(201).json({ success: true, data: t });
  });

  router.put('/transforms/:id', (req: Request, res: Response) => {
    const t = updateTransform(req.params.id, req.body);
    if (!t) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    res.json({ success: true, data: t });
  });

  router.post('/transform', (req: Request, res: Response) => {
    const { type, input, params } = req.body;
    try {
      const output = executeTransform(type, input, params);
      res.json({ success: true, data: { output } });
    } catch (err) {
      res.status(400).json({ success: false, error: { code: 'TRANSFORM_ERROR', message: (err as Error).message } });
    }
  });

  return router;
}
