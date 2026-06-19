/**
 * G005 RIS v3.0.6.6 - CDS (Clinical Decision Support) 统一类型定义
 *
 * 11 个子系统共用类型:引擎 / 规则 / 告警 / ACR Select / 指南 / 协议 / 路径
 * 覆盖 R3.CDS.HOOKS / R3.CDS.RULES / R3.CDS.ACR / R3.CDS.GUIDE / R3.CDS.PATHWAY
 */
import type { ModalityType, BodyPart, Gender } from '../index';

// ─────────────────────────────────────────────────────────────
// 1. CDS Hooks Engine
// ─────────────────────────────────────────────────────────────
export type CdsEventType =
  | 'order.create'
  | 'order.update'
  | 'exam.schedule'
  | 'exam.start'
  | 'exam.complete'
  | 'contrast.inject'
  | 'report.draft'
  | 'report.submit'
  | 'report.sign'
  | 'dose.record'
  | 'protocol.select'
  | 'pathway.activate'
  | 'critical.detect';

export type CdsHookPhase = 'pre' | 'post' | 'validate';

export interface CdsHook {
  id: string;
  name: string;
  description: string;
  eventType: CdsEventType;
  phase: CdsHookPhase;
  ruleIds: string[];
  priority: number;
  enabled: boolean;
  blocking: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CdsTriggerContext {
  eventType: CdsEventType;
  patient?: CdsPatientContext;
  exam?: CdsExamContext;
  report?: CdsReportContext;
  order?: CdsOrderContext;
  doseRecord?: CdsDoseRecord;
  protocol?: CdsProtocolChoice;
  pathway?: CdsPathwayContext;
  metadata?: Record<string, unknown>;
  userId?: string;
  userName?: string;
  timestamp: string;
}

export interface CdsPatientContext {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  weightKg?: number;
  heightCm?: number;
  egfr?: number;
  creatinine?: number;
  pregnancyWeeks?: number;
  allergies?: string[];
  contrastAllergy?: boolean;
  shellfishAllergy?: boolean;
  asthmaHistory?: boolean;
  diabetesMellitus?: boolean;
  hyperthyroidism?: boolean;
  heartFailure?: boolean;
  renalFailure?: boolean;
  claustrophobia?: boolean;
  pacemaker?: boolean;
  cochlearImplant?: boolean;
  aneurysmClip?: boolean;
  metallicForeignBody?: boolean;
  medications?: string[];
  diagnoses?: string[];
  priorImaging?: string[];
  bsa?: number;
}

export interface CdsExamContext {
  id: string;
  modality: ModalityType;
  bodyPart: BodyPart;
  studyName: string;
  priority: 'routine' | 'urgent' | 'stat' | 'elective';
  contrastPlanned: boolean;
  contrastName?: string;
  estimatedDurationMin?: number;
}

export interface CdsReportContext {
  id: string;
  findings: string;
  impression: string;
  recommendation?: string;
  draftStatus: 'draft' | 'final' | 'amended';
  templateId?: string;
  sectionComplete?: Record<string, boolean>;
}

export interface CdsOrderContext {
  id: string;
  orderCode: string;
  indication: string;
  icdCode?: string;
  referringPhysician: string;
  department: string;
  scheduledAt?: string;
  status: 'new' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface CdsDoseRecord {
  studyId: string;
  modality: ModalityType;
  ctdiVol?: number;
  ctdiAccumulated?: number;
  dlp?: number;
  dlpAccumulated?: number;
  ssde?: number;
  effectiveDose?: number;
  numberOfSeries?: number;
  patientWeightKg?: number;
  ageGroup: 'adult' | 'pediatric' | 'neonate';
  recordedAt: string;
}

export interface CdsProtocolChoice {
  protocolId: string;
  protocolName: string;
  modality: ModalityType;
  bodyPart: BodyPart;
  contrastAgent?: string;
  parameters?: Record<string, number | string>;
}

export interface CdsPathwayContext {
  instanceId: string;
  pathwayId: string;
  pathwayName: string;
  currentStepId: string;
  currentStepIndex: number;
  status: 'active' | 'completed' | 'discontinued';
}

// ─────────────────────────────────────────────────────────────
// 2. 告警 (Alert) 统一模型
// ─────────────────────────────────────────────────────────────
export type CdsAlertSeverity = 'info' | 'notice' | 'warning' | 'high' | 'critical' | 'fatal';
export type CdsAlertCategory =
  | 'contraindication'
  | 'drug_interaction'
  | 'allergy'
  | 'dose_alert'
  | 'dose_exceed'
  | 'radiation_overrun'
  | 'protocol_recommendation'
  | 'guideline_recommendation'
  | 'pathway_deviation'
  | 'duplicate_order'
  | 'appropriateness'
  | 'critical_value'
  | 'completeness'
  | 'terminology'
  | 'system';
export type CdsAlertStatus = 'active' | 'acknowledged' | 'dismissed' | 'snoozed' | 'resolved' | 'escalated' | 'overridden';
export type CdsAlertAction = 'override' | 'acknowledge' | 'dismiss' | 'modify' | 'snooze' | 'escalate' | 'accept';

export interface CdsAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  category: CdsAlertCategory;
  severity: CdsAlertSeverity;
  status: CdsAlertStatus;
  title: string;
  message: string;
  patientId?: string;
  patientName?: string;
  examId?: string;
  reportId?: string;
  evidence?: CdsAlertEvidence[];
  recommendations?: string[];
  references?: CdsAlertReference[];
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  dismissedAt?: string;
  dismissedBy?: string;
  dismissReason?: string;
  overrideBy?: string;
  overrideReason?: string;
  snoozedUntil?: string;
  escalatedTo?: string;
  escalatedAt?: string;
  resolution?: string;
  metadata?: Record<string, unknown>;
  blocking: boolean;
  source: 'engine' | 'rule' | 'guideline' | 'acr' | 'pathway' | 'manual';
}

export interface CdsAlertEvidence {
  type: 'lab' | 'measurement' | 'allergy' | 'medication' | 'history' | 'calculation' | 'reference';
  label: string;
  value: string | number;
  unit?: string;
  referenceRange?: string;
  flag?: 'low' | 'normal' | 'high' | 'critical';
}

export interface CdsAlertReference {
  source: string;
  title: string;
  url?: string;
  year?: number;
  citation?: string;
}

export interface CdsAlertActionLog {
  id: string;
  alertId: string;
  action: CdsAlertAction;
  performedBy: string;
  performedAt: string;
  reason?: string;
  notes?: string;
}

// ─────────────────────────────────────────────────────────────
// 3. 规则 (Rule) 通用接口
// ─────────────────────────────────────────────────────────────
export interface CdsRule {
  id: string;
  category: CdsAlertCategory;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  severity: CdsAlertSeverity;
  enabled: boolean;
  blocking: boolean;
  version: string;
  references?: CdsAlertReference[];
  tags?: string[];
  parameters?: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
  triggerCount?: number;
  overrideCount?: number;
  acceptCount?: number;
}

// ─────────────────────────────────────────────────────────────
// 4. 禁忌症 (Contraindication)
// ─────────────────────────────────────────────────────────────
export type ContraindicationType =
  | 'absolute'
  | 'relative'
  | 'conditional'
  | 'caution';

export type ContraAgent = 'iodinated' | 'gadolinium' | 'iron_oxide' | 'barium' | 'radioisotope' | 'mr_magnetic' | 'ct_radiation';

export interface ContraindicationRule {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  agent: ContraAgent;
  modality?: ModalityType;
  type: ContraindicationType;
  severity: CdsAlertSeverity;
  conditions: ContraCondition[];
  action: string;
  alternatives?: string[];
  references?: string[];
  icdCodes?: string[];
  snomedCodes?: string[];
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  population: 'adult' | 'pediatric' | 'neonate' | 'pregnant' | 'all';
  triggered: boolean;
  triggerCount: number;
  lastUpdated: string;
}

export interface ContraCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'exists' | 'contains';
  value: string | number | string[];
  unit?: string;
}

// ─────────────────────────────────────────────────────────────
// 5. 药物交互 (Drug Interaction)
// ─────────────────────────────────────────────────────────────
export type InteractionSeverity = 'contraindicated' | 'major' | 'moderate' | 'minor';

export interface DrugInteraction {
  id: string;
  drugA: string;
  drugAClass?: string;
  drugB: string;
  drugBClass?: string;
  drugC?: string;
  drugCClass?: string;
  severity: InteractionSeverity;
  mechanism: string;
  mechanismEn: string;
  clinicalEffect: string;
  clinicalEffectEn: string;
  onsetTime?: 'rapid' | 'delayed' | 'unknown';
  documentation: 'established' | 'probable' | 'suspected' | 'possible' | 'unlikely';
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  recommendation: string;
  recommendationEn: string;
  monitoring?: string;
  management?: string;
  alternatives?: string[];
  pregnancyRisk?: 'A' | 'B' | 'C' | 'D' | 'X' | 'N';
  lactationRisk?: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  references?: CdsAlertReference[];
}

// ─────────────────────────────────────────────────────────────
// 6. 辐射剂量 (Dose Check)
// ─────────────────────────────────────────────────────────────
export type DoseAlertLevel = 'within_limit' | 'approaching' | 'exceeded' | 'significantly_exceeded' | 'achievable_breakthrough';

export interface DoseThreshold {
  examType: string;
  modality: ModalityType;
  bodyPart: BodyPart;
  ageGroup: 'adult' | 'pediatric' | 'neonate';
  ctdiVolLimit?: number;
  dlpLimit?: number;
  ssdeLimit?: number;
  effectiveDoseLimit?: number;
  achievableCtdiVol?: number;
  achievableDlp?: number;
  source: 'ACR' | 'AAPM' | 'IAEA' | 'NCRP' | 'IRQN' | 'custom';
  version: string;
  updatedAt: string;
}

export interface DoseCheckResult {
  studyId: string;
  modality: ModalityType;
  bodyPart: BodyPart;
  ageGroup: 'adult' | 'pediatric' | 'neonate';
  ctdiVol?: number;
  ctdiVolLimit?: number;
  ctdiVolPct?: number;
  dlp?: number;
  dlpLimit?: number;
  dlpPct?: number;
  ssde?: number;
  ssdeLimit?: number;
  effectiveDose?: number;
  effectiveDoseLimit?: number;
  alertLevel: DoseAlertLevel;
  triggeredRules: string[];
  recommendations?: string[];
  requiresAcknowledgement: boolean;
  achievedAt?: string;
  cumulative?: {
    ctdiAccumulated: number;
    dlpAccumulated: number;
    periodDays: number;
    exams: number;
  };
}

// ─────────────────────────────────────────────────────────────
// 7. 过敏检查 (Allergy)
// ─────────────────────────────────────────────────────────────
export type AllergySeverity = 'mild' | 'moderate' | 'severe' | 'life_threatening';
export type AllergyType = 'drug' | 'food' | 'environmental' | 'latex' | 'contrast' | 'shellfish' | 'iodine' | 'gadolinium' | 'other';

export interface PatientAllergy {
  id: string;
  patientId: string;
  allergen: string;
  allergenType: AllergyType;
  reaction: string;
  severity: AllergySeverity;
  onsetDate?: string;
  reportedBy: string;
  verified: boolean;
  notes?: string;
}

export interface AllergyCheckResult {
  patientId: string;
  agent: string;
  agentType: AllergyType;
  matchedAllergy?: PatientAllergy;
  crossReactiveAgents?: string[];
  severity: CdsAlertSeverity;
  riskLevel: 'none' | 'low' | 'moderate' | 'high' | 'absolute';
  recommendation: string;
  premedication?: string[];
  alternatives?: string[];
  requiresSkinTest?: boolean;
}

// ─────────────────────────────────────────────────────────────
// 8. ACR Select 集成
// ─────────────────────────────────────────────────────────────
export type AcrRating = 'usually_appropriate' | 'may_be_appropriate' | 'usually_not_appropriate';
export type AcrCategory = 'CT' | 'MR' | 'US' | 'NM' | 'XR' | 'MG' | 'PT' | 'IR';

export interface AcrSelectVariant {
  id: string;
  examName: string;
  examCode: string;
  modality: ModalityType;
  bodyPart: BodyPart;
  rating: AcrRating;
  appropriatenessScore: number; // 1-9
  radiationLevel: 'none' | 'low' | 'medium' | 'high' | 'very_high';
  costLevel: 'low' | 'medium' | 'high';
  contrast: 'none' | 'with_contrast' | 'without_and_with' | 'without';
  comments: string;
  references: string[];
  category: AcrCategory;
}

export interface AcrSelectDocument {
  id: string;
  title: string;
  variantCount: number;
  variants: AcrSelectVariant[];
  lastUpdated: string;
  organization: string;
  version: string;
}

export interface AcrSelectResponse {
  matchedVariant?: AcrSelectVariant;
  alternatives: AcrSelectVariant[];
  indications: string[];
  documentId?: string;
  confidence: number;
}

// ─────────────────────────────────────────────────────────────
// 9. 临床指南 (Clinical Guidelines)
// ─────────────────────────────────────────────────────────────
export type GuidelineLevel = 'A' | 'B' | 'C' | 'D' | 'I';
export type GuidelineStrength = 'strong_for' | 'conditional_for' | 'conditional_against' | 'strong_against';
export type GuidelineCategory =
  | 'fleischner'
  | 'acr'
  | 'rsna'
  | 'rsna_sa'
  | 'acr_white_paper'
  | 'esr'
  | 'rsna_peds'
  | 'nice'
  | 'rsna_incidental'
  | 'cap'
  | 'rsna_covid'
  | 'tiads'
  | 'lung_rads'
  | 'bi_rads'
  | 'ti_rads'
  | 'pi_rads'
  | 'o_rads'
  | 'cad_rads'
  | 'niaa'
  | 'rsna_renal'
  | 'rcc'
  | 'custom';

export interface ClinicalGuideline {
  id: string;
  title: string;
  shortName: string;
  category: GuidelineCategory;
  organization: string;
  version: string;
  publicationYear: number;
  lastReviewed: string;
  authors?: string[];
  abstract: string;
  modality?: ModalityType;
  bodyPart?: BodyPart;
  condition?: string;
  icdCode?: string;
  keyPoints: GuidelineKeyPoint[];
  recommendations: GuidelineRecommendation[];
  references: string[];
  evidenceLevel: GuidelineLevel;
  applicablePopulation: string;
  tags?: string[];
  downloadUrl?: string;
  doi?: string;
}

export interface GuidelineKeyPoint {
  id: string;
  text: string;
  textEn?: string;
  level: GuidelineLevel;
  section?: string;
  page?: number;
}

export interface GuidelineRecommendation {
  id: string;
  text: string;
  textEn?: string;
  strength: GuidelineStrength;
  evidenceLevel: GuidelineLevel;
  rationale?: string;
  contraindications?: string[];
  applicableTo?: string[];
  imagingProtocol?: string;
  followUp?: string;
}

// ─────────────────────────────────────────────────────────────
// 10. 检查协议 (Protocol Selector)
// ─────────────────────────────────────────────────────────────
export type ProtocolIndication =
  | 'routine'
  | 'trauma'
  | 'stroke'
  | 'pulmonary_embolism'
  | 'aortic_dissection'
  | 'cancer_staging'
  | 'tumor_follow_up'
  | 'screening'
  | 'pediatric'
  | 'pregnant'
  | 'obese'
  | 'renal_insufficiency'
  | 'cardiac'
  | 'vascular'
  | 'msk'
  | 'neuro'
  | 'body'
  | 'ent';

export interface ImagingProtocol {
  id: string;
  name: string;
  nameEn: string;
  modality: ModalityType;
  bodyPart: BodyPart;
  indication: ProtocolIndication;
  description: string;
  ageGroup: 'adult' | 'pediatric' | 'neonate' | 'all';
  contrastAgent?: string;
  contrastDose?: string;
  flowRate?: string;
  parameters: ProtocolParameter[];
  estimatedDose?: {
    ctdiVol?: number;
    dlp?: number;
    effectiveDose?: number;
  };
  duration: number;
  qualityScore: number;
  usageCount: number;
  rating: number;
  tags?: string[];
  prerequisites?: string[];
  postProcessing?: string[];
  references?: string[];
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProtocolParameter {
  name: string;
  label: string;
  value: number | string;
  unit?: string;
  range?: [number, number];
  options?: string[];
  required: boolean;
  description?: string;
}

export interface ProtocolRecommendation {
  protocol: ImagingProtocol;
  score: number;
  rationale: string[];
  warnings?: string[];
  alternatives?: string[];
  customization?: Partial<ImagingProtocol>;
}

// ─────────────────────────────────────────────────────────────
// 11. 临床路径 (Clinical Pathway)
// ─────────────────────────────────────────────────────────────
export type PathwayStepType = 'exam' | 'consultation' | 'lab' | 'follow_up' | 'procedure' | 'decision' | 'medication' | 'education';
export type PathwayStepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'blocked' | 'overdue';
export type PathwayStatus = 'active' | 'completed' | 'discontinued' | 'paused' | 'on_hold';

export interface ClinicalPathwayStep {
  id: string;
  order: number;
  type: PathwayStepType;
  name: string;
  description: string;
  modality?: ModalityType;
  bodyPart?: BodyPart;
  defaultTimingDays: number;
  duration?: number;
  isOptional: boolean;
  isMilestone: boolean;
  dependsOnStepIds?: string[];
  requiredResources?: string[];
  responsibleRole?: string;
  outcomeCriteria?: string[];
  notes?: string;
  kpiKey?: string;
}

export interface ClinicalPathwayDef {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  condition: string;
  icdCode?: string;
  description: string;
  modality?: ModalityType;
  bodyPart?: BodyPart;
  steps: ClinicalPathwayStep[];
  estimatedDurationDays: number;
  isActive: boolean;
  version: string;
  evidenceLevel: GuidelineLevel;
  organization?: string;
  tags?: string[];
  variants?: { id: string; name: string; steps: ClinicalPathwayStep[] }[];
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  completionRate: number;
}

export interface PathwayInstanceStep {
  stepId: string;
  status: PathwayStepStatus;
  plannedDate?: string;
  startedAt?: string;
  completedAt?: string;
  performedBy?: string;
  notes?: string;
  resultSummary?: string;
  deviations?: PathwayDeviation[];
}

export interface PathwayDeviation {
  id: string;
  stepId: string;
  type: 'timing' | 'sequence' | 'substitution' | 'skip' | 'addition';
  reason: string;
  approvedBy?: string;
  approvedAt?: string;
  impact: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface PathwayInstance {
  id: string;
  pathwayId: string;
  pathwayName: string;
  variantId?: string;
  patientId: string;
  patientName: string;
  diagnosisCode?: string;
  activatedAt: string;
  activatedBy: string;
  currentStepIndex: number;
  steps: PathwayInstanceStep[];
  status: PathwayStatus;
  completedAt?: string;
  discontinuedAt?: string;
  discontinueReason?: string;
  progress: number;
  kpiSnapshot?: Record<string, number | string>;
}

// ─────────────────────────────────────────────────────────────
// 12. 引擎配置 / 统计
// ─────────────────────────────────────────────────────────────
export interface CdsEngineConfig {
  enabled: boolean;
  hooksEnabled: boolean;
  allergyCheckEnabled: boolean;
  contraindicationCheckEnabled: boolean;
  drugInteractionCheckEnabled: boolean;
  doseCheckEnabled: boolean;
  acrSelectEnabled: boolean;
  guidelineEnabled: boolean;
  pathwayEnabled: boolean;
  protocolEnabled: boolean;
  blockingForCritical: boolean;
  blockingForFatal: boolean;
  maxAlertsPerContext: number;
  showInReport: boolean;
  showInOrder: boolean;
  showInSchedule: boolean;
  snoozeMinutes: number;
  escalationMinutes: number;
  version: string;
  lastSyncedAt?: string;
}

export interface CdsStatistics {
  totalAlerts: number;
  activeAlerts: number;
  acknowledgedAlerts: number;
  dismissedAlerts: number;
  overriddenAlerts: number;
  escalatedAlerts: number;
  resolutionRate: number;
  averageAcknowledgeMinutes: number;
  categoryBreakdown: Record<CdsAlertCategory, number>;
  severityBreakdown: Record<CdsAlertSeverity, number>;
  topRules: { ruleId: string; ruleName: string; triggered: number; overridden: number }[];
  dailyVolume: { date: string; triggered: number; resolved: number; overridden: number }[];
  topUsers: { userId: string; userName: string; triggered: number; overrideRate: number }[];
  period: { from: string; to: string };
}

// ─────────────────────────────────────────────────────────────
// 13. Hook 回调 / 事件结果
// ─────────────────────────────────────────────────────────────
export interface CdsHookResult {
  ok: boolean;
  blocked: boolean;
  alerts: CdsAlert[];
  modifiedContext?: CdsTriggerContext;
  durationMs: number;
  executedRules: string[];
  errors?: string[];
}

export interface CdsEngineEvent {
  type: 'trigger' | 'alert.created' | 'alert.updated' | 'alert.dismissed' | 'rule.fired' | 'engine.error';
  timestamp: string;
  payload: unknown;
}

export type CdsEngineListener = (event: CdsEngineEvent) => void;
