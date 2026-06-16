import { Router, type Request, type Response } from 'express';
import { getInstance, getInstances, getSeries } from './store.js';

export function wadoRouter(): Router {
  const router = Router();

  router.get('/dicom/studies/:studyUid/metadata', (req: Request, res: Response) => {
    const instances = getInstances(req.params.studyUid, '');
    const all = getSeries(req.params.studyUid);
    if (all.length === 0 && instances.length === 0) return res.status(404).json({ error: 'Study not found' });
    res.json({
      '0020000D': { vr: 'UI', Value: [req.params.studyUid] },
      numberOfSeries: all.length,
      numberOfInstances: instances.length
    });
  });

  router.get('/dicom/studies/:studyUid/series/:seriesUid/metadata', (req: Request, res: Response) => {
    const instances = getInstances(req.params.studyUid, req.params.seriesUid);
    if (instances.length === 0) return res.status(404).json({ error: 'Series not found' });
    res.json({
      '0020000D': { vr: 'UI', Value: [req.params.studyUid] },
      '0020000E': { vr: 'UI', Value: [req.params.seriesUid] },
      numberOfInstances: instances.length
    });
  });

  router.get('/dicom/studies/:studyUid/series/:seriesUid/instances/:instanceUid', (req: Request, res: Response) => {
    const inst = getInstance(req.params.instanceUid);
    if (!inst) return res.status(404).json({ error: 'Instance not found' });
    res.json(inst.metadata);
  });

  router.get('/dicom/studies/:studyUid/series/:seriesUid/instances/:instanceUid/rendered', (req: Request, res: Response) => {
    const inst = getInstance(req.params.instanceUid);
    if (!inst) return res.status(404).json({ error: 'Instance not found' });
    if (inst.bulkData) {
      res.set('Content-Type', 'image/jpeg').send(inst.bulkData);
    } else {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect fill="#1a1a2e" width="512" height="512"/><text x="256" y="256" fill="#fff" font-family="monospace" font-size="14" text-anchor="middle" dominant-baseline="middle">DICOM Instance ${inst.instanceUid.slice(0, 16)}...</text></svg>`;
      res.set('Content-Type', 'image/svg+xml').send(svg);
    }
  });

  return router;
}
