import { Router, type Request, type Response } from 'express';
import { parseHL7 } from './parser.js';
import { buildACK } from './builder.js';
import { routeMessage } from './router.js';
import { addLogEntry, getLog, type LogEntry } from './log.js';

export function hl7Router(): Router {
  const router = Router();

  router.post('/v2/message', (req: Request, res: Response) => {
    const rawMessage = typeof req.body === 'string' ? req.body : req.body?.message || req.body?.hl7Message;
    if (!rawMessage) return res.status(400).json({ success: false, error: { code: 'MISSING_MESSAGE', message: 'No HL7 message provided' } });

    try {
      const parsed = parseHL7(rawMessage);
      const result = routeMessage(parsed);
      const ack = buildACK(parsed, result.success ? 'AA' : 'AE');
      const entry: LogEntry = { id: `msg-${Date.now()}`, timestamp: new Date().toISOString(), messageType: `${parsed.segments.MSH?.messageType ?? 'UNKNOWN'}^${parsed.segments.MSH?.triggerEvent ?? ''}`, controlId: parsed.segments.MSH?.messageControlId ?? '', success: result.success, direction: 'inbound' };
      addLogEntry(entry);
      res.json({ success: true, data: { parsed, result, ackResponse: ack } });
    } catch (err) {
      const nack = buildACK(null, 'AE', (err as Error).message);
      addLogEntry({ id: `msg-${Date.now()}`, timestamp: new Date().toISOString(), messageType: 'PARSE_ERROR', controlId: '', success: false, direction: 'inbound', error: (err as Error).message });
      res.status(400).json({ success: false, error: { code: 'PARSE_ERROR', message: (err as Error).message }, ackResponse: nack });
    }
  });

  router.post('/v2/upload', (req: Request, res: Response) => {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [req.body?.message || req.body];
    const results = messages.map((raw: string) => {
      try {
        const parsed = parseHL7(raw);
        const result = routeMessage(parsed);
        addLogEntry({ id: `msg-${Date.now()}`, timestamp: new Date().toISOString(), messageType: `${parsed.segments.MSH?.messageType ?? 'UNKNOWN'}`, controlId: parsed.segments.MSH?.messageControlId ?? '', success: result.success, direction: 'inbound' });
        return { success: true, parsed: parsed.segments.MSH?.messageType, controlId: parsed.segments.MSH?.messageControlId };
      } catch { return { success: false, error: 'Parse failed' }; }
    });
    res.json({ success: true, data: { total: messages.length, processed: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length, results } });
  });

  router.get('/v2/log', (_req: Request, res: Response) => {
    res.json({ success: true, data: getLog() });
  });

  return router;
}
