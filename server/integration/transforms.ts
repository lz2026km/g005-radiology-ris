export interface Transform {
  id: string;
  name: string;
  type: 'hl7-to-fhir' | 'fhir-to-hl7' | 'dicom-to-fhir' | 'json-transform' | 'custom-script';
  script?: string;
  mapping?: Record<string, string>;
  config: Record<string, unknown>;
  createdAt: string;
}

const transforms: Transform[] = [];
let nextId = 1;

export function getTransforms(): Transform[] {
  return [...transforms];
}

export function addTransform(data: Partial<Transform>): Transform {
  const t: Transform = {
    id: `t-${nextId++}`,
    name: data.name ?? `Transform ${nextId - 1}`,
    type: data.type ?? 'json-transform',
    config: data.config ?? {},
    mapping: data.mapping,
    script: data.script,
    createdAt: new Date().toISOString()
  };
  transforms.push(t);
  return t;
}

export function updateTransform(id: string, data: Partial<Transform>): Transform | undefined {
  const idx = transforms.findIndex(t => t.id === id);
  if (idx === -1) return undefined;
  transforms[idx] = { ...transforms[idx], ...data, id };
  return transforms[idx];
}

export function executeTransform(type: string, input: unknown, _params?: Record<string, unknown>): unknown {
  switch (type) {
    case 'hl7-to-fhir':
      return hl7ToFhir(input as string);
    case 'fhir-to-hl7':
      return fhirToHl7(input as Record<string, unknown>);
    case 'dicom-to-fhir':
      return dicomToFhir(input as Record<string, unknown>);
    case 'json-transform':
      return jsonTransform(input);
    case 'custom-script':
      return customScriptTransform(input as string, _params);
    default:
      throw new Error(`Unknown transform type: ${type}`);
  }
}

function hl7ToFhir(_input: string): Record<string, unknown> {
  return { resourceType: 'DiagnosticReport', id: `fhir-${Date.now()}`, status: 'final' };
}

function fhirToHl7(_input: Record<string, unknown>): string {
  return `MSH|^~\\&|G005_RIS|G005|FHIR|EXTERNAL|${new Date().toISOString().replace(/[-:]/g, '').slice(0, 14)}||ORU^R01|${Date.now().toString(36)}|P|2.5\rOBR|1|||||||${new Date().toISOString().slice(0, 10)}`;
}

function dicomToFhir(_input: Record<string, unknown>): Record<string, unknown> {
  const uid = `1.2.840.${Date.now()}`;
  return { resourceType: 'ImagingStudy', id: `study-${Date.now()}`, identifier: [{ system: 'urn:dicom:uid', value: uid }], status: 'available' };
}

function jsonTransform(input: unknown): unknown {
  if (typeof input === 'string') {
    try { return JSON.parse(input); }
    catch { return { transformed: input }; }
  }
  return { transformed: true, original: input };
}

function customScriptTransform(script: string, params?: Record<string, unknown>): unknown {
  try {
    const fn = new Function('params', script);
    return fn(params ?? {});
  } catch (err) {
    throw new Error(`Script execution error: ${(err as Error).message}`);
  }
}
