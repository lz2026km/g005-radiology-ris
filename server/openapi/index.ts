import { Router, type Request, type Response } from 'express';
import { keysRouter } from './keys.js';
import { rateLimiterRouter } from './rateLimiter.js';
import { webhooksRouter } from './webhooks.js';
import { specRouter } from './spec.js';
import { consoleRouter } from './console.js';

export function openapiRouter(): Router {
  const router = Router();

  router.use(keysRouter());
  router.use(rateLimiterRouter());
  router.use(webhooksRouter());
  router.use(specRouter());
  router.use(consoleRouter());

  return router;
}
