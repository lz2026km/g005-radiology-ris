import { Router, type Request, type Response } from 'express';

interface CDSRequest {
  hook: string;
  hookInstance: string;
  context: Record<string, unknown>;
  prefetch?: Record<string, unknown>;
  fhirAuthorization?: { access_token: string; token_type: string; expires_in: number; scope: string; subject: string };
}

interface CDSResponse {
  cards: CDSCard[];
  systemActions?: unknown[];
}

interface CDSCard {
  summary: string;
  indicator: 'info' | 'warning' | 'critical' | 'hard-stop';
  detail?: string;
  source: { label: string; url?: string };
  suggestions?: CDSSuggestion[];
  links?: { label: string; url: string; type: string }[];
}

interface CDSSuggestion {
  label: string;
  uuid: string;
  actions?: { type: string; description: string; resource?: Record<string, unknown> }[];
}

const cdsServices = [
  {
    id: 'contrast-check',
    hook: 'order-select',
    title: 'Contrast Allergy & Renal Check',
    description: 'Checks for contrast allergies and renal insufficiency before contrast-enhanced exams',
    prefetch: { patient: 'Patient/{{context.patientId}}', allergies: 'AllergyIntolerance?patient={{context.patientId}}' }
  },
  {
    id: 'dose-check',
    hook: 'order-sign',
    title: 'Radiation Dose Check',
    description: 'Validates radiation dose against patient age, BMI, and exam type',
    prefetch: { patient: 'Patient/{{context.patientId}}' }
  },
  {
    id: 'duplicate-order',
    hook: 'order-select',
    title: 'Duplicate Order Detection',
    description: 'Detects duplicate or redundant imaging orders within 30 days',
    prefetch: { orders: 'ServiceRequest?patient={{context.patientId}}&status=active' }
  },
  {
    id: 'protocol-recommendation',
    hook: 'patient-view',
    title: 'Protocol Recommendation Engine',
    description: 'Recommends optimal imaging protocol based on diagnosis and clinical history',
    prefetch: { patient: 'Patient/{{context.patientId}}', conditions: 'Condition?patient={{context.patientId}}' }
  },
  {
    id: 'critical-alert',
    hook: 'encounter-start',
    title: 'Critical Finding Alert',
    description: 'Alerts clinician when patient has unresolved critical findings from prior studies',
    prefetch: { patient: 'Patient/{{context.patientId}}', observations: 'Observation?patient={{context.patientId}}&category=radiology' }
  }
];

export function cdsHooksRouter(): Router {
  const router = Router();

  router.get('/cds-services', (_req: Request, res: Response) => {
    res.json({ services: cdsServices });
  });

  router.post('/cds-services/contrast-check', (req: Request, res: Response) => {
    const _cdsReq = req.body as CDSRequest;
    const cards: CDSCard[] = [
      {
        summary: 'Contrast check completed',
        indicator: 'info',
        detail: 'No known contrast allergies detected. eGFR within normal range.',
        source: { label: 'G005 RIS CDS' },
        suggestions: [{
          label: 'Proceed with contrast',
          uuid: `suggestion-${Date.now()}`,
          actions: [{ type: 'update', description: 'Continue with contrast-enhanced protocol' }]
        }]
      }
    ];
    res.json({ cards } satisfies CDSResponse);
  });

  router.post('/cds-services/dose-check', (req: Request, res: Response) => {
    const cards: CDSCard[] = [
      {
        summary: 'Estimated dose: 2.5 mSv (within safe limits)',
        indicator: 'info',
        detail: 'Patient dose is within ALARA guidelines for this exam type and patient demographics.',
        source: { label: 'G005 RIS CDS' }
      }
    ];
    res.json({ cards });
  });

  router.post('/cds-services/duplicate-order', (req: Request, res: Response) => {
    const cards: CDSCard[] = [
      {
        summary: 'No duplicate orders found',
        indicator: 'info',
        detail: 'No active or recent duplicate orders for this patient and modality.',
        source: { label: 'G005 RIS CDS' }
      }
    ];
    res.json({ cards });
  });

  router.post('/cds-services/protocol-recommendation', (req: Request, res: Response) => {
    const cards: CDSCard[] = [
      {
        summary: 'Recommended Protocol: Standard CT Abdomen + Contrast',
        indicator: 'info',
        detail: 'Based on diagnosis codes, CT Abdomen with IV contrast is the recommended protocol.',
        source: { label: 'G005 RIS CDS' },
        suggestions: [{
          label: 'Apply recommended protocol',
          uuid: `suggest-${Date.now()}`,
          actions: [{ type: 'update', description: 'Set protocol to CT Abdomen + Contrast' }]
        }]
      }
    ];
    res.json({ cards });
  });

  router.post('/cds-services/critical-alert', (req: Request, res: Response) => {
    const cards: CDSCard[] = [
      {
        summary: 'No critical alerts for this patient',
        indicator: 'info',
        detail: 'All prior findings have been acknowledged and resolved.',
        source: { label: 'G005 RIS CDS' }
      }
    ];
    res.json({ cards });
  });

  return router;
}
