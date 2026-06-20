/** G005 眼科 PACS/RIS 类型定义 v3.0.6.8-20 */

/** 眼别 */
export type EyeSide = 'OD' | 'OS' | 'OU';

/** 视力记法 */
export type VisionNotation = 'snellen' | 'decimal' | 'five' | 'logmar';

/** 视力类型 */
export type VisionType = 'ucva' | 'bcva' | 'phva';

/** 视力距离 */
export type VisionDistance = 'far' | 'near';

/** 视力记录 */
export interface VisionRecord {
  od: number | null;
  os: number | null;
  notation: VisionNotation;
  type: VisionType;
  distance: VisionDistance;
}

/** 眼压测量方式 */
export type IopDevice = 'nct' | 'goldmann' | 'icare';

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
}

/** 验光处方 */
export interface RefractionPrescription {
  od: { sph: number; cyl: number; axis: number; prism?: number; base?: string; add?: number; va?: number };
  os: { sph: number; cyl: number; axis: number; prism?: number; base?: string; add?: number; va?: number };
  pd: number; // 瞳距 mm
  ph: number; // 瞳高 mm
}

/** IOL 计算输入 */
export interface IolInput {
  al: number; // 眼轴长度 mm
  k1: number;
  k2: number;
  km: number;
  acd: number; // 前房深度 mm
  lt: number; // 晶体厚度 mm
  wtw: number; // 白对白 mm
  cct: number; // 中央角膜厚度 μm
  gender: 'male' | 'female';
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
export type GlaucomaType = 'primary_open' | 'primary_close' | 'secondary_open' | 'secondary_close' | 'acute' | 'chronic';

/** 白内障分级 LOCS III */
export interface CataractGradeLOCS3 {
  nuclear: number; // NO 0-6
  cortical: number; // C 0-5
  posteriorSubcapsular: number; // P 0-5
}

/** 糖网分级 */
export interface DrGrading {
  left: DrGrade;
  right: DrGrade;
  hasDiabeticMacularEdema: boolean;
  hasHighRisk: boolean;
}

/** 眼科检查影像 */
export interface EyeStudy {
  id: string;
  patientId: string;
  patientName: string;
  eyeSide: EyeSide;
  modality: 'fundus_photo' | 'oct' | 'ffa' | 'icga' | 'visual_field' | 'topography' | 'pentacam' | 'iol_master' | 'ubm' | 'corvis' | 'wavefront' | 'hrt' | 'gdx' | 'slit_lamp';
  studyDate: string;
  device: string;
  images: EyeImage[];
  measurements: Record<string, number>;
  report: string;
  criticalFlag: boolean;
}

/** 眼科影像引用 */
export interface EyeImage {
  id: string;
  studyId: string;
  seriesNumber: number;
  instanceNumber: number;
  url: string;
  thumbnail: string;
  description: string;
  eyeSide: EyeSide;
}

/** 眼科 EMR */
export interface OphthalmologyEmr {
  id: string;
  patientId: string;
  chiefComplaint: string;
  hpi: string;
  pastHistory: string[];
  familyHistory: string[];
  visionOd: number[];
  visionOs: number[];
  iopOd: IopRecord[];
  iopOs: IopRecord[];
  slitLamp: SlitLampRecord;
  fundus: FundusRecord;
  refraction: RefractionPrescription;
  diagnosis: string[];
  plan: string;
  createdAt: string;
  doctorName: string;
}

/** IOL 库存项目 */
export interface IolItem {
  id: string;
  manufacturer: 'Alcon' | 'Zeiss' | 'Johnson' | 'Bausch' | 'Aibo' | 'Leiming' | 'Haohai' | 'Huasha';
  model: string;
  power: number;
  sn: string;
  expiryDate: string;
  patientId?: string;
  implantDate?: string;
  surgeon?: string;
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
  scheduledDate: string;
  orRoom: string;
  status: 'scheduled' | 'pre_checked' | 'in_progress' | 'completed' | 'cancelled';
}
