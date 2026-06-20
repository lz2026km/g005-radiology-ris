/** G005 眼科 PACS/RIS 类型定义 v3.0.6.8-21 — 500 升级点深化 */

/** 眼别 */
export type EyeSide = "OD" | "OS" | "OU";

/** 视力记法 */
export type VisionNotation = "snellen" | "decimal" | "five" | "logmar";

/** 视力类型 */
export type VisionType = "ucva" | "bcva" | "phva";

/** 视力距离 */
export type VisionDistance = "far" | "near";

/** 视力记录 */
export interface VisionRecord {
  od: number | null;
  os: number | null;
  notation: VisionNotation;
  type: VisionType;
  distance: VisionDistance;
}

/** 眼压测量方式 */
export type IopDevice = "nct" | "goldmann" | "icare" | "diaton" | "tonopen";

/** 眼压记录 */
export interface IopRecord {
  od: number;
  os: number;
  device: IopDevice;
  timestamp: string;
}

/** 眼压 24h 曲线 */
export interface Iop24hCurve {
  records: IopRecord[];
  patientId: string;
  date: string;
  sleepPeriod?: { start: string; end: string };
}

/** 验光处方 */
export interface RefractionPrescription {
  od: {
    sph: number;
    cyl: number;
    axis: number;
    prism?: number;
    base?: string;
    add?: number;
    va?: number;
  };
  os: {
    sph: number;
    cyl: number;
    axis: number;
    prism?: number;
    base?: string;
    add?: number;
    va?: number;
  };
  pd: number;
  ph: number;
}

/** IOL 计算输入 */
export interface IolInput {
  al: number;
  k1: number;
  k2: number;
  km: number;
  acd: number;
  lt: number;
  wtw: number;
  cct: number;
  gender: "male" | "female";
  iolModel: string;
  aConstant: number;
  pAcd?: number;
  surgeonFactor?: number;
}

/** IOL 公式结果 */
export interface IolResult {
  formula: string;
  targetRefraction: number;
  iolPower: number;
  recommended: boolean;
  note?: string;
}

/** 裂隙灯 7 段记录 */
export interface SlitLampRecord {
  lid: string;
  conjunctiva: string;
  cornea: string;
  anteriorChamber: string;
  iris: string;
  pupil: string;
  lens: string;
}

/** 眼底 4 段记录 */
export interface FundusRecord {
  disc: string;
  macula: string;
  vessel: string;
  periphery: string;
}

/** 糖尿病视网膜病变分级（国际临床分级 0-4） */
export type DrGrade = 0 | 1 | 2 | 3 | 4;

/** 青光眼类型 */
export type GlaucomaType =
  | "primary_open"
  | "primary_close"
  | "secondary_open"
  | "secondary_close"
  | "acute"
  | "chronic";

/** 白内障分级 LOCS III */
export interface CataractGradeLOCS3 {
  nuclear: number;
  cortical: number;
  posteriorSubcapsular: number;
}

/** 糖网分级 */
export interface DrGrading {
  left: DrGrade;
  right: DrGrade;
  hasDiabeticMacularEdema: boolean;
  hasHighRisk: boolean;
}

/** 扩展检查类型 (新增 OCT-A / ERG / VEP / 角膜内皮 / 泪液 / 眼前节 / 立体照 / 多焦ERG) */
export type EyeModality =
  | "fundus_photo"
  | "oct"
  | "oct_a"
  | "ffa"
  | "icga"
  | "visual_field"
  | "topography"
  | "pentacam"
  | "iol_master"
  | "ubm"
  | "corvis"
  | "wavefront"
  | "hrt"
  | "gdx"
  | "slit_lamp"
  | "fundus_autofluorescence"
  | "erg"
  | "vep"
  | "multifocal_erg"
  | "corneal_endothelium"
  | "tear_film"
  | "anterior_segment_photo"
  | "stereo_fundus"
  | "gonioscopy"
  | "specular_microscopy";

/** 检查状态 */
export type StudyStatus =
  | "ordered"
  | "scheduled"
  | "arrived"
  | "in_progress"
  | "completed"
  | "verified"
  | "published"
  | "cancelled";

/** 影像系列 */
export interface EyeImageSeries {
  id: string;
  studyId: string;
  seriesNumber: number;
  modality: EyeModality;
  description: string;
  eyeSide: EyeSide;
  laterality: "right" | "left" | "both";
  instances: EyeImageInstance[];
  acquisitionDateTime: string;
  protocolName: string;
  manufacturer: string;
  deviceModel: string;
  softwareVersion: string;
  seriesDateTime: string;
  bodyPart: string;
  numberOfInstances: number;
  seriesType: string[];
  operatorName: string;
  performerName: string;
  institutionName: string;
}

/** 影像实例 */
export interface EyeImageInstance {
  id: string;
  seriesId: string;
  studyId: string;
  instanceNumber: number;
  sopClassUid: string;
  sopInstanceUid: string;
  url: string;
  thumbnail: string;
  description: string;
  eyeSide: EyeSide;
  rows: number;
  columns: number;
  bitsAllocated: number;
  pixelRepresentation: number;
  resize: number[];
  windowCenter: number;
  windowWidth: number;
  acquisitionNumber: number;
  imageType: string[];
  laterality: string;
  viewPosition: string;
  imageLaterality: string;
  contentDate: string;
  contentTime: string;
}

/** 窗宽窗位 */
export interface WindowLevel {
  windowCenter: number;
  windowWidth: number;
  description: string;
  presetName: string;
}

/** 影像标注 */
export interface EyeImageAnnotation {
  id: string;
  instanceId: string;
  type:
    | "point"
    | "line"
    | "circle"
    | "ellipse"
    | "rectangle"
    | "polygon"
    | "freehand"
    | "angle"
    | "text";
  coordinates: number[];
  label: string;
  color: string;
  measurement?: number;
  unit?: string;
  createdBy: string;
  createdAt: string;
  visibility: boolean;
}

/** 关键影像标记 */
export interface KeyImage {
  id: string;
  studyId: string;
  instanceId: string;
  reason: string;
  description: string;
  flaggedBy: string;
  flaggedAt: string;
  category:
    | "diagnostic"
    | "representative"
    | "abnormal"
    | "follow_up"
    | "quality_issue";
}

/** 测量记录 */
export interface EyeMeasurement {
  id: string;
  studyId: string;
  category:
    | "cdr"
    | "oct_thickness"
    | "vessel_caliber"
    | "lesion_size"
    | "corneal"
    | "anterior_segment"
    | "field"
    | "axial"
    | "endothelium";
  type: string;
  source: EyeModality;
  eyeSide: EyeSide;
  value: number;
  unit: string;
  normalRange?: [number, number];
  interpretation?: "normal" | "borderline" | "abnormal" | "critical";
  notes?: string;
  measuredAt: string;
  measuredBy: string;
  method: string;
  device: string;
}

/** OCT 厚度图 */
export interface OctThicknessMap {
  id: string;
  studyId: string;
  eyeSide: EyeSide;
  device: string;
  protocol: string;
  scanPattern: string;
  /** ETDRS 9 区 */
  central: number;
  superior: number;
  inferior: number;
  temporal: number;
  nasal: number;
  superoTemporal: number;
  superoNasal: number;
  inferoTemporal: number;
  inferoNasal: number;
  /** RNFL 4 象限 */
  rnflSuperior: number;
  rnflInferior: number;
  rnflTemporal: number;
  rnflNasal: number;
  /** Ganglion 细胞 */
  gciplAvg: number;
  gciplMin: number;
  /** 脉络膜 */
  choroidalThickness: number;
  signalStrength: number;
  qualityScore: number;
  segmentationErrors: boolean;
}

/** 视野分析 */
export interface VisualFieldAnalysis {
  id: string;
  studyId: string;
  eyeSide: EyeSide;
  device: string;
  strategy: string;
  pattern: string;
  md: number;
  psd: number;
  vfi: number;
  fovealThreshold: number;
  fixationLosses: number;
  falsePositives: number;
  falseNegatives: number;
  ght: "normal" | "borderline" | "outside_normal" | "not_reliable";
  reliability: "good" | "fair" | "poor";
  patternDeviation: number[][];
  totalDeviation: number[][];
  defectDepth: number;
  sectorDefects: { sector: string; md: number; pattern: string }[];
  glaucomaHemifieldTest: string;
  meanSensitivity: number;
}

/** AI 诊断结果 */
export interface AiDiagnosis {
  id: string;
  studyId: string;
  modelName: string;
  modelVersion: string;
  vendor: string;
  modality: EyeModality;
  eyeSide: EyeSide;
  findings: string[];
  probabilities: Record<string, number>;
  primaryDiagnosis: string;
  primaryConfidence: number;
  severity: "none" | "mild" | "moderate" | "severe" | "proliferative";
  classificationCards: AiClassificationCard[];
  recommendAction: string;
  reviewStatus: "pending" | "accepted" | "rejected" | "modified";
  reviewedBy?: string;
  reviewedAt?: string;
  processedAt: string;
  processingTimeMs: number;
  alerts: string[];
}

/** AI 分类卡 */
export interface AiClassificationCard {
  condition: string;
  probability: number;
  grade: string;
  confidence: number;
  evidenceText: string;
  heatmapUrl?: string;
  critical: boolean;
}

/** AI 模型 */
export interface AiModel {
  id: string;
  name: string;
  version: string;
  vendor: string;
  modality: EyeModality[];
  conditions: string[];
  accuracy: number;
  sensitivity: number;
  specificity: number;
  fdaApproved: boolean;
  ceMarked: boolean;
  nmpaApproved: boolean;
  releaseDate: string;
  inputRequirements: string;
  processingTime: string;
}

/** 结构化报告 */
export interface StructuredReport {
  id: string;
  studyId: string;
  patientId: string;
  templateId: string;
  templateName: string;
  findings: ReportFinding[];
  gradings: ReportGrading[];
  impressions: string;
  recommendations: string;
  criticalValues: string[];
  createdBy: string;
  createdAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  status: "draft" | "pending_review" | "verified" | "published" | "amended";
}

/** 报告所见 */
export interface ReportFinding {
  id: string;
  category: string;
  laterality: EyeSide;
  description: string;
  location: string;
  severity: string;
  qualitative: boolean;
  measurementId?: string;
  annotations: string[];
}

/** 报告分级量表 */
export interface ReportGrading {
  id: string;
  scale:
    | "locs3"
    | "etdrs"
    | "kellogg"
    | "dr_international"
    | "isnt"
    | "glaucoma_staging";
  eyeSide: EyeSide;
  grade: string;
  value: number;
  description: string;
}

/** 危急值 */
export interface CriticalValue {
  id: string;
  patientId: string;
  patientName: string;
  studyId: string;
  category: string;
  finding: string;
  severity: "urgent" | "emergent" | "significant";
  status: "open" | "acknowledged" | "resolved" | "false_alarm";
  reportedTo?: string;
  reportedAt?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNote?: string;
  createdAt: string;
  createdBy: string;
  followUpRecommended: boolean;
  followUpDays?: number;
}

/** 检查预约 */
export interface EyeAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  modality: EyeModality;
  eyeSide: EyeSide;
  scheduledDate: string;
  scheduledTime: string;
  doctorId: string;
  doctorName: string;
  department: string;
  room: string;
  status:
    | "scheduled"
    | "arrived"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "no_show";
  notes?: string;
  isFollowUp: boolean;
  priorStudyId?: string;
  createdAt: string;
  priority: "routine" | "urgent" | "emergent";
  insuranceType: string;
  fastingRequired: boolean;
  specialPrep: string;
  reminderSent: boolean;
  reminderMethod: "sms" | "phone" | "wechat" | "app";
  reminderSentAt?: string;
}

/** 手术预约 */
export interface SurgeryAppointment {
  id: string;
  patientId: string;
  patientName: string;
  procedure: string;
  eyeSide: EyeSide;
  surgeonId: string;
  surgeonName: string;
  assistantId?: string;
  anesthesiologistId?: string;
  scheduledDate: string;
  orRoom: string;
  status:
    | "scheduled"
    | "pre_checked"
    | "in_progress"
    | "completed"
    | "cancelled";
  preOpDiagnosis: string;
  implantInfo?: string;
  anesthesiaType: "local" | "topical" | "general" | "regional";
  estimatedDuration: number;
  notes?: string;
}

/** 完整眼科 EMR */
export interface OphthalmologyEmr {
  id: string;
  patientId: string;
  chiefComplaint: string;
  hpi: string;
  pastHistory: string[];
  systemicHistory: string[];
  medicationHistory: string[];
  allergyHistory: string[];
  familyHistory: string[];
  socialHistory: string[];
  visionOd: number[];
  visionOs: number[];
  iopOd: IopRecord[];
  iopOs: IopRecord[];
  slitLamp: SlitLampRecord;
  fundus: FundusRecord;
  refraction: RefractionPrescription;
  gonioscopy: string;
  diagnosis: string[];
  icdCodes: string[];
  plan: string;
  followUpDays?: number;
  preOpAssessment?: PreOpAssessment;
  postOpNote?: PostOpNote;
  surgicalRecord?: SurgicalRecord;
  informedConsent?: InformedConsent;
  createdAt: string;
  updatedAt: string;
  doctorName: string;
  department: string;
}

/** 术前评估 */
export interface PreOpAssessment {
  asaGrade: number;
  bloodPressure: string;
  heartRate: number;
  ecgNormal: boolean;
  labResults: { test: string; result: string; normal: boolean }[];
  medicationAdjustments: string;
  anesthesiologistNote: string;
  assessedBy: string;
  assessedAt: string;
}

/** 术后记录 */
export interface PostOpNote {
  dayOfSurgery: string;
  visionOd?: number[];
  visionOs?: number[];
  iopOd?: number;
  iopOs?: number;
  slitLamp: string;
  complications: string[];
  medicationPrescribed: string[];
  followUpDate: string;
  notes: string;
  doctorName: string;
}

/** 手术记录 */
export interface SurgicalRecord {
  procedureName: string;
  procedureCode: string;
  eyeSide: EyeSide;
  surgeonName: string;
  assistantName?: string;
  anesthesiaType: string;
  incisionType: string;
  incisionSize: number;
  phacoTime?: number;
  phacoPower?: number;
  iolModel?: string;
  iolPower?: number;
  iolPosition?: string;
  vitrectomyType?: string;
  tamponade?: string;
  endolaser?: boolean;
  complications: string[];
  estimatedBloodLoss: number;
  procedureDuration: number;
  specimenRemoved: string[];
  implantInfo: string;
  surgeryDate: string;
  operativeFindings: string;
  procedureDetails: string;
  disposition: string;
}

/** 知情同意 */
export interface InformedConsent {
  documentId: string;
  procedureName: string;
  risks: string[];
  benefits: string[];
  alternatives: string[];
  patientSigned: boolean;
  patientSignedAt?: string;
  witnessName: string;
  doctorName: string;
  createdDate: string;
  expiryDate: string;
}

/** 影像对比对 */
export interface ComparisonPair {
  id: string;
  patientId: string;
  patientName: string;
  priorStudyId: string;
  currentStudyId: string;
  priorDate: string;
  currentDate: string;
  priorModality: EyeModality;
  currentModality: EyeModality;
  eyeSide: EyeSide;
  measurements: ComparisonMeasurement[];
  aiProgression: string;
  conclusion: string;
  createdBy: string;
  createdAt: string;
}

/** 对比测量 */
export interface ComparisonMeasurement {
  parameter: string;
  priorValue: number;
  currentValue: number;
  unit: string;
  change: number;
  changePercent: number;
  direction: "improved" | "stable" | "worsened";
  significant: boolean;
}

/** 时间序列变化 */
export interface TimeSeriesPoint {
  date: string;
  value: number;
  unit: string;
  note?: string;
}

/** 变化趋势 */
export interface EvolutionCurve {
  parameter: string;
  modality: EyeModality;
  eyeSide: EyeSide;
  series: TimeSeriesPoint[];
  trend: "stable" | "improving" | "worsening" | "fluctuating";
  slope?: number;
  significantChange: boolean;
  lastChangeDays: number;
}

/** 随访提醒 */
export interface FollowUpReminder {
  id: string;
  patientId: string;
  patientName: string;
  condition: string;
  recommendedInterval: number;
  nextVisitDate: string;
  lastVisitDate: string;
  overdue: boolean;
  daysOverdue: number;
  status: "active" | "completed" | "lost_to_followup" | "cancelled";
  priority: "low" | "medium" | "high";
  notes: string;
  notificationSent: boolean;
}

/** 转诊记录 */
export interface EyeReferral {
  id: string;
  patientId: string;
  patientName: string;
  referringDoctor: string;
  referringDept: string;
  referredTo: string;
  referredDept: string;
  reason: string;
  diagnosis: string;
  urgency: "routine" | "urgent" | "emergent";
  status: "pending" | "accepted" | "completed" | "declined";
  createdAt: string;
  completedAt?: string;
  response?: string;
}

/** 科研病例 */
export interface ResearchCase {
  id: string;
  patientId: string;
  studyIds: string[];
  cohort: string;
  condition: string;
  inclusionCriteria: string[];
  biomarkers: Record<string, number>;
  imageUrls: string[];
  annotations: string[];
  annotationsProjectId?: string;
  enrolledAt: string;
  enrolledBy: string;
  phase:
    | "screening"
    | "baseline"
    | "follow_up_1"
    | "follow_up_2"
    | "endpoint"
    | "completed";
  status: "active" | "withdrawn" | "completed";
}

/** 科研标注项目 */
export interface AnnotationProject {
  id: string;
  name: string;
  description: string;
  condition: string;
  annotationType:
    | "bounding_box"
    | "segmentation"
    | "landmark"
    | "grade"
    | "text";
  totalImages: number;
  annotatedImages: number;
  annotators: string[];
  reviewers: string[];
  status: "setup" | "in_progress" | "review" | "completed";
  createdAt: string;
  ioaScore?: number;
}

/** 统计报告 */
export interface EyeStatReport {
  id: string;
  type:
    | "volume"
    | "diagnosis"
    | "modality"
    | "surgery"
    | "quality"
    | "productivity";
  dateRange: [string, string];
  metrics: Record<string, number>;
  charts: { type: string; data: any[] }[];
  generatedAt: string;
  generatedBy: string;
}

/** DICOM 节点配置 */
export interface DicomNodeConfig {
  aeTitle: string;
  hostname: string;
  port: number;
  type: "scu" | "scp" | "storescp" | "storescu";
  description: string;
  status: "online" | "offline" | "error";
  lastHeartbeat?: string;
  vendor: string;
  version: string;
}

/** 路由规则 */
export interface RoutingRule {
  id: string;
  name: string;
  modality: EyeModality[];
  sourceAe: string;
  destinationAe: string;
  condition: string;
  priority: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/** IOL 库存 */
export interface IolItem {
  id: string;
  manufacturer: string;
  model: string;
  power: number;
  sn: string;
  expiryDate: string;
  patientId?: string;
  implantDate?: string;
  surgeon?: string;
  lotNumber: string;
  location: string;
  quantity: number;
  status: "in_stock" | "reserved" | "implanted" | "expired" | "damaged";
}

/** 拼接/拼图配置 */
export interface MontageConfig {
  type: "panoramic" | "mosaic" | "widefield";
  images: string[];
  overlapPercent: number;
  blending: "linear" | "multi_band" | "feathering";
  autoCrop: boolean;
  quality: "draft" | "standard" | "high";
}

/** 血管追踪 */
export interface VesselTracking {
  id: string;
  studyId: string;
  eyeSide: EyeSide;
  source: "fundus_photo" | "ffa" | "oct_a";
  vessels: VesselSegment[];
  arteryCount: number;
  veinCount: number;
  avRatio: number;
  tortuosityIndex: number;
  fractalDimension: number;
}

export interface VesselSegment {
  id: string;
  type: "artery" | "vein" | "capillary";
  caliber: number;
  length: number;
  tortuosity: number;
  points: number[][];
  branchLevel: number;
}

/** 病灶分割 */
export interface LesionSegmentation {
  id: string;
  studyId: string;
  instanceId: string;
  type:
    | "microaneurysm"
    | "hemorrhage"
    | "exudate"
    | "cotton_wool"
    | "drusen"
    | "geographic_atrophy"
    | "cnv"
    | "retinal_tear"
    | "retinal_detachment"
    | "lattice"
    | "nevus"
    | "melanoma";
  eyeSide: EyeSide;
  area: number;
  diameter: number;
  distanceFromFovea: number;
  quadrant: string;
  confidence: number;
  contour: number[][];
  automated: boolean;
  validatedBy?: string;
}
