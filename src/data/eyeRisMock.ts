/** G005 眼科 RIS Mock 数据 v3.0.6.8-20 */
import type { VisionRecord, IopRecord, RefractionPrescription, SurgeryAppointment, OphthalmologyEmr } from '../types/eye';

const NOW = Date.now();

export const MOCK_VISION: VisionRecord[] = [
  { od: 0.5, os: 0.4, notation: 'decimal', type: 'ucva', distance: 'far' },
  { od: 1.0, os: 0.8, notation: 'decimal', type: 'bcva', distance: 'far' },
  { od: 0.8, os: 0.6, notation: 'decimal', type: 'phva', distance: 'far' },
  { od: 0.3, os: 0.25, notation: 'decimal', type: 'ucva', distance: 'near' },
];

export const MOCK_IOP: IopRecord[] = [
  { od: 18, os: 19, device: 'nct', timestamp: new Date(NOW - 86400000).toISOString() },
  { od: 22, os: 24, device: 'goldmann', timestamp: new Date(NOW - 3600000).toISOString() },
];

export const MOCK_REFRACTION: RefractionPrescription = {
  od: { sph: -2.50, cyl: -0.75, axis: 180, add: 1.50, va: 1.0 },
  os: { sph: -2.00, cyl: -0.50, axis: 175, add: 1.50, va: 1.0 },
  pd: 64,
  ph: 2,
};

export const MOCK_SURGERY_APPOINTMENTS: SurgeryAppointment[] = [
  { id: 'sa-001', patientId: 'p-1005', patientName: '陈丽', procedure: '右眼白内障Phaco+IOL植入', eyeSide: 'OD', surgeonId: 'dr-001', surgeonName: '张明远', scheduledDate: new Date(NOW + 86400000 * 14).toISOString(), orRoom: 'OR-3', status: 'scheduled' },
  { id: 'sa-002', patientId: 'p-1002', patientName: '王芳', procedure: '左眼25G PPV+PRP', eyeSide: 'OS', surgeonId: 'dr-001', surgeonName: '张明远', scheduledDate: new Date(NOW + 86400000 * 21).toISOString(), orRoom: 'OR-3', status: 'scheduled' },
  { id: 'sa-003', patientId: 'p-1003', patientName: '赵刚', procedure: '右眼抗VEGF注射（康柏西普）', eyeSide: 'OD', surgeonId: 'dr-002', surgeonName: '李思源', scheduledDate: new Date(NOW + 86400000 * 3).toISOString(), orRoom: '治疗室', status: 'pre_checked' },
];

export const MOCK_EMR: OphthalmologyEmr = {
  id: 'emr-001',
  patientId: 'p-1001',
  chiefComplaint: '右眼视物模糊1周',
  hpi: '患者1周前无明显诱因出现右眼视物模糊，无眼红眼痛，无眼前黑影飘动。既往有2型糖尿病史5年，血糖控制尚可。',
  pastHistory: ['2型糖尿病5年', '否认高血压', '否认外伤史', '否认手术史'],
  familyHistory: ['父亲有糖尿病史', '母亲有青光眼史'],
  visionOd: [0.5, 1.0, 0.8],
  visionOs: [0.4, 0.8, 0.6],
  iopOd: [{ od: 18, os: 19, device: 'nct', timestamp: new Date(NOW - 86400000).toISOString() }],
  iopOs: [{ od: 18, os: 19, device: 'nct', timestamp: new Date(NOW - 86400000).toISOString() }],
  slitLamp: { lid: '(-)', conjunctiva: '轻度充血', cornea: '透明,角膜内皮(-)', anteriorChamber: '深度可,Tyndall(-)', iris: '纹理清,无新生血管', pupil: '圆,直径3mm,对光反射灵敏', lens: '核性混浊(NO2)' },
  fundus: { disc: '边界清,C/D 0.4', macula: '中心凹反射可见', vessel: 'A/V 1:2,轻度动脉硬化', periphery: '视网膜未见异常' },
  refraction: MOCK_REFRACTION,
  diagnosis: ['右眼老年性白内障(NO2)', '右眼2型糖尿病视网膜病变(非增殖期)', '双眼屈光不正'],
  plan: '建议控制血糖,择期右眼白内障手术,3月后复查眼底。',
  createdAt: new Date(NOW - 86400000 * 3).toISOString(),
  doctorName: '张明远',
};
