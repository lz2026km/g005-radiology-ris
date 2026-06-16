import { Router, type Request, type Response } from 'express';

interface ExtensionDef {
  id: string;
  url: string;
  name: string;
  description: string;
  context: string;
  elements: { path: string; min: number; max: string; type: string; binding?: string }[];
}

const registry = new Map<string, ExtensionDef>();

function register(def: ExtensionDef): void {
  registry.set(def.id, def);
}

function toStructureDefinition(def: ExtensionDef): Record<string, unknown> {
  return {
    resourceType: 'StructureDefinition',
    id: def.id,
    url: def.url,
    name: def.name,
    status: 'active',
    kind: 'complex-type',
    type: 'Extension',
    context: [{ type: 'element', expression: def.context }],
    description: def.description,
    differential: {
      element: def.elements.map((e, i) => ({
        id: `Extension.extension:${e.path}`,
        path: `Extension.extension[${e.path}]`,
        sliceName: e.path,
        min: e.min,
        max: e.max,
        type: [{ code: e.type }],
        ...(e.binding ? { binding: { strength: 'required', valueSet: e.binding } } : {})
      }))
    }
  };
}

register({
  id: 'g005-radiology-report',
  url: 'https://g005.ris/fhir/StructureDefinition/g005-radiology-report',
  name: 'G005 Radiology Report',
  description: 'Structured radiology report with findings, diagnosis, impression',
  context: 'DiagnosticReport',
  elements: [
    { path: 'findings', min: 0, max: '1', type: 'markdown' },
    { path: 'diagnosis', min: 0, max: '1', type: 'markdown' },
    { path: 'impression', min: 0, max: '1', type: 'markdown' },
    { path: 'conclusion', min: 0, max: '1', type: 'markdown' },
    { path: 'recommendation', min: 0, max: '1', type: 'markdown' },
    { path: 'qualityScore', min: 0, max: '1', type: 'integer' }
  ]
});

register({
  id: 'g005-exam-protocol',
  url: 'https://g005.ris/fhir/StructureDefinition/g005-exam-protocol',
  name: 'G005 Exam Protocol',
  description: 'Imaging protocol and procedure code extension for ServiceRequest',
  context: 'ServiceRequest',
  elements: [
    { path: 'protocolCode', min: 0, max: '1', type: 'CodeableConcept' },
    { path: 'protocolName', min: 0, max: '1', type: 'string' },
    { path: 'bodyPart', min: 0, max: '1', type: 'CodeableConcept' },
    { path: 'contrastRequired', min: 0, max: '1', type: 'boolean' }
  ]
});

register({
  id: 'g005-modality-settings',
  url: 'https://g005.ris/fhir/StructureDefinition/g005-modality-settings',
  name: 'G005 Modality Settings',
  description: 'Modality-specific device configuration',
  context: 'Device',
  elements: [
    { path: 'modality', min: 1, max: '1', type: 'code', binding: 'http://dicom.nema.org/resources/valuesets/Modality' },
    { path: 'roomId', min: 0, max: '1', type: 'string' },
    { path: 'aetitle', min: 0, max: '1', type: 'string' },
    { path: 'active', min: 0, max: '1', type: 'boolean' }
  ]
});

register({
  id: 'g005-critical-finding',
  url: 'https://g005.ris/fhir/StructureDefinition/g005-critical-finding',
  name: 'G005 Critical Finding',
  description: 'Flag for critical/urgent findings with escalation info',
  context: 'Observation',
  elements: [
    { path: 'isCritical', min: 0, max: '1', type: 'boolean' },
    { path: 'escalationLevel', min: 0, max: '1', type: 'code' },
    { path: 'acknowledgedBy', min: 0, max: '1', type: 'Reference' },
    { path: 'acknowledgedAt', min: 0, max: '1', type: 'dateTime' }
  ]
});

register({
  id: 'g005-radiology-annotation',
  url: 'https://g005.ris/fhir/StructureDefinition/g005-radiology-annotation',
  name: 'G005 Radiology Annotation',
  description: 'Annotation and measurement storage for ImagingStudy series/instances',
  context: 'ImagingStudy',
  elements: [
    { path: 'annotationText', min: 0, max: '*', type: 'string' },
    { path: 'measurement', min: 0, max: '*', type: 'Quantity' },
    { path: 'boundingBox', min: 0, max: '*', type: 'string' }
  ]
});

register({
  id: 'g005-consent-imaging',
  url: 'https://g005.ris/fhir/StructureDefinition/g005-consent-imaging',
  name: 'G005 Consent for Imaging',
  description: 'Imaging-specific consent flags for Patient resource',
  context: 'Patient',
  elements: [
    { path: 'contrastConsent', min: 0, max: '1', type: 'boolean' },
    { path: 'radiationConsent', min: 0, max: '1', type: 'boolean' },
    { path: 'consentDate', min: 0, max: '1', type: 'date' },
    { path: 'consentExpiry', min: 0, max: '1', type: 'date' }
  ]
});

register({
  id: 'g005-request-priority',
  url: 'https://g005.ris/fhir/StructureDefinition/g005-request-priority',
  name: 'G005 Request Priority',
  description: 'RIS-specific priority levels for ServiceRequest',
  context: 'ServiceRequest',
  elements: [
    { path: 'priorityCode', min: 0, max: '1', type: 'code', binding: 'https://g005.ris/valuesets/request-priority' },
    { path: 'requestingPhysician', min: 0, max: '1', type: 'Reference' },
    { path: 'clinicalIndication', min: 0, max: '1', type: 'markdown' }
  ]
});

export function extensionRouter(): Router {
  const router = Router();

  router.get('/StructureDefinition', (_req: Request, res: Response) => {
    const entries = Array.from(registry.values()).map(toStructureDefinition);
    res.json({
      resourceType: 'Bundle',
      id: `extensions-${Date.now()}`,
      type: 'searchset',
      total: entries.length,
      entry: entries.map(r => ({ resource: r }))
    });
  });

  router.get('/StructureDefinition/:id', (req: Request, res: Response) => {
    const def = registry.get(req.params.id);
    if (!def) return res.status(404).json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'not-found', diagnostics: `StructureDefinition ${req.params.id} not found` }] });
    res.json(toStructureDefinition(def));
  });

  router.get('/StructureDefinition/:id/$snapshot', (req: Request, res: Response) => {
    const def = registry.get(req.params.id);
    if (!def) return res.status(404).json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'not-found', diagnostics: `StructureDefinition ${req.params.id} not found` }] });
    const sd = toStructureDefinition(def);
    (sd as any).snapshot = { element: (sd as any).differential.element.map((e: any, i: number) => ({ ...e, id: e.id.replace('Extension.extension', 'Extension'), path: 'Extension' })) };
    res.json(sd);
  });

  return router;
}
