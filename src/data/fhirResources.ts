/**
 * G005 放射RIS系统 v3.0.6.0 - FHIR R4 资源样本数据
 * 20+ 资源覆盖 Patient / DiagnosticReport / Observation / ImagingStudy / Practitioner
 *      ServiceRequest / Encounter / Procedure / DocumentReference / Bundle
 */

export interface FhirResourceSample {
  id: string;
  resourceType: string;
  name: string;
  nameEn: string;
  scenario: string;
  resource: Record<string, unknown>;
  tags: string[];
}

const now = '2026-06-19T10:00:00+08:00';
const birth = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

export const FHIR_SAMPLES: FhirResourceSample[] = [
  {
    id: 'fhir-pt-001', resourceType: 'Patient', name: '张三', nameEn: 'Zhang San',
    scenario: '门诊 CT 检查患者',
    tags: ['demo', 'radiology'],
    resource: {
      resourceType: 'Patient', id: 'pt-001', active: true,
      identifier: [{ use: 'official', system: 'urn:oid:1.2.840.113556.1.8000.2554.1', value: 'P0001', type: { text: 'MR' } }],
      name: [{ use: 'official', family: '张', given: ['三'], text: '张三' }],
      gender: 'male', birthDate: birth(1980, 1, 1),
      telecom: [
        { system: 'phone', value: '13800138001', use: 'mobile' },
        { system: 'email', value: 'zhangsan@example.com' },
      ],
      address: [{ use: 'home', line: ['建国路1号'], city: '北京市', state: '北京市', postalCode: '100020', country: 'CN' }],
      maritalStatus: { text: '已婚' },
    },
  },
  {
    id: 'fhir-pt-002', resourceType: 'Patient', name: '李四', nameEn: 'Li Si',
    scenario: '住院出院',
    tags: ['inpatient'],
    resource: {
      resourceType: 'Patient', id: 'pt-002', active: true,
      identifier: [{ use: 'official', system: 'urn:oid:1.2.840.113556.1.8000.2554.1', value: 'P0002' }],
      name: [{ family: '李', given: ['四'], text: '李四' }],
      gender: 'female', birthDate: birth(1975, 5, 12),
    },
  },
  {
    id: 'fhir-pt-003', resourceType: 'Patient', name: '王五', nameEn: 'Wang Wu',
    scenario: '复诊患者',
    tags: ['follow-up'],
    resource: {
      resourceType: 'Patient', id: 'pt-003', active: true,
      identifier: [{ use: 'official', system: 'urn:oid:1.2.840.113556.1.8000.2554.1', value: 'P0003' }],
      name: [{ family: '王', given: ['五'], text: '王五' }],
      gender: 'male', birthDate: birth(1990, 3, 15),
    },
  },
  {
    id: 'fhir-pract-001', resourceType: 'Practitioner', name: '王主任', nameEn: 'Dr. Wang',
    scenario: '放射科主任医师',
    tags: ['radiologist', 'attending'],
    resource: {
      resourceType: 'Practitioner', id: 'pract-001', active: true,
      identifier: [{ use: 'official', system: 'urn:oid:1.2.840.113556.1.8000.2554.1', value: 'D001' }],
      name: [{ family: '王', given: ['主任'], text: '王主任', suffix: ['主任医师'] }],
      qualification: [{
        code: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0360|2.7', code: 'MD', display: 'Doctor of Medicine' }] },
      }],
    },
  },
  {
    id: 'fhir-pract-002', resourceType: 'Practitioner', name: '陈医师', nameEn: 'Dr. Chen',
    scenario: '住院医师',
    tags: ['resident'],
    resource: {
      resourceType: 'Practitioner', id: 'pract-002', active: true,
      identifier: [{ use: 'official', system: 'urn:oid:1.2.840.113556.1.8000.2554.1', value: 'D002' }],
      name: [{ family: '陈', given: ['医师'], text: '陈医师' }],
    },
  },
  {
    id: 'fhir-org-001', resourceType: 'Organization', name: '汉东省人民医院', nameEn: 'Handong Provincial Hospital',
    scenario: '医疗机构',
    tags: ['hospital'],
    resource: {
      resourceType: 'Organization', id: 'org-001', active: true,
      identifier: [{ use: 'official', system: 'urn:oid:1.2.840.113556.1.8000.2554.1', value: 'H001' }],
      name: '汉东省人民医院', alias: ['Handong Provincial Hospital'],
      telecom: [{ system: 'phone', value: '010-12345678' }],
      address: [{ line: ['建国路1号'], city: '北京市', state: '北京市', country: 'CN' }],
    },
  },
  {
    id: 'fhir-enc-001', resourceType: 'Encounter', name: '门诊就诊', nameEn: 'Outpatient Encounter',
    scenario: '门诊 CT 检查',
    tags: ['outpatient'],
    resource: {
      resourceType: 'Encounter', id: 'enc-001', status: 'finished',
      class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB' },
      subject: { reference: 'Patient/pt-001', display: '张三' },
      serviceProvider: { reference: 'Organization/org-001', display: '汉东省人民医院' },
      period: { start: now, end: now },
      location: [{ location: { reference: 'Location/loc-ct-001', display: 'CT 室 001' } }],
    },
  },
  {
    id: 'fhir-sr-001', resourceType: 'ServiceRequest', name: '胸部 CT 增强申请', nameEn: 'CT Chest Enhanced Order',
    scenario: '检查申请',
    tags: ['order', 'radiology'],
    resource: {
      resourceType: 'ServiceRequest', id: 'sr-001', status: 'active', intent: 'order', priority: 'routine',
      code: { coding: [{ system: 'http://snomed.info/sct', code: '169068008', display: 'CT of chest' }], text: '胸部 CT 增强' },
      subject: { reference: 'Patient/pt-001', display: '张三' },
      requester: { reference: 'Practitioner/pract-001', display: '王主任' },
      authoredOn: now,
      occurrenceDateTime: '2026-06-19T11:00:00+08:00',
      note: [{ text: '增强扫描,排除占位' }],
    },
  },
  {
    id: 'fhir-img-001', resourceType: 'ImagingStudy', name: '胸部 CT 增强检查', nameEn: 'Chest CT Enhanced Study',
    scenario: '成像检查',
    tags: ['CT', 'chest'],
    resource: {
      resourceType: 'ImagingStudy', id: 'img-001', status: 'available',
      subject: { reference: 'Patient/pt-001', display: '张三' },
      started: '2026-06-19T11:05:00+08:00',
      numberOfSeries: 2, numberOfInstances: 256,
      series: [{
        uid: '1.2.840.113556.1.8000.2554.2.1', number: 1, modality: 'CT',
        description: '胸部定位像', numberOfInstances: 2,
        instance: [{ uid: '1.2.840.113556.1.8000.2554.3.1', sopClass: '1.2.840.10008.5.1.4.1.1.2' }],
      }],
    },
  },
  {
    id: 'fhir-dr-001', resourceType: 'DiagnosticReport', name: '胸部 CT 增强诊断报告', nameEn: 'Chest CT Enhanced Report',
    scenario: '诊断报告 - final',
    tags: ['CT', 'report', 'final'],
    resource: {
      resourceType: 'DiagnosticReport', id: 'dr-001', status: 'final',
      category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0074', code: 'RAD', display: 'Radiology' }] }],
      code: { coding: [{ system: 'http://loinc.org', code: '18748-4', display: 'Diagnostic imaging study' }] },
      subject: { reference: 'Patient/pt-001', display: '张三' },
      encounter: { reference: 'Encounter/enc-001' },
      effectiveDateTime: '2026-06-19T11:30:00+08:00',
      issued: '2026-06-19T13:00:00+08:00',
      performer: [{ reference: 'Practitioner/pract-001', display: '王主任' }],
      imagingStudy: [{ reference: 'ImagingStudy/img-001', display: '胸部 CT 增强' }],
      result: [
        { reference: 'Observation/obs-001', display: '结节直径' },
        { reference: 'Observation/obs-002', display: '影像所见' },
      ],
      conclusion: '右肺上叶周围型肺癌可能性大,建议穿刺活检',
      presentedForm: [{ contentType: 'application/pdf', url: 'https://fhir.g005.local/Binary/rep-001', size: 256000, title: 'CT 报告 PDF' }],
    },
  },
  {
    id: 'fhir-dr-002', resourceType: 'DiagnosticReport', name: '脑部 MR 平扫诊断报告', nameEn: 'MR Brain Plain Report',
    scenario: '诊断报告 - preliminary',
    tags: ['MR', 'preliminary'],
    resource: {
      resourceType: 'DiagnosticReport', id: 'dr-002', status: 'preliminary',
      category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0074', code: 'RAD' }] }],
      code: { coding: [{ system: 'http://loinc.org', code: '18748-4' }] },
      subject: { reference: 'Patient/pt-003', display: '王五' },
      effectiveDateTime: '2026-06-19T10:00:00+08:00',
      issued: '2026-06-19T10:30:00+08:00',
      performer: [{ reference: 'Practitioner/pract-002', display: '陈医师' }],
      conclusion: '颅脑 MR 平扫未见明显异常',
    },
  },
  {
    id: 'fhir-obs-001', resourceType: 'Observation', name: '结节直径', nameEn: 'Nodule Diameter',
    scenario: '测量观察',
    tags: ['measurement'],
    resource: {
      resourceType: 'Observation', id: 'obs-001', status: 'final',
      code: { coding: [{ system: 'http://loinc.org', code: '33747-0', display: 'General appearance of Lung' }] },
      subject: { reference: 'Patient/pt-001', display: '张三' },
      effectiveDateTime: now,
      valueQuantity: { value: 12, unit: 'mm', system: 'http://unitsofmeasure.org', code: 'mm' },
      interpretation: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: 'A', display: 'Abnormal' }] }],
    },
  },
  {
    id: 'fhir-obs-002', resourceType: 'Observation', name: '影像所见', nameEn: 'Imaging Findings',
    scenario: '文本观察',
    tags: ['narrative'],
    resource: {
      resourceType: 'Observation', id: 'obs-002', status: 'final',
      code: { coding: [{ system: 'http://loinc.org', code: '18776-5', display: 'Imaging study' }] },
      subject: { reference: 'Patient/pt-001' },
      effectiveDateTime: now,
      valueString: '右肺上叶可见一结节,直径约 12mm,边缘不规则,呈分叶状',
    },
  },
  {
    id: 'fhir-obs-003', resourceType: 'Observation', name: '血压', nameEn: 'Blood Pressure',
    scenario: '生命体征',
    tags: ['vitals'],
    resource: {
      resourceType: 'Observation', id: 'obs-003', status: 'final',
      category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }] }],
      code: { coding: [{ system: 'http://loinc.org', code: '85354-9' }] },
      subject: { reference: 'Patient/pt-002' },
      effectiveDateTime: now,
      component: [
        { code: { coding: [{ system: 'http://loinc.org', code: '8480-6' }] }, valueQuantity: { value: 120, unit: 'mmHg' } },
        { code: { coding: [{ system: 'http://loinc.org', code: '8462-4' }] }, valueQuantity: { value: 80, unit: 'mmHg' } },
      ],
    },
  },
  {
    id: 'fhir-pr-001', resourceType: 'Procedure', name: '胸部 CT 增强扫描', nameEn: 'CT Chest Enhanced',
    scenario: '已执行操作',
    tags: ['procedure'],
    resource: {
      resourceType: 'Procedure', id: 'pr-001', status: 'completed',
      code: { coding: [{ system: 'http://snomed.info/sct', code: '169068008' }] },
      subject: { reference: 'Patient/pt-001' },
      performedDateTime: '2026-06-19T11:00:00+08:00',
      recorder: { reference: 'Practitioner/pract-002' },
      report: [{ reference: 'DiagnosticReport/dr-001' }],
    },
  },
  {
    id: 'fhir-cond-001', resourceType: 'Condition', name: '右肺占位', nameEn: 'Right lung mass',
    scenario: '诊断/疾病',
    tags: ['diagnosis'],
    resource: {
      resourceType: 'Condition', id: 'cond-001', clinicalStatus: { coding: [{ code: 'active' }] },
      verificationStatus: { coding: [{ code: 'provisional' }] },
      category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-category', code: 'encounter-diagnosis' }] }],
      code: { coding: [{ system: 'http://snomed.info/sct', code: '254637007', display: 'Mass of right lung' }] },
      subject: { reference: 'Patient/pt-001' },
      onsetDateTime: '2026-06-19',
      recordedDate: now,
    },
  },
  {
    id: 'fhir-dr-003', resourceType: 'DiagnosticReport', name: '钼靶 BI-RADS 报告', nameEn: 'MG BI-RADS Report',
    scenario: 'BI-RADS 4 类',
    tags: ['MG', 'BIRADS'],
    resource: {
      resourceType: 'DiagnosticReport', id: 'dr-003', status: 'final',
      code: { coding: [{ system: 'http://loinc.org', code: '46372-6', display: 'Mammography' }] },
      subject: { reference: 'Patient/pt-002' },
      effectiveDateTime: '2026-06-19T10:00:00+08:00',
      issued: '2026-06-19T11:00:00+08:00',
      performer: [{ reference: 'Practitioner/pract-001' }],
      conclusionCode: [{ coding: [{ system: 'https://www.acr.org/Clinical-Resources/RADS', code: 'BI-RADS-4', display: '可疑恶性' }] }],
      conclusion: '右乳外上象限可见一肿块,边缘呈毛刺状,BI-RADS 4',
    },
  },
  {
    id: 'fhir-docref-001', resourceType: 'DocumentReference', name: '报告 PDF', nameEn: 'Report PDF',
    scenario: '文档参考',
    tags: ['attachment'],
    resource: {
      resourceType: 'DocumentReference', id: 'docref-001', status: 'current',
      subject: { reference: 'Patient/pt-001' },
      date: now,
      author: [{ reference: 'Practitioner/pract-001' }],
      category: [{ coding: [{ system: 'http://loinc.org', code: '51852-2' }] }],
      content: [{
        attachment: { contentType: 'application/pdf', url: 'https://fhir.g005.local/Binary/rep-001', size: 256000, hash: '2jmj7l5rSw0yVb/vlWAYkK/YBwk=', title: 'CT 报告' },
      }],
      context: { encounter: [{ reference: 'Encounter/enc-001' }] },
    },
  },
  {
    id: 'fhir-task-001', resourceType: 'Task', name: '报告书写任务', nameEn: 'Report Writing Task',
    scenario: '工作流任务',
    tags: ['workflow'],
    resource: {
      resourceType: 'Task', id: 'task-001', status: 'in-progress', intent: 'order',
      code: { text: '报告书写' },
      focus: { reference: 'ServiceRequest/sr-001' },
      for: { reference: 'Patient/pt-001' },
      authoredOn: now,
      requester: { reference: 'Practitioner/pract-001' },
      owner: { reference: 'Practitioner/pract-002' },
    },
  },
  {
    id: 'fhir-bundle-001', resourceType: 'Bundle', name: '示例 Bundle', nameEn: 'Sample Bundle',
    scenario: 'Bundle of resources',
    tags: ['bundle', 'collection'],
    resource: {
      resourceType: 'Bundle', id: 'bundle-001', type: 'collection',
      timestamp: now,
      entry: [
        { fullUrl: 'Patient/pt-001', resource: { resourceType: 'Patient', id: 'pt-001', name: [{ text: '张三' }] } },
        { fullUrl: 'DiagnosticReport/dr-001', resource: { resourceType: 'DiagnosticReport', id: 'dr-001', status: 'final' } },
      ],
    },
  },
  {
    id: 'fhir-bundle-002', resourceType: 'Bundle', name: '事务 Bundle', nameEn: 'Transaction Bundle',
    scenario: 'Transaction POST/PUT',
    tags: ['bundle', 'transaction'],
    resource: {
      resourceType: 'Bundle', id: 'bundle-002', type: 'transaction',
      entry: [
        { request: { method: 'POST', url: 'Patient' }, resource: { resourceType: 'Patient', name: [{ text: '赵六' }] } },
        { request: { method: 'POST', url: 'Observation' }, resource: { resourceType: 'Observation', status: 'final', code: { text: '体重' }, valueQuantity: { value: 65, unit: 'kg' } } },
      ],
    },
  },
  {
    id: 'fhir-media-001', resourceType: 'Media', name: '关键图像', nameEn: 'Key Image',
    scenario: '媒体附件',
    tags: ['media'],
    resource: {
      resourceType: 'Media', id: 'media-001', status: 'completed',
      subject: { reference: 'Patient/pt-001' },
      content: { contentType: 'image/jpeg', url: 'https://fhir.g005.local/Binary/key-001', size: 102400, title: '关键图像 1' },
      createdDateTime: now,
    },
  },
];

export function getFhirSample(id: string): FhirResourceSample | undefined {
  return FHIR_SAMPLES.find((s) => s.id === id);
}

export function getFhirSamplesByType(type: string): FhirResourceSample[] {
  return FHIR_SAMPLES.filter((s) => s.resourceType === type);
}
