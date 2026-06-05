// ============================================================
// G005 放射RIS系统 v2.0.0 - HL7 v2 ORU^R01 消息生成器
// Phase R8 W7-F: 报告输出到 HIS/EMR
// ============================================================

export interface HL7ORUR01Options {
  sendingApp?: string;        // 默认 'G005_RIS'
  sendingFacility?: string;   // 默认 'HANDONG_HOSP'
  receivingApp?: string;      // 默认 'HIS'
  receivingFacility?: string; // 默认 'HANDONG_HOSP'
  messageControlId?: string;
  reportId: string;
  patientId: string;
  patientName: string;
  patientGender: 'M' | 'F' | 'O';
  patientDOB?: string;
  observationDateTime: string;
  reportStatus: 'F' | 'P' | 'C'; // Final/Preliminary/Corrected
  modality: string;
  bodyPart: string;
  studyId: string;
  studyDate: string;
  referringDoctor?: string;
  performingDoctor: string;
  findings: string;
  impression: string;
  recommendation?: string;
}

function formatHL7Date(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const M = String(d.getMonth() + 1).padStart(2, '0');
  const D = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${y}${M}${D}${h}${m}${s}`;
}

function escapeHL7(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\E\\')
    .replace(/\n/g, '\\.br\\')
    .replace(/\r/g, '')
    .replace(/\|/g, '\\F\\')
    .replace(/\^/g, '\\S\\')
    .replace(/&/g, '\\T\\')
    .replace(/~/g, '\\R\\');
}

export function buildHL7ORUR01(opts: HL7ORUR01Options): string {
  const sendingApp = opts.sendingApp || 'G005_RIS';
  const sendingFacility = opts.sendingFacility || 'HANDONG_HOSP';
  const receivingApp = opts.receivingApp || 'HIS';
  const receivingFacility = opts.receivingFacility || 'HANDONG_HOSP';
  const msgId = opts.messageControlId || `MSG${Date.now()}`;
  const ts = formatHL7Date(new Date().toISOString());
  const obsTs = formatHL7Date(opts.observationDateTime);

  const segments: string[] = [];

  // MSH - 消息头
  segments.push([
    'MSH',
    '^~\\&',
    sendingApp,
    sendingFacility,
    receivingApp,
    receivingFacility,
    ts,
    '',
    'ORU^R01',
    msgId,
    'P',
    '2.5.1',
  ].join('|'));

  // PID - 患者身份
  segments.push([
    'PID',
    '1',
    '',
    opts.patientId,
    '',
    `${escapeHL7(opts.patientName)}^^^`,
    opts.patientDOB || '',
    opts.patientGender,
  ].join('|'));

  // PV1 - 就诊
  segments.push(['PV1', '1', 'O', '', '', opts.referringDoctor || '', '', '', '', '', '', '', '', 'RAD^^^' + sendingFacility].join('|'));

  // OBR - 检查申请
  segments.push([
    'OBR',
    '1',
    opts.studyId,
    opts.reportId,
    `${opts.modality}^${opts.bodyPart}^CPT`,
    '',
    obsTs,
    '',
    '',
    '',
    opts.performingDoctor,
    '',
    '',
  ].join('|'));

  // OBR-25 - 报告状态
  segments.push(`OBR|1|${opts.studyId}|${opts.reportId}|||||||||||||||||||||${opts.reportStatus}||||||`);

  // OBX - 观察
  let obxNum = 1;
  const addOBX = (type: string, value: string) => {
    segments.push([
      'OBX',
      String(obxNum++),
      type,
      `${opts.modality}_${opts.bodyPart}^report^G005`,
      '',
      escapeHL7(value).slice(0, 65000),
      '',
      '',
      '',
      '',
      'F',
      '',
      obsTs,
    ].join('|'));
  };

  addOBX('TX', `FINDINGS: ${opts.findings}`);
  addOBX('TX', `IMPRESSION: ${opts.impression}`);
  if (opts.recommendation) addOBX('TX', `RECOMMENDATION: ${opts.recommendation}`);

  return segments.map(s => s + '\r').join('');
}

export function downloadHL7(hl7: string, filename: string): void {
  const blob = new Blob([hl7], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// 解析 ORU^R01 响应 ACK
export interface HL7AckResult {
  accepted: boolean;
  code: string;
  message: string;
}

export function parseHL7Ack(hl7: string): HL7AckResult {
  const msa = hl7.split('\r').find(l => l.startsWith('MSA'));
  if (!msa) return { accepted: false, code: 'NO_MSA', message: 'No MSA segment' };
  const parts = msa.split('|');
  const code = parts[1] || '';
  const message = parts[2] || '';
  return {
    accepted: code === 'AA' || code === 'CA',
    code,
    message,
  };
}
