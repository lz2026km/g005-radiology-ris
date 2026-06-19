/**
 * G005 放射RIS系统 v3.0.6.0 - DICOM 去标识化
 * Phase R7:根据 HIPAA / GB/T 39725 移除/模糊敏感字段
 */
import type { DicomDeIdOptions } from '../../types/export';

export interface DicomDataset {
  [tag: string]: { vr: string; Value?: unknown[] };
}

export interface DeIdResult {
  dataset: DicomDataset;
  removedTags: string[];
  modifiedTags: string[];
  stats: { removed: number; modified: number; kept: number };
}

const HIPAA_TAGS: Record<string, string> = {
  '00100010': 'PatientName',
  '00100020': 'PatientID',
  '00100030': 'PatientBirthDate',
  '00100040': 'PatientSex',
  '00100050': 'PatientWeight',
  '00101010': 'PatientAge',
  '00101030': 'PatientWeight',
  '00101040': 'PatientAddress',
  '00101050': 'PatientTelephoneNumbers',
  '00101060': 'PatientReligiousPreference',
  '00101080': 'MilitaryRank',
  '00101081': 'BranchOfService',
  '00101090': 'MedicalRecordLocator',
  '00102000': 'MedicalAlerts',
  '00102150': 'CountryOfResidence',
  '00102152': 'RegionOfResidence',
  '00102154': 'PatientTelecomInformation',
  '00080080': 'InstitutionName',
  '00080081': 'InstitutionAddress',
  '00080090': 'ReferringPhysicianName',
  '00080096': 'ReferringPhysicianAddress',
  '0008009C': 'ConsultingPhysicianName',
  '00081010': 'StationName',
  '00081030': 'StudyDescription',
  '00081040': 'DepartmentName',
  '00081050': 'PerformingPhysicianName',
  '00081060': 'NameOfPhysiciansReadingStudy',
  '00081070': 'OperatorsName',
  '00081080': 'AdmittingDiagnosesDescription',
  '00204000': 'ImageComments',
  '00400100': 'ScheduledStationAETitle',
  '00401001': 'ScheduledStationName',
  '00402010': 'VerifyingOrganization',
  '0040A027': 'VerifyingObserverName',
};

export class DicomDeId {
  process(dataset: DicomDataset, options: DicomDeIdOptions): DeIdResult {
    const result: DicomDataset = {};
    const removedTags: string[] = [];
    const modifiedTags: string[] = [];
    let kept = 0;

    for (const [tag, elem] of Object.entries(dataset)) {
      const tagName = HIPAA_TAGS[tag] ?? tag;

      if (this.shouldRemove(tag, options)) {
        removedTags.push(tagName);
        continue;
      }

      if (this.shouldModify(tag, options)) {
        const modified = this.modifyValue(tag, elem, options);
        result[tag] = modified;
        modifiedTags.push(tagName);
        continue;
      }

      result[tag] = elem;
      kept++;
    }

    return {
      dataset: result,
      removedTags,
      modifiedTags,
      stats: { removed: removedTags.length, modified: modifiedTags.length, kept },
    };
  }

  anonymizeStudyUid(uid: string): string {
    const hash = this.simpleHash(uid);
    return `1.2.840.${hash}`;
  }

  hashPatientId(id: string): string {
    return this.simpleHash(id);
  }

  private shouldRemove(tag: string, opts: DicomDeIdOptions): boolean {
    if (opts.removePatientName && tag === '00100010') return true;
    if (opts.removePatientId && tag === '00100020') return true;
    if (opts.removePatientBirthDate && tag === '00100030') return true;
    if (opts.removePatientAddress && (tag === '00101040' || tag === '00100040')) return true;
    if (opts.removeInstitutionName && tag === '00080080') return true;
    if (opts.removeReferringPhysician && tag === '00080090') return true;
    if (opts.removeStudyDate && tag === '00080020') return true;
    if (opts.hashPrivateTags && tag.startsWith('0029') || tag.startsWith('0009')) return true;
    return false;
  }

  private shouldModify(tag: string, opts: DicomDeIdOptions): boolean {
    if (opts.dateShiftDays && tag === '00080020') return true;
    if (opts.dateShiftDays && tag === '00080021') return true;
    if (opts.dateShiftDays && tag === '00080022') return true;
    if (opts.dateShiftDays && tag === '00080030') return true;
    if (opts.keepUIDs && (tag === '0020000D' || tag === '0020000E' || tag === '00080018')) return false;
    return false;
  }

  private modifyValue(tag: string, elem: DicomDataset[string], opts: DicomDeIdOptions): DicomDataset[string] {
    const modified = { ...elem };
    if (modified.Value && opts.dateShiftDays) {
      modified.Value = modified.Value.map((v: unknown) => {
        if (typeof v === 'string' && /^\d{8}$/.test(v)) {
          const d = new Date(+v.slice(0, 4), +v.slice(4, 6) - 1, +v.slice(6, 8));
          d.setDate(d.getDate() + opts.dateShiftDays);
          return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
        }
        return v;
      });
    }
    return modified;
  }

  private simpleHash(s: string): string {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h) + s.charCodeAt(i);
      h |= 0;
    }
    return String(Math.abs(h));
  }
}

let singleton: DicomDeId | null = null;
export function getDicomDeId(): DicomDeId {
  if (!singleton) singleton = new DicomDeId();
  return singleton;
}
