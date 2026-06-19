/**
 * G005 RIS v3.0.6.5 - 报告模板计算引擎类型
 * 800 升级点 - 计算 / 自动填充 / 规则引擎 / 风险可视化
 * 对应:src/services/templates/{calculations,autoFill,autoReport,audit}/ 与 src/services/templates/rads/
 */
import type { RadsScoringResult, RadsSystem } from '@data/rads/radsCommon';

// ============================================================
// 1. 通用计算上下文
// ============================================================
export type CalcUnitSystem = 'metric' | 'imperial';
export type CalcSex = 'male' | 'female';
export type CalcAgeUnit = 'year' | 'month' | 'day';

export interface CalcPatientContext {
  age: number;
  ageUnit: CalcAgeUnit;
  sex: CalcSex;
  weightKg?: number;
  heightCm?: number;
  serumCreatinineMgDl?: number;
  serumCreatinineUmolL?: number;
  pregnant?: boolean;
}

export interface CalcStudyContext {
  modality?: string;
  bodyPart?: string;
  studyDate?: string;
  priorStudies?: Array<{ studyId: string; date: string; values: Record<string, number> }>;
}

export interface CalcResultMeta {
  formula: string;
  reference: string;
  unit: string;
  flags?: {
    low?: boolean;
    high?: boolean;
    criticalLow?: boolean;
    criticalHigh?: boolean;
    normal?: boolean;
  };
  notes?: string[];
  warnings?: string[];
}

// ============================================================
// 2. 医学计算定义
// ============================================================
export type ClinicalCalcId =
  | 'cobbAngle'
  | 'efw'
  | 'egfr'
  | 'tavrSizing'
  | 'ctr'
  | 'lvMass'
  | 'aorticSizeIndex'
  | 'bmi'
  | 'bsaMosteller'
  | 'tdiIcVolume'
  | 'correctedQt'
  | 'targetDiameter';

export interface ClinicalCalcInput {
  cobbAngle?: { upperEndplateDeg: number; lowerEndplateDeg: number };
  efw?: { hcMm: number; acMm: number; flMm: number; bpdMm?: number; gaWeeks: number };
  egfr?: { age: number; sex: CalcSex; scrMgDl: number; race?: 'black' | 'other'; cystatinC?: number };
  tavrSizing?: { annulusAreaMm2: number; perimeterMm: number; perimeterDerivedDiameterMm: number };
  ctr?: { heartDiameterMm: number; thoraxDiameterMm: number };
  lvMass?: { ivsdMm: number; lveddMm: number; pwdMm: number; sex: CalcSex; bsa: number };
  aorticSizeIndex?: { maxAorticDiameterMm: number; bsa: number };
  bmi?: { weightKg: number; heightCm: number };
  bsaMosteller?: { weightKg: number; heightCm: number };
  tdiIcVolume?: { lengthMm: number; widthMm: number; heightMm: number };
  correctedQt?: { qtMs: number; rrMs: number };
  targetDiameter?: { vesselMm: number; bsa: number };
}

export interface ClinicalCalcOutput<TValue = number, TExtra = unknown> {
  id: ClinicalCalcId;
  value: TValue;
  meta: CalcResultMeta;
  category: 'normal' | 'abnormal' | 'critical';
  interpretation: string;
  extra?: TExtra;
}

export type CobbAngleOutput = ClinicalCalcOutput<number, { severity: 'mild' | 'moderate' | 'severe' }>;
export type EfwOutput = ClinicalCalcOutput<number, { percentile: number; gaWeeks: number }>;
export type EgfrOutput = ClinicalCalcOutput<number, { ckdStage: 'G1' | 'G2' | 'G3a' | 'G3b' | 'G4' | 'G5'; method: string }>;
export type TavrOutput = ClinicalCalcOutput<{ recommended: number; areaDerived: number; perimeterDerived: number }, { oversizingPercent: number; valveSize: number }>;
export type CtrOutput = ClinicalCalcOutput<number, { severity: 'normal' | 'mild' | 'moderate' | 'severe' }>;
export type LvMassOutput = ClinicalCalcOutput<number, { indexed: number; severity: 'normal' | 'mild' | 'moderate' | 'severe' }>;
export type AsiOutput = ClinicalCalcOutput<number, { severity: 'normal' | 'low-risk' | 'medium-risk' | 'high-risk' }>;
export type BmiOutput = ClinicalCalcOutput<number, { category: 'underweight' | 'normal' | 'overweight' | 'obese-i' | 'obese-ii' | 'obese-iii' }>;
export type BsaOutput = ClinicalCalcOutput<number, undefined>;
export type TdiVolumeOutput = ClinicalCalcOutput<number, undefined>;
export type QtcOutput = ClinicalCalcOutput<number, { severity: 'normal' | 'borderline' | 'prolonged' }>;
export type TargetDiameterOutput = ClinicalCalcOutput<number, undefined>;

// ============================================================
// 3. RADS 通用计算
// ============================================================
export interface RadsCalculatorRequest {
  radsType: RadsSystem;
  modality: string;
  bodyPart: string;
  values: Record<string, unknown>;
  locale?: 'zh-CN' | 'en-US';
  reportId?: string;
  studyId?: string;
  patientId?: string;
}

export interface RadsCalculatorResult extends RadsScoringResult {
  radsType: RadsSystem;
  modality: string;
  bodyPart: string;
  inputs: Record<string, unknown>;
  snippet?: {
    finding: string;
    impression: string;
    recommendation: string;
  };
  explanation: string;
  warnings: string[];
  alternativeCategories?: Array<{ category: string; reason: string }>;
  computedAt: string;
}

// ============================================================
// 4. 自动填充
// ============================================================
export type AutoFillSource =
  | 'prior-report'
  | 'emr-allergy'
  | 'emr-medication'
  | 'emr-diagnosis'
  | 'emr-lab'
  | 'order'
  | 'patient-demographics'
  | 'study-history'
  | 'similar-case'
  | 'protocol'
  | 'ai-prediction';

export interface AutoFillSuggestion {
  id: string;
  fieldKey: string;
  fieldLabel: string;
  currentValue: unknown;
  suggestedValue: unknown;
  confidence: number;     // 0..1
  source: AutoFillSource;
  sourceRef?: string;     // e.g. priorReportId
  rationale: string;
  evidence?: string;      // snippet or measurement
  requiresApproval: boolean;
  createdAt: string;
}

export interface AutoFillContext {
  reportId: string;
  studyId: string;
  patientId: string;
  templateId: string;
  fieldKeys: string[];
  values: Record<string, unknown>;
  locale: 'zh-CN' | 'en-US';
}

export interface PriorStudySummary {
  studyId: string;
  studyDate: string;
  modality: string;
  bodyPart: string;
  findings: string;
  impression: string;
  measurements: Record<string, number>;
}

// ============================================================
// 5. 自动报告
// ============================================================
export interface AutoReportSection {
  key: string;
  title: string;
  body: string;
  source: 'fields' | 'findings' | 'comparison' | 'rads' | 'calculation' | 'phrase' | 'template';
  citations?: string[];
  confidence: number;
}

export interface AutoReportDraft {
  reportId: string;
  templateId: string;
  radsType?: RadsSystem;
  sections: AutoReportSection[];
  generatedAt: string;
  modelVersion: string;
  warnings: string[];
  totalConfidence: number;
}

// ============================================================
// 6. 模板审计
// ============================================================
export type TemplateViolationSeverity = 'error' | 'warning' | 'info';
export type TemplateViolationCode =
  | 'missing-required-field'
  | 'duplicate-field-key'
  | 'circular-inheritance'
  | 'orphan-group'
  | 'rads-not-linked'
  | 'calculation-not-bound'
  | 'untranslated-label'
  | 'invalid-formula'
  | 'sensitive-phi'
  | 'deprecated-snippet'
  | 'unapproved-template'
  | 'inconsistent-version'
  | 'no-metric-unit'
  | 'no-reference-range';

export interface TemplateViolation {
  id: string;
  code: TemplateViolationCode;
  severity: TemplateViolationSeverity;
  message: string;
  messageEn: string;
  fieldKey?: string;
  groupKey?: string;
  templateId?: string;
  recommendation: string;
  rule: string;
}

export interface TemplateAuditReport {
  templateId: string;
  auditedAt: string;
  score: number;          // 0..100
  totalFields: number;
  groups: number;
  violations: TemplateViolation[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
  checklist: Array<{ id: string; label: string; pass: boolean; note?: string }>;
}

// ============================================================
// 7. 风险可视化
// ============================================================
export type RiskBand = 'very-low' | 'low' | 'intermediate' | 'high' | 'very-high';

export interface RadsRiskGaugeData {
  radsType: RadsSystem;
  category: string;
  score: number;             // 0..100
  band: RiskBand;
  recommendation: string;
  range: { min: number; max: number; optimal: number };
  deltas?: Array<{ label: string; value: number; band: RiskBand }>;
}
