import { Router, type Request, type Response } from 'express';
import { addInstance } from './store.js';

export function stowRouter(): Router {
  const router = Router();

  router.post('/dicom/studies', (req: Request, res: Response) => {
    const instances = Array.isArray(req.body) ? req.body : [req.body];
    const results = instances.map((inst: any) => {
      const obj = {
        studyUid: inst['0020000D']?.Value?.[0] ?? `1.2.840.${Date.now()}`,
        seriesUid: inst['0020000E']?.Value?.[0] ?? `1.2.840.${Date.now()}.1`,
        instanceUid: inst['00080018']?.Value?.[0] ?? `1.2.840.${Date.now()}.2`,
        sopClassUid: inst['00080016']?.Value?.[0] ?? '1.2.840.10008.5.1.4.1.1.2',
        metadata: inst,
        createdAt: new Date().toISOString()
      };
      addInstance(obj);
      return { instanceUid: obj.instanceUid, sopClassUid: obj.sopClassUid, status: 'success' };
    });
    res.status(201).json({
      '00081190': { vr: 'UR', Value: [`/dicom/studies/${results[0]?.studyUid}`] },
      numberOfInstances: results.length,
      results
    });
  });

  router.post('/dicom/studies/:studyUid', (req: Request, res: Response) => {
    const studyUid = req.params.studyUid;
    const instances = Array.isArray(req.body) ? req.body : [req.body];
    const results = instances.map((inst: any) => {
      const obj = {
        studyUid,
        seriesUid: inst['0020000E']?.Value?.[0] ?? `1.2.840.${Date.now()}.1`,
        instanceUid: inst['00080018']?.Value?.[0] ?? `1.2.840.${Date.now()}.2`,
        sopClassUid: inst['00080016']?.Value?.[0] ?? '1.2.840.10008.5.1.4.1.1.2',
        metadata: inst,
        createdAt: new Date().toISOString()
      };
      addInstance(obj);
      return { instanceUid: obj.instanceUid, status: 'success' };
    });
    res.status(201).json({ numberOfInstances: results.length, results });
  });

  return router;
}
