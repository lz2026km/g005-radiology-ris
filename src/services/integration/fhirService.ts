export function buildDiagnosticReport(report: any): any {
  return {
    resourceType: 'DiagnosticReport',
    id: report.id,
    status: 'final',
    code: { coding: [{ system: 'http://loinc.org', code: report.loincCode || '18748-4', display: 'Diagnostic imaging report' }] },
    subject: { reference: `Patient/${report.patientId}`, display: report.patientName },
    issued: new Date().toISOString(),
    conclusion: report.finding,
    presentedForm: [{ contentType: 'text/html', url: report.url }],
  };
}

export function buildObservation(finding: any): any {
  return {
    resourceType: 'Observation',
    id: finding.id,
    status: 'final',
    code: { coding: [{ system: 'http://loinc.org', code: finding.loincCode || '18782-3', display: finding.description || 'Radiology finding' }] },
    subject: { reference: `Patient/${finding.patientId}` },
    valueString: finding.value,
    interpretation: finding.interpretation ? [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: finding.interpretation }] }] : undefined,
  };
}

export function buildPatient(patient: any): any {
  return {
    resourceType: 'Patient',
    id: patient.id,
    identifier: [{ system: 'urn:oid:1.2.3.4', value: patient.id }],
    name: [{ family: patient.familyName, given: [patient.givenName].filter(Boolean) }],
    gender: patient.sex?.toLowerCase(),
    birthDate: patient.birthDate,
    telecom: [{ system: 'phone', value: patient.phone }],
  };
}

export function buildTask(task: any): any {
  return {
    resourceType: 'Task',
    id: task.id,
    status: task.status || 'requested',
    intent: 'order',
    code: { coding: [{ system: 'http://snomed.info/sct', code: task.code, display: task.description }] },
    focus: { reference: `ServiceRequest/${task.serviceRequestId}` },
    for: { reference: `Patient/${task.patientId}` },
    authoredOn: new Date().toISOString(),
  };
}

export async function sendFHIR(endpoint: string, resource: any): Promise<any> {
  await new Promise(r => setTimeout(r, 300));
  return { ...resource, id: resource.id || `fhir-${Date.now()}`, meta: { versionId: '1', lastUpdated: new Date().toISOString() } };
}

export async function searchFHIR(endpoint: string, type: string, params: Record<string, string>): Promise<any[]> {
  await new Promise(r => setTimeout(r, 300));
  return [
    { resourceType: type, id: '1', name: '张三' },
    { resourceType: type, id: '2', name: '李四' },
  ];
}
