import { Router, type Request, type Response } from 'express';

export function dimseRouter(): Router {
  const router = Router();

  router.post('/dicom/dimse/echo', (_req: Request, res: Response) => {
    res.json({
      status: 'success',
      message: 'C-ECHO response',
      data: { dimseStatus: 0x0000, description: 'Success' }
    });
  });

  router.post('/dicom/dimse/store', (req: Request, res: Response) => {
    const { studyUid, seriesUid, sopInstanceUid, sopClassUid } = req.body;
    res.json({
      status: 'success',
      message: 'C-STORE proxy response',
      data: {
        affectedSopClass: sopClassUid ?? '1.2.840.10008.5.1.4.1.1.2',
        affectedSopInstance: sopInstanceUid ?? `1.2.840.${Date.now()}`,
        status: 0x0000
      }
    });
  });

  router.post('/dicom/dimse/find', (req: Request, res: Response) => {
    const { level, query } = req.body;
    res.json({
      status: 'success',
      message: 'C-FIND proxy response',
      data: {
        level: level ?? 'STUDY',
        query: query ?? {},
        results: [
          { '0020000D': `1.2.840.${Date.now()}`, '00080020': new Date().toISOString().slice(0, 10) }
        ]
      }
    });
  });

  router.post('/dicom/dimse/move', (req: Request, res: Response) => {
    const { studyUid, destinationAe } = req.body;
    res.json({
      status: 'success',
      message: 'C-MOVE proxy initiated',
      data: {
        destination: destinationAe ?? 'UNKNOWN',
        studyUid: studyUid ?? `1.2.840.${Date.now()}`,
        numberOfRemainingSubOperations: 0,
        numberOfCompletedSubOperations: 5,
        status: 0xFF00
      }
    });
  });

  return router;
}
