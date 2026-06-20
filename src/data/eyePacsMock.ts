/** G005 眼科 PACS Mock 数据 v3.0.6.8-20 */
import type { EyeStudy } from '../types/eye';

const NOW = Date.now();

export const MOCK_EYE_STUDIES: EyeStudy[] = [
  {
    id: 'es-001',
    patientId: 'p-1001',
    patientName: '李明',
    eyeSide: 'OD',
    modality: 'fundus_photo',
    studyDate: new Date(NOW - 86400000 * 3).toISOString(),
    device: 'Topcon TRC-NW400',
    images: [
      { id: 'ei-001', studyId: 'es-001', seriesNumber: 1, instanceNumber: 1, url: '/mock/eye/fundus-od-1.jpg', thumbnail: '/mock/eye/fundus-od-1-thumb.jpg', description: '右眼后极部', eyeSide: 'OD' },
      { id: 'ei-002', studyId: 'es-001', seriesNumber: 1, instanceNumber: 2, url: '/mock/eye/fundus-od-2.jpg', thumbnail: '/mock/eye/fundus-od-2-thumb.jpg', description: '右眼黄斑', eyeSide: 'OD' },
    ],
    measurements: { cdRatio: 0.4, rimWidth: 0.25 },
    report: '右眼视盘边界清晰,C/D 约 0.4,黄斑中心凹反射可见,周边视网膜未见异常。',
    criticalFlag: false,
  },
  {
    id: 'es-002',
    patientId: 'p-1001',
    patientName: '李明',
    eyeSide: 'OD',
    modality: 'oct',
    studyDate: new Date(NOW - 86400000 * 3).toISOString(),
    device: 'Zeiss Cirrus HD-OCT 5000',
    images: [
      { id: 'ei-003', studyId: 'es-002', seriesNumber: 1, instanceNumber: 1, url: '/mock/eye/oct-od-1.jpg', thumbnail: '/mock/eye/oct-od-1-thumb.jpg', description: 'OCT 黄斑五线扫描', eyeSide: 'OD' },
    ],
    measurements: {
      centralRetinalThickness: 268,
      avgRnfThickness: 92,
      rimArea: 1.35,
    },
    report: '右眼黄斑中心凹形态可,椭圆体带连续,视网膜各层清晰。RNFL 平均厚度 92μm。',
    criticalFlag: false,
  },
  {
    id: 'es-003',
    patientId: 'p-1002',
    patientName: '王芳',
    eyeSide: 'OS',
    modality: 'visual_field',
    studyDate: new Date(NOW - 86400000 * 7).toISOString(),
    device: 'Zeiss Humphrey HFA3 24-2',
    images: [],
    measurements: { md: -8.32, psd: 7.85, vfi: 68 },
    report: '左眼上方鼻侧阶梯状暗点,MD -8.32 dB,PSD 7.85 dB,VFI 68%。',
    criticalFlag: false,
  },
  {
    id: 'es-004',
    patientId: 'p-1003',
    patientName: '赵刚',
    eyeSide: 'OD',
    modality: 'ffa',
    studyDate: new Date(NOW - 86400000 * 1).toISOString(),
    device: 'Heidelberg Spectralis HRA+OCT',
    images: [
      { id: 'ei-004', studyId: 'es-004', seriesNumber: 1, instanceNumber: 1, url: '/mock/eye/ffa-od-early.jpg', thumbnail: '/mock/eye/ffa-od-early-thumb.jpg', description: '右眼 FFA 动脉期', eyeSide: 'OD' },
      { id: 'ei-005', studyId: 'es-004', seriesNumber: 1, instanceNumber: 5, url: '/mock/eye/ffa-od-late.jpg', thumbnail: '/mock/eye/ffa-od-late-thumb.jpg', description: '右眼 FFA 晚期', eyeSide: 'OD' },
    ],
    measurements: { arteriovenousTime: 14 },
    report: '右眼 FFA:动脉期可见颞上象限微动脉瘤(>20个),晚期可见黄斑区荧光渗漏。',
    criticalFlag: true,
  },
  {
    id: 'es-005',
    patientId: 'p-1004',
    patientName: '刘洋',
    eyeSide: 'OU',
    modality: 'pentacam',
    studyDate: new Date(NOW - 86400000 * 30).toISOString(),
    device: 'Oculus Pentacam HR',
    images: [],
    measurements: { k1: 42.5, k2: 44.8, km: 43.65, tct: 532, wtw: 11.8 },
    report: '双眼角膜形态正常,K1/K2 对称,最薄点厚度 532μm,BAD 筛查阴性。',
    criticalFlag: false,
  },
];

export const MOCK_EYE_PATIENTS = [
  { id: 'p-1001', name: '李明', gender: '男', age: 58, lastVisit: new Date(NOW - 86400000 * 3).toISOString() },
  { id: 'p-1002', name: '王芳', gender: '女', age: 65, lastVisit: new Date(NOW - 86400000 * 7).toISOString() },
  { id: 'p-1003', name: '赵刚', gender: '男', age: 52, lastVisit: new Date(NOW - 86400000 * 1).toISOString() },
  { id: 'p-1004', name: '刘洋', gender: '女', age: 34, lastVisit: new Date(NOW - 86400000 * 30).toISOString() },
  { id: 'p-1005', name: '陈丽', gender: '女', age: 72, lastVisit: new Date(NOW - 86400000 * 14).toISOString() },
  { id: 'p-1006', name: '张强', gender: '男', age: 45, lastVisit: new Date(NOW - 86400000 * 2).toISOString() },
];
