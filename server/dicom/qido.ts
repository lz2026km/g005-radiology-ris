import { Router, type Request, type Response } from 'express';
import { queryStudies, getSeries, getInstances } from './store.js';

export function qidoRouter(): Router {
  const router = Router();

  router.get('/dicom/studies', (req: Request, res: Response) => {
    const filters = req.query as Record<string, string>;
    const results = queryStudies(filters);
    const studies = results.map(o => ({
      '0020000D': { vr: 'UI', Value: [o.studyUid] },
      '00080020': { vr: 'DA', Value: [o.createdAt.slice(0, 10)] },
      '00080030': { vr: 'TM', Value: [o.createdAt.slice(11, 19)] },
      '00080050': { vr: 'SH', Value: ['G005 RIS'] }
    }));
    res.json(studies);
  });

  router.get('/dicom/studies/:studyUid/series', (req: Request, res: Response) => {
    const series = getSeries(req.params.studyUid);
    const result = series.map(o => ({
      '0020000D': { vr: 'UI', Value: [o.studyUid] },
      '0020000E': { vr: 'UI', Value: [o.seriesUid] },
      '0008103E': { vr: 'LO', Value: ['G005 Series'] }
    }));
    res.json(result);
  });

  router.get('/dicom/studies/:studyUid/series/:seriesUid/instances', (req: Request, res: Response) => {
    const instances = getInstances(req.params.studyUid, req.params.seriesUid);
    const result = instances.map(o => ({
      '0020000D': { vr: 'UI', Value: [o.studyUid] },
      '0020000E': { vr: 'UI', Value: [o.seriesUid] },
      '00080018': { vr: 'UI', Value: [o.instanceUid] },
      '00080016': { vr: 'UI', Value: [o.sopClassUid] }
    }));
    res.json(result);
  });

  return router;
}
