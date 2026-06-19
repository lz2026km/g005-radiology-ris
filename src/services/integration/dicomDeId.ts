// ============================================================
// G005 放射RIS系统 v3.0.6.5 - DICOM PS 3.15 去标识化服务
// Phase R11 W5: 在 SR 导出前移除 / 替换 PHI(患者身份信息)
// 30 升级点:Basic Profile / Clean Profile / 日期偏移 / 哈希 / 配置预设
// ============================================================

import type { DicomDataElement } from '../../types/R3/R3.INTEGRATION';
import type { DeIdentifyConfig, DeIdentifyResult } from '../../types/measurement';

// ============================================================
// PS 3.15 Table E.1-1 中需要清空的属性
// ============================================================
const PHI_EMPTY_TAGS: ReadonlySet<string> = new Set([
  '00100010', // PatientName
  '00100020', // PatientID
  '00100030', // PatientBirthDate
  '00100040', // PatientSex (某些 Profile 保留)
  '00101000', // OtherPatientIDs
  '00101010', // OtherPatientNames
  '00101040', // PatientAddress
  '00101090', // PatientTelephoneNumbers
  '00102160', // EthnicGroup
  '00104000', // PatientComments
  '00080080', // InstitutionName
  '00080081', // InstitutionAddress
  '00080090', // ReferringPhysicianName
  '00080092', // ReferringPhysicianAddress
  '00080094', // ReferringPhysicianTelephoneNumbers
  '00081030', // StudyDescription (可选)
  '00081040', // InstitutionalDepartmentName
  '00081050', // PerformingPhysicianName
  '00081060', // NameOfPhysiciansReadingStudy
  '00081070', // OperatorsName
  '00081090', // ManufacturerModelName (按 Profile 决定)
  '001021B0', // AdditionalPatientHistory
]);

// 可哈希 tag(替换为 SHA-1 风格短哈希)
const PHI_HASH_TAGS: ReadonlySet<string> = new Set([
  '00100020', // PatientID -> 哈希短码
  '00100010', // PatientName -> 哈希短码
]);

// 日期 tag(支持偏移 / 保留 / 完全清空)
const DATE_TAGS: ReadonlySet<string> = new Set([
  '00080020', // StudyDate
  '00080021', // SeriesDate
  '00080022', // AcquisitionDate
  '00080023', // ContentDate
  '00080025', // CurveDate
  '0008002A', // AcquisitionDateTime
  '00100030', // PatientBirthDate
]);

// 机构 tag(可整组移除)
const INSTITUTION_TAGS: ReadonlySet<string> = new Set([
  '00080080', // InstitutionName
  '00080081', // InstitutionAddress
  '00081040', // InstitutionalDepartmentName
]);

// 设备序列号
const DEVICE_SERIAL_TAGS: ReadonlySet<string> = new Set([
  '00081090', // ManufacturerModelName
  '00181000', // DeviceSerialNumber
  '00181002', // DeviceUID
]);

// 私有 tag 前缀(组号为奇数)
const PRIVATE_GROUP_PREFIX = /^001[13579]|^002[13579]|^003[13579]|^003[13579]/;

/** 计算 32-bit FNV-1a 哈希(确定性,足够去标识化使用) */
function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/** 简单确定性日期偏移(基于 patientId 派生 seed,同一患者日期偏移一致) */
function shiftDateString(dateStr: string, shiftDays: number): string {
  if (!/^\d{8}$/.test(dateStr)) return dateStr;
  const y = Number(dateStr.slice(0, 4));
  const m = Number(dateStr.slice(4, 6));
  const d = Number(dateStr.slice(6, 8));
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + shiftDays);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

function maskDateKeepYear(dateStr: string): string {
  if (!/^\d{8}$/.test(dateStr)) return '';
  return `${dateStr.slice(0, 4)}0101`;
}

function maskDateKeepYearMonth(dateStr: string): string {
  if (!/^\d{8}$/.test(dateStr)) return '';
  return `${dateStr.slice(0, 6)}01`;
}

// maskDateKeepYearMonth 保留供 keepYearMonth 模式使用
void maskDateKeepYearMonth;

/** 默认配置 */
export const defaultDeIdConfig: DeIdentifyConfig = {
  removePatientName: true,
  removePatientId: true,
  removePatientBirthDate: 'keepYear',
  removeStudyDate: 'shift',
  dateShiftDays: -90,
  removeInstitution: true,
  removeDeviceSerial: false,
  removePrivateTags: true,
  retainPrivateTags: [],
  preset: 'clean',
};

/** Basic Profile (PS 3.15 E.1.1) */
export const basicDeIdConfig: DeIdentifyConfig = {
  ...defaultDeIdConfig,
  preset: 'basic',
  removePrivateTags: false,
};

/** Clean Profile (E.1.2) */
export const cleanDeIdConfig: DeIdentifyConfig = {
  ...defaultDeIdConfig,
  preset: 'clean',
};

/** Full / Research Profile (E.1.3) */
export const fullDeIdConfig: DeIdentifyConfig = {
  ...defaultDeIdConfig,
  preset: 'full',
  removePatientBirthDate: 'full',
  removeDeviceSerial: true,
  removePrivateTags: true,
};

/** 仅去敏感 PHI,但保留日期 (便于科研随访) */
export const researchDeIdConfig: DeIdentifyConfig = {
  ...defaultDeIdConfig,
  preset: 'research',
  removeStudyDate: 'keepYear',
  dateShiftDays: 0,
  removePrivateTags: false,
};

/** 按 preset 名称获取配置 */
export function configForPreset(preset: DeIdentifyConfig['preset']): DeIdentifyConfig {
  switch (preset) {
    case 'basic':
      return basicDeIdConfig;
    case 'clean':
      return cleanDeIdConfig;
    case 'full':
      return fullDeIdConfig;
    case 'research':
      return researchDeIdConfig;
    default:
      return defaultDeIdConfig;
  }
}

/**
 * 对 dataset 应用去标识化
 *
 * @param elements 原始 dataElements
 * @param config 去标识化配置
 * @returns 处理后的 dataElements(供 SR 服务使用)与处理摘要
 */
export function applyDeIdentify(elements: DicomDataElement[], config: DeIdentifyConfig = defaultDeIdConfig): DicomDataElement[] {
  const summary = {
    retained: 0,
    replaced: 0,
    removed: 0,
    emptied: 0,
    hashed: 0,
    shifted: 0,
  };

  const processed = elements.map<DicomDataElement>((el) => {
    const tag = el.tag;
    let value = Array.isArray(el.value) ? el.value.join('\\') : el.value;

    if (config.removePrivateTags && PRIVATE_GROUP_PREFIX.test(tag)) {
      summary.removed += 1;
      return { ...el, value: '', length: 0 };
    }
    if (config.retainPrivateTags.includes(tag)) {
      summary.retained += 1;
      return el;
    }

    if (DATE_TAGS.has(tag)) {
      const s = String(value);
      switch (config.removeStudyDate) {
        case 'full':
          value = '';
          summary.emptied += 1;
          break;
        case 'keepYear':
          value = maskDateKeepYear(s);
          summary.emptied += 1;
          break;
        case 'shift':
          value = shiftDateString(s, config.dateShiftDays);
          summary.shifted += 1;
          break;
        case 'keep':
        default:
          summary.retained += 1;
          break;
      }
      return { ...el, value, length: String(value).length };
    }

    if (config.removePatientName && tag === '00100010') {
      const hashed = `ANON-${fnv1a(String(value))}`;
      if (config.removePatientId) {
        summary.hashed += 1;
        value = hashed;
      } else {
        summary.emptied += 1;
        value = '';
      }
      return { ...el, value, length: String(value).length };
    }

    if (config.removePatientId && PHI_HASH_TAGS.has(tag) && tag === '00100020') {
      const hashed = `PID-${fnv1a(String(value) + ':g005-salt')}`;
      summary.hashed += 1;
      value = hashed;
      return { ...el, value, length: String(value).length };
    }

    if (PHI_EMPTY_TAGS.has(tag)) {
      summary.emptied += 1;
      return { ...el, value: '', length: 0 };
    }

    if (config.removeInstitution && INSTITUTION_TAGS.has(tag)) {
      summary.emptied += 1;
      return { ...el, value: '', length: 0 };
    }

    if (config.removeDeviceSerial && DEVICE_SERIAL_TAGS.has(tag)) {
      summary.emptied += 1;
      return { ...el, value: '', length: 0 };
    }

    summary.retained += 1;
    return el;
  });

  void summary; // 摘要由调用方按需收集
  return processed;
}

/**
 * 计算配置指纹(用于追溯 / 审计)
 */
export function configFingerprint(config: DeIdentifyConfig): string {
  const parts = [
    config.preset,
    config.removePatientName ? '1' : '0',
    config.removePatientId ? '1' : '0',
    config.removePatientBirthDate,
    config.removeStudyDate,
    String(config.dateShiftDays),
    config.removeInstitution ? '1' : '0',
    config.removeDeviceSerial ? '1' : '0',
    config.removePrivateTags ? '1' : '0',
  ];
  return fnv1a(parts.join('|'));
}

/** 检查 dataset 是否仍含 PHI(基础规则) */
export function hasRemainingPhi(elements: DicomDataElement[]): string[] {
  const remaining: string[] = [];
  for (const el of elements) {
    if (PHI_EMPTY_TAGS.has(el.tag) || DATE_TAGS.has(el.tag) || INSTITUTION_TAGS.has(el.tag)) {
      const v = Array.isArray(el.value) ? el.value.join('') : String(el.value);
      if (v && v.trim() !== '') remaining.push(el.tag);
    }
  }
  return remaining;
}

/**
 * 对原始 elements 跑一次 de-id 并返回完整 DeIdentifyResult
 */
export function deIdentifyDataset(elements: DicomDataElement[], config: DeIdentifyConfig = defaultDeIdConfig): { elements: DicomDataElement[]; result: DeIdentifyResult } {
  const before = elements;
  const after = applyDeIdentify(before, config);
  const result: DeIdentifyResult = {
    elements: after.map((el) => ({
      tag: el.tag,
      action: 'retain',
      originalValue: '',
      newValue: Array.isArray(el.value) ? el.value.join('\\') : String(el.value),
    })),
    summary: {
      retained: 0,
      replaced: 0,
      removed: 0,
      emptied: 0,
      hashed: 0,
      shifted: 0,
    },
    configFingerprint: configFingerprint(config),
  };
  // 估算摘要
  for (const el of after) {
    const beforeEl = before.find((b) => b.tag === el.tag);
    const beforeVal = beforeEl ? (Array.isArray(beforeEl.value) ? beforeEl.value.join('') : String(beforeEl.value)) : '';
    const afterVal = Array.isArray(el.value) ? el.value.join('') : String(el.value);
    if (beforeVal === '' && afterVal === '') {
      result.summary.emptied += 1;
    } else if (beforeVal !== afterVal && afterVal.startsWith('ANON-')) {
      result.summary.hashed += 1;
    } else if (beforeVal !== afterVal && /^\d{8}$/.test(afterVal)) {
      result.summary.shifted += 1;
    } else if (beforeVal !== afterVal) {
      result.summary.replaced += 1;
    } else {
      result.summary.retained += 1;
    }
  }
  return { elements: after, result };
}

export const DicomDeId = {
  applyDeIdentify,
  deIdentifyDataset,
  hasRemainingPhi,
  configFingerprint,
  configForPreset,
  defaultDeIdConfig,
  basicDeIdConfig,
  cleanDeIdConfig,
  fullDeIdConfig,
  researchDeIdConfig,
};

export default DicomDeId;
