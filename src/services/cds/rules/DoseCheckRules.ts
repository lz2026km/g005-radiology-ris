/**
 * G005 RIS v3.0.6.6 - CDS Dose Check Rules
 *
 * 40 点 - CTDI/DLP/SSDE 剂量评估 + 累积追踪
 * 来源:ACR-AAPM 剂量参考、AAPM TG-204/220、IRQN
 */
import type {
  CdsAlert,
  CdsDoseRecord,
  DoseAlertLevel,
  DoseCheckResult,
  DoseThreshold,
} from '../../../types/cds';

const DEFAULT_THRESHOLDS: DoseThreshold[] = [
  { examType: '成人头部 CT 平扫', modality: 'CT', bodyPart: '头颅', ageGroup: 'adult', ctdiVolLimit: 75, dlpLimit: 1050, achievableCtdiVol: 60, achievableDlp: 850, source: 'ACR', version: '2024', updatedAt: '2025-01-15' },
  { examType: '成人胸部 CT 平扫', modality: 'CT', bodyPart: '胸部', ageGroup: 'adult', ctdiVolLimit: 21, dlpLimit: 650, achievableCtdiVol: 13, achievableDlp: 400, source: 'ACR', version: '2024', updatedAt: '2025-01-15' },
  { examType: '成人胸部 CT 增强', modality: 'CT', bodyPart: '胸部', ageGroup: 'adult', ctdiVolLimit: 30, dlpLimit: 1000, achievableCtdiVol: 21, achievableDlp: 650, source: 'ACR', version: '2024', updatedAt: '2025-01-15' },
  { examType: '成人腹部 CT 平扫', modality: 'CT', bodyPart: '腹部', ageGroup: 'adult', ctdiVolLimit: 25, dlpLimit: 900, achievableCtdiVol: 18, achievableDlp: 600, source: 'ACR', version: '2024', updatedAt: '2025-01-15' },
  { examType: '成人腹部 CT 增强', modality: 'CT', bodyPart: '腹部', ageGroup: 'adult', ctdiVolLimit: 35, dlpLimit: 1300, achievableCtdiVol: 25, achievableDlp: 900, source: 'ACR', version: '2024', updatedAt: '2025-01-15' },
  { examType: '成人腹部盆腔 CT 增强', modality: 'CT', bodyPart: '盆腔', ageGroup: 'adult', ctdiVolLimit: 35, dlpLimit: 1500, achievableCtdiVol: 25, achievableDlp: 1100, source: 'ACR', version: '2024', updatedAt: '2025-01-15' },
  { examType: '成人冠脉 CTA', modality: 'CT', bodyPart: '心脏', ageGroup: 'adult', ctdiVolLimit: 50, dlpLimit: 900, achievableCtdiVol: 35, achievableDlp: 650, source: 'ACR', version: '2024', updatedAt: '2025-01-15' },
  { examType: '成人肺动脉 CTA', modality: 'CT', bodyPart: '胸部', ageGroup: 'adult', ctdiVolLimit: 25, dlpLimit: 600, achievableCtdiVol: 15, achievableDlp: 400, source: 'ACR', version: '2024', updatedAt: '2025-01-15' },
  { examType: '儿童头部 CT', modality: 'CT', bodyPart: '头颅', ageGroup: 'pediatric', ctdiVolLimit: 30, dlpLimit: 400, achievableCtdiVol: 20, achievableDlp: 280, source: 'Image Gently', version: '2023', updatedAt: '2025-01-15' },
  { examType: '儿童胸部 CT', modality: 'CT', bodyPart: '胸部', ageGroup: 'pediatric', ctdiVolLimit: 12, dlpLimit: 250, achievableCtdiVol: 8, achievableDlp: 180, source: 'Image Gently', version: '2023', updatedAt: '2025-01-15' },
  { examType: '儿童腹部 CT', modality: 'CT', bodyPart: '腹部', ageGroup: 'pediatric', ctdiVolLimit: 15, dlpLimit: 400, achievableCtdiVol: 10, achievableDlp: 280, source: 'Image Gently', version: '2023', updatedAt: '2025-01-15' },
  { examType: '新生儿胸部 CT', modality: 'CT', bodyPart: '胸部', ageGroup: 'neonate', ctdiVolLimit: 5, dlpLimit: 80, achievableCtdiVol: 3, achievableDlp: 50, source: 'Image Gently', version: '2023', updatedAt: '2025-01-15' },
];

const DOSE_CUMULATIVE_LIMITS: { periodDays: number; ctdiMax: number; dlpMax: number; effectiveDoseMax: number }[] = [
  { periodDays: 30, ctdiMax: 200, dlpMax: 5000, effectiveDoseMax: 50 },
  { periodDays: 365, ctdiMax: 800, dlpMax: 20000, effectiveDoseMax: 100 },
];

export class DoseCheckRules {
  private thresholds: DoseThreshold[] = DEFAULT_THRESHOLDS;
  private records: CdsDoseRecord[] = [];
  private customThresholds: DoseThreshold[] = [];

  getThresholds(): DoseThreshold[] {
    return [...this.thresholds, ...this.customThresholds];
  }

  getThresholdsFor(modality: string, bodyPart: string, ageGroup: string): DoseThreshold[] {
    return this.getThresholds().filter((t) => t.modality === modality && t.bodyPart === bodyPart && t.ageGroup === ageGroup);
  }

  setCustomThreshold(t: DoseThreshold): DoseThreshold {
    const idx = this.customThresholds.findIndex((x) => x.examType === t.examType);
    if (idx >= 0) this.customThresholds[idx] = t;
    else this.customThresholds.push(t);
    return t;
  }

  addRecord(record: CdsDoseRecord): CdsDoseRecord {
    this.records.push(record);
    return record;
  }

  getRecords(patientWeightKg?: number, periodDays = 30): CdsDoseRecord[] {
    const from = Date.now() - periodDays * 86400000;
    return this.records.filter((r) => new Date(r.recordedAt).getTime() >= from);
  }

  computeCumulative(periodDays = 30): { ctdiAccumulated: number; dlpAccumulated: number; periodDays: number; exams: number } {
    const list = this.getRecords(undefined, periodDays);
    return {
      ctdiAccumulated: list.reduce((a, r) => a + (r.ctdiVol ?? 0), 0),
      dlpAccumulated: list.reduce((a, r) => a + (r.dlp ?? 0), 0),
      periodDays,
      exams: list.length,
    };
  }

  evaluate(record: CdsDoseRecord): CdsAlert[] {
    const out: CdsAlert[] = [];
    const threshold = this.getThresholdsFor(record.modality, '', record.ageGroup)[0];
    const result = this.checkDose(record, threshold);
    if (result.alertLevel === 'within_limit') return out;
    const severity = result.alertLevel === 'significantly_exceeded' ? 'critical' : result.alertLevel === 'exceeded' ? 'high' : result.alertLevel === 'approaching' ? 'warning' : 'notice';
    out.push({
      id: 'alert-' + Date.now().toString(36) + '-dose-' + record.studyId,
      ruleId: 'dose-' + result.alertLevel,
      ruleName: '剂量' + this.levelLabel(result.alertLevel),
      category: result.alertLevel === 'significantly_exceeded' || result.alertLevel === 'exceeded' ? 'dose_exceed' : 'dose_alert',
      severity,
      status: 'active',
      title: 'CT 剂量' + this.levelLabel(result.alertLevel),
      message: 'CTDIvol=' + (record.ctdiVol ?? '-') + ' mGy, DLP=' + (record.dlp ?? '-') + ' mGy·cm (限值 CTDIvol ' + (threshold?.ctdiVolLimit ?? '-') + '/DLP ' + (threshold?.dlpLimit ?? '-') + ')',
      triggeredAt: new Date().toISOString(),
      blocking: result.alertLevel === 'significantly_exceeded',
      source: 'rule',
      recommendations: result.recommendations ?? ['降低管电流', '使用迭代重建', '检查必要性复核'],
      evidence: [
        { type: 'measurement', label: 'CTDIvol', value: record.ctdiVol ?? 0, unit: 'mGy', referenceRange: '≤ ' + (threshold?.ctdiVolLimit ?? '-'), flag: severity === 'critical' || severity === 'high' ? 'high' : 'normal' },
        { type: 'measurement', label: 'DLP', value: record.dlp ?? 0, unit: 'mGy·cm', referenceRange: '≤ ' + (threshold?.dlpLimit ?? '-'), flag: severity === 'critical' || severity === 'high' ? 'high' : 'normal' },
        { type: 'measurement', label: 'SSDE', value: record.ssde ?? 0, unit: 'mGy' },
      ],
      metadata: { studyId: record.studyId, alertLevel: result.alertLevel, requiresAck: result.requiresAcknowledgement },
    });
    const cumulative = this.computeCumulative(30);
    for (const limit of DOSE_CUMULATIVE_LIMITS) {
      if (limit.periodDays === 30 && cumulative.dlpAccumulated > limit.dlpMax) {
        out.push({
          id: 'alert-' + Date.now().toString(36) + '-dose-cum-' + limit.periodDays,
          ruleId: 'dose-cumulative-' + limit.periodDays,
          ruleName: '累积剂量超限 ' + limit.periodDays + ' 天',
          category: 'radiation_overrun',
          severity: 'high',
          status: 'active',
          title: limit.periodDays + ' 天累积 DLP 超 ' + limit.dlpMax + ' mGy·cm',
          message: '当前累积 DLP=' + cumulative.dlpAccumulated.toFixed(0) + ' mGy·cm (共 ' + cumulative.exams + ' 次检查)',
          triggeredAt: new Date().toISOString(),
          blocking: false,
          source: 'rule',
          recommendations: ['评估后续检查必要性', '考虑替代成像方式', '累积剂量记录'],
          metadata: { cumulative },
        });
      }
    }
    return out;
  }

  checkDose(record: CdsDoseRecord, threshold?: DoseThreshold): DoseCheckResult {
    const baseResult: DoseCheckResult = {
      studyId: record.studyId,
      modality: record.modality,
      bodyPart: '胸部',
      ageGroup: record.ageGroup,
      ctdiVol: record.ctdiVol,
      dlp: record.dlp,
      ssde: record.ssde,
      effectiveDose: record.effectiveDose,
      alertLevel: 'within_limit',
      triggeredRules: [],
      requiresAcknowledgement: false,
    };
    if (!threshold) {
      baseResult.alertLevel = 'within_limit';
      return baseResult;
    }
    baseResult.ctdiVolLimit = threshold.ctdiVolLimit;
    baseResult.dlpLimit = threshold.dlpLimit;
    baseResult.ssdeLimit = threshold.ssdeLimit;
    baseResult.effectiveDoseLimit = threshold.effectiveDoseLimit;
    let alertLevel: DoseAlertLevel = 'within_limit';
    let ctdiPct = 0;
    let dlpPct = 0;
    if (record.ctdiVol && threshold.ctdiVolLimit) {
      ctdiPct = (record.ctdiVol / threshold.ctdiVolLimit) * 100;
      baseResult.ctdiVolPct = Math.round(ctdiPct);
    }
    if (record.dlp && threshold.dlpLimit) {
      dlpPct = (record.dlp / threshold.dlpLimit) * 100;
      baseResult.dlpPct = Math.round(dlpPct);
    }
    const maxPct = Math.max(ctdiPct, dlpPct);
    if (maxPct >= 150) alertLevel = 'significantly_exceeded';
    else if (maxPct >= 100) alertLevel = 'exceeded';
    else if (maxPct >= 80) alertLevel = 'approaching';
    baseResult.alertLevel = alertLevel;
    baseResult.requiresAcknowledgement = alertLevel === 'exceeded' || alertLevel === 'significantly_exceeded';
    if (alertLevel === 'approaching') {
      baseResult.recommendations = ['考虑降低管电流', '使用迭代重建', '缩小扫描范围'];
    } else if (alertLevel === 'exceeded') {
      baseResult.recommendations = ['确认检查必要性', '使用低剂量协议', '记录超剂量原因'];
    } else if (alertLevel === 'significantly_exceeded') {
      baseResult.recommendations = ['强制确认', '科室主任审核', '考虑替代检查'];
    }
    if (alertLevel !== 'within_limit') baseResult.triggeredRules.push('dose-check-' + alertLevel);
    return baseResult;
  }

  private levelLabel(level: DoseAlertLevel): string {
    return level === 'within_limit' ? '达标' : level === 'approaching' ? '接近限值' : level === 'exceeded' ? '超限' : level === 'significantly_exceeded' ? '严重超限' : '突破 ALARA';
  }

  getThresholdsTotal(): number {
    return this.getThresholds().length;
  }

  getRecordsTotal(): number {
    return this.records.length;
  }
}

let _instance: DoseCheckRules | null = null;
export function getDoseCheckRules(): DoseCheckRules {
  if (!_instance) _instance = new DoseCheckRules();
  return _instance;
}
