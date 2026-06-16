import { Router, type Request, type Response } from 'express';
import { qidoRouter } from './qido.js';
import { stowRouter } from './stow.js';
import { wadoRouter } from './wado.js';
import { dimseRouter } from './dimse.js';

export function dicomRouter(): Router {
  const router = Router();

  router.use(qidoRouter());
  router.use(stowRouter());
  router.use(wadoRouter());
  router.use(dimseRouter());

  return router;
}
