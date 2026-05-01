// @ts-nocheck
// G005 放射RIS - 初始数据 v0.1.0
import type { RadiologyExam, ExamRoom, CriticalValue, Consultation, ReportTemplate, TermLibrary, DailyStatistics } from '../types'

// ============================================================
// 新增类型定义
// ============================================================

// 典型病例
interface TypicalCase {
  id: string
  patientName: string
  age: number
  gender: string
  examType: string
  examName: string
  bodyPart: string
  disease: string
  diagnosis: string
  findings: string
  impression: string
  findingsList: string[]
  tags: string[]
  teaching: boolean
  images: { thumbnail: string; description: string }[]
  annotations: { id: string; x: number; y: number; type: string; label: string; description: string }[]
  discussions: { id: string; user: string; avatar: string; content: string; time: string; likes: number; liked: boolean }[]
  likeCount: number
  viewCount: number
  createdAt: string
  createdBy: string
  status: '已审核' | '待审核' | '编辑中'
  verified: boolean
}

// 操作日志
interface OperationLog {
  id: string
  userId: string
  userName: string
  action: string
  module: string
  targetId: string
  targetDesc: string
  beforeData?: string
  afterData?: string
  timestamp: string
  ipAddress: string
  device: string
}

// 系统通知
interface SystemNotification {
  id: string
  type: string
  title: string
  content: string
  recipientId: string
  recipientName: string
  status: string
  priority?: string
  sentAt: string
  readAt?: string
  relatedId?: string
  relatedType?: string
}

// 典型征象
interface TypicalFinding {
  id: string
  bodyPart: string
  disease: string
  findingName: string
  description: string
  imageUrl: string
  insertText: string
  typicalIn: string[]
  tags: string[]
  usageCount?: number
}

// ---------- 模拟用户 ----------
export const initialUsers = [
  { id: 'R001', name: '李明辉', role: 'radiologist', department: '放射科', title: '主任医师', password: '123' },
  { id: 'R002', name: '王秀峰', role: 'radiologist', department: '放射科', title: '副主任医师', password: '123' },
  { id: 'R003', name: '张海涛', role: 'radiologist', department: '放射科', title: '主治医师', password: '123' },
  { id: 'R004', name: '刘芳', role: 'radiologist', department: '放射科', title: '主治医师', password: '123' },
  { id: 'R005', name: '刘建国', role: 'technologist', department: '放射科技师组', title: '主管技师', password: '123' },
  { id: 'R006', name: '陈小红', role: 'technologist', department: '放射科技师组', title: '技师', password: '123' },
  { id: 'R007', name: '张建军', role: 'technologist', department: '放射科技师组', title: '技师', password: '123' },
  { id: 'R008', name: '赵雪梅', role: 'admin', department: '放射科', title: '护士长', password: '123' },
]

// ---------- 检查设备 ----------
export const initialModalityDevices = [
  { id: 'DEV-CT-01', name: 'CT-1（GE Revolution CT）', modality: 'CT', manufacturer: 'GE', model: 'Revolution CT', location: 'CT室1', status: '使用中', seriesCount: 2, acquisitionStation: 'CT-Acq-01' },
  { id: 'DEV-CT-02', name: 'CT-2（西门子SOMATOM Force）', modality: 'CT', manufacturer: 'Siemens', model: 'SOMATOM Force', location: 'CT室2', status: '空闲', seriesCount: 2, acquisitionStation: 'CT-Acq-02' },
  { id: 'DEV-MR-01', name: 'MR-1（西门子MAGNETOM Vida）', modality: 'MR', manufacturer: 'Siemens', model: 'MAGNETOM Vida', location: 'MR室1', status: '使用中', seriesCount: 4, acquisitionStation: 'MR-Acq-01' },
  { id: 'DEV-MR-02', name: 'MR-2（飞利浦Ingenia）', modality: 'MR', manufacturer: 'Philips', model: 'Ingenia', location: 'MR室2', status: '维护中', seriesCount: 4, acquisitionStation: 'MR-Acq-02' },
  { id: 'DEV-DR-01', name: 'DR-1（飞利浦DigitalDiagnost）', modality: 'DR', manufacturer: 'Philips', model: 'DigitalDiagnost', location: 'DR室1', status: '使用中', seriesCount: 1, acquisitionStation: 'DR-Acq-01' },
  { id: 'DEV-DR-02', name: 'DR-2（GE Optima）', modality: 'DR', manufacturer: 'GE', model: 'Optima', location: 'DR室2', status: '空闲', seriesCount: 1, acquisitionStation: 'DR-Acq-02' },
  { id: 'DEV-DSA-01', name: 'DSA-1（飞利浦Azurion 7）', modality: 'DSA', manufacturer: 'Philips', model: 'Azurion 7', location: 'DSA室1', status: '使用中', seriesCount: 2, acquisitionStation: 'DSA-Acq-01' },
  { id: 'DEV-MG-01', name: '乳腺钼靶（GE Senographe）', modality: '乳腺钼靶', manufacturer: 'GE', model: 'Senographe', location: '钼靶室1', status: '空闲', seriesCount: 1, acquisitionStation: 'MG-Acq-01' },
  { id: 'DEV-RF-01', name: '胃肠造影（岛津Flexavision）', modality: '胃肠造影', manufacturer: 'Shimadzu', model: 'Flexavision', location: '造影室1', status: '空闲', seriesCount: 1, acquisitionStation: 'RF-Acq-01' },
]

// Aliases for pages that import these names
export { initialModalityDevices as initialDeviceMaintenance }

export const initialExamItems = [
  { id: 'EI-CT-001', name: '头颅CT平扫', modality: 'CT', bodyPart: '头颅', description: '颅脑外伤、脑血管病、肿瘤等', preparationNotes: '去除金属异物', avgDuration: 15, },
  { id: 'EI-CT-002', name: '胸部CT平扫', modality: 'CT', bodyPart: '胸部', description: '肺炎、肿瘤、结节等', preparationNotes: '屏气配合', avgDuration: 10, },
  { id: 'EI-CT-003', name: '腹部CT平扫+增强', modality: 'CT', bodyPart: '腹部', description: '肝胆胰脾肾疾病', preparationNotes: '空腹4h，增强需留置针', avgDuration: 30, },
  { id: 'EI-CT-004', name: '盆腔CT', modality: 'CT', bodyPart: '盆腔', description: '泌尿生殖系统疾病', preparationNotes: '憋尿', avgDuration: 20, },
  { id: 'EI-CT-005', name: '脊柱CT', modality: 'CT', bodyPart: '脊柱', description: '椎间盘突出、骨折', preparationNotes: '去除金属异物', avgDuration: 20, },
  { id: 'EI-CT-006', name: '冠脉CTA', modality: 'CT', bodyPart: '心脏', description: '冠心病评估', preparationNotes: '控制心率<70bpm，空腹', avgDuration: 25, },
  { id: 'EI-MR-001', name: '头颅MR平扫', modality: 'MR', bodyPart: '头颅', description: '脑肿瘤、脑血管病', preparationNotes: '去除金属异物，禁磁性植入物', avgDuration: 25, },
  { id: 'EI-MR-002', name: '腹部MR平扫+增强', modality: 'MR', bodyPart: '腹部', description: '肝胆胰脾肾肿瘤', preparationNotes: '空腹6h', avgDuration: 40, },
  { id: 'EI-MR-003', name: '腰椎MR平扫', modality: 'MR', bodyPart: '脊柱', description: '椎间盘病变', preparationNotes: '去除金属异物', avgDuration: 20, },
  { id: 'EI-DR-001', name: '胸部DR正侧位', modality: 'DR', bodyPart: '胸部', description: '肺部疾病筛查', preparationNotes: '深吸气屏气', avgDuration: 5, },
  { id: 'EI-DR-002', name: '腹部立卧位平片', modality: 'DR', bodyPart: '腹部', description: '肠梗阻、消化道穿孔', preparationNotes: '站立位或卧位', avgDuration: 5, },
  { id: 'EI-DSA-001', name: '冠脉造影', modality: 'DSA', bodyPart: '心脏', description: '冠心病诊断与治疗', preparationNotes: '局麻，穿刺股动脉或桡动脉', avgDuration: 60, },
  { id: 'EI-MG-001', name: '乳腺钼靶', modality: '乳腺钼靶', bodyPart: '胸部', description: '乳腺癌筛查', preparationNotes: '月经结束后7-10天最佳', avgDuration: 15, },
]

export const initialPatients = [
  { id: 'RAD-P001', name: '张志刚', gender: '男', age: 62, patientType: '住院', idCard: '3101011964021XXXXX', phone: '13800138001', address: '上海市浦东新区', primaryDiagnosis: '冠心病', allergyHistory: '无', },
  { id: 'RAD-P002', name: '李秀英', gender: '女', age: 55, patientType: '门诊', idCard: '3101021970021XXXXX', phone: '13800138002', address: '上海市徐汇区', primaryDiagnosis: '头痛待查', allergyHistory: '青霉素', },
  { id: 'RAD-P003', name: '王建国', gender: '男', age: 58, patientType: '体检', idCard: '3101031968011XXXXX', phone: '13800138003', address: '上海市静安区', primaryDiagnosis: '健康体检', allergyHistory: '无', },
  { id: 'RAD-P004', name: '赵晓敏', gender: '女', age: 45, patientType: '急诊', idCard: '3101041978011XXXXX', phone: '13800138004', address: '上海市杨浦区', primaryDiagnosis: '外伤后头晕', allergyHistory: '无', },
  { id: 'RAD-P005', name: '周玉芬', gender: '女', age: 52, patientType: '住院', idCard: '3101051973021XXXXX', phone: '13800138005', address: '上海市虹口区', primaryDiagnosis: '肝占位待查', allergyHistory: '碘对比剂', },
  { id: 'RAD-P006', name: '孙伟', gender: '男', age: 35, patientType: '门诊', idCard: '3101061990011XXXXX', phone: '13800138006', address: '上海市黄浦区', primaryDiagnosis: '腰痛待查', allergyHistory: '无', },
  { id: 'RAD-P007', name: '吴婷', gender: '女', age: 42, patientType: '住院', idCard: '3101071978011XXXXX', phone: '13800138007', address: '上海市普陀区', primaryDiagnosis: '冠心病三支病变', allergyHistory: '无', },
  { id: 'RAD-P008', name: '郑丽', gender: '女', age: 38, patientType: '门诊', idCard: '3101081982011XXXXX', phone: '13800138008', address: '上海市长宁区', primaryDiagnosis: '乳腺结节随访', allergyHistory: '无', },
]

// ---------- 日统计数据（必须放在引用之前） ----------
export const initialDailyStats: DailyStatistics[] = [
  { date: '2026-04-25', modality: 'CT', totalExams: 142, completedReports: 138, pendingReports: 4, criticalValues: 8, avgReportTime: 28 },
  { date: '2026-04-25', modality: 'MR', totalExams: 68, completedReports: 65, pendingReports: 3, criticalValues: 3, avgReportTime: 42 },
  { date: '2026-04-25', modality: 'DR', totalExams: 285, completedReports: 280, pendingReports: 5, criticalValues: 5, avgReportTime: 15 },
  { date: '2026-04-25', modality: 'DSA', totalExams: 12, completedReports: 12, pendingReports: 0, criticalValues: 2, avgReportTime: 65 },
  { date: '2026-04-26', modality: 'CT', totalExams: 135, completedReports: 130, pendingReports: 5, criticalValues: 6, avgReportTime: 30 },
  { date: '2026-04-26', modality: 'MR', totalExams: 72, completedReports: 70, pendingReports: 2, criticalValues: 4, avgReportTime: 40 },
  { date: '2026-04-26', modality: 'DR', totalExams: 290, completedReports: 285, pendingReports: 5, criticalValues: 7, avgReportTime: 14 },
  { date: '2026-04-27', modality: 'CT', totalExams: 150, completedReports: 145, pendingReports: 5, criticalValues: 9, avgReportTime: 26 },
  { date: '2026-04-27', modality: 'MR', totalExams: 65, completedReports: 62, pendingReports: 3, criticalValues: 2, avgReportTime: 45 },
  { date: '2026-04-27', modality: 'DR', totalExams: 275, completedReports: 270, pendingReports: 5, criticalValues: 4, avgReportTime: 16 },
  { date: '2026-04-28', modality: 'CT', totalExams: 140, completedReports: 136, pendingReports: 4, criticalValues: 7, avgReportTime: 29 },
  { date: '2026-04-28', modality: 'MR', totalExams: 70, completedReports: 68, pendingReports: 2, criticalValues: 3, avgReportTime: 41 },
  { date: '2026-04-28', modality: 'DR', totalExams: 295, completedReports: 290, pendingReports: 5, criticalValues: 6, avgReportTime: 14 },
  { date: '2026-04-29', modality: 'CT', totalExams: 98, completedReports: 95, pendingReports: 3, criticalValues: 5, avgReportTime: 32 },
  { date: '2026-04-29', modality: 'MR', totalExams: 45, completedReports: 43, pendingReports: 2, criticalValues: 1, avgReportTime: 48 },
  { date: '2026-04-29', modality: 'DR', totalExams: 180, completedReports: 178, pendingReports: 2, criticalValues: 3, avgReportTime: 18 },
  { date: '2026-04-30', modality: 'CT', totalExams: 105, completedReports: 100, pendingReports: 5, criticalValues: 6, avgReportTime: 31 },
  { date: '2026-04-30', modality: 'MR', totalExams: 50, completedReports: 48, pendingReports: 2, criticalValues: 2, avgReportTime: 44 },
  { date: '2026-04-30', modality: 'DR', totalExams: 195, completedReports: 192, pendingReports: 3, criticalValues: 4, avgReportTime: 16 },
  { date: '2026-05-01', modality: 'CT', totalExams: 85, completedReports: 50, pendingReports: 35, criticalValues: 5, avgReportTime: 0 },
  { date: '2026-05-01', modality: 'MR', totalExams: 42, completedReports: 25, pendingReports: 17, criticalValues: 2, avgReportTime: 0 },
  { date: '2026-05-01', modality: 'DR', totalExams: 120, completedReports: 75, pendingReports: 45, criticalValues: 3, avgReportTime: 0 },
]

// ---------- 综合统计对象（提供给HomePage等页面） ----------
export const initialStatisticsData = {
  today: { exams: 247, reports: 150, pending: 97, critical: 10 },
  week: { exams: 1420, reports: 980, pending: 440 },
  month: { exams: 5680, reports: 3920, pending: 1760, revenue: 8960000 },
  byModality: { CT: 2468, MR: 1240, DR: 1580, DSA: 280, '乳腺钼靶': 112 },
  avgReportTime: 28,
  criticalPending: 10,
  worklist: [
    { id: 'WL001', patientName: '张志刚', modality: 'CT', examItem: '胸部CT平扫', priority: '紧急', status: '待检查', examTime: '09:30', room: 'CT室1' },
    { id: 'WL002', patientName: '李秀英', modality: 'MR', examItem: '头颅MR平扫', priority: '普通', status: '待报告', examTime: '09:00', room: 'MR室1' },
    { id: 'WL003', patientName: '王建国', modality: 'DR', examItem: '胸部DR正侧位', priority: '普通', status: '待登记', examTime: '10:00', room: 'DR室1' },
    { id: 'WL004', patientName: '赵晓敏', modality: 'CT', examItem: '冠脉CTA', priority: '危重', status: '待检查', examTime: '08:30', room: 'CT室1' },
    { id: 'WL005', patientName: '周玉芬', modality: 'DSA', examItem: '冠脉造影', priority: '紧急', status: '检查中', examTime: '08:00', room: 'DSA室1' },
  ],
}

export const initialWorkloadStats = initialDailyStats

// Aliases（引用必须在 initialDailyStats 定义之后）
export { initialRadiologyExams as initialRadiologyReports }

export const initialDoctorSchedules = [
  { id: 'SCH001', doctorId: 'R001', doctorName: '李明辉', department: '放射科', date: '2026-05-01', timeSlot: '上午', modality: 'CT', room: 'CT室1', status: '上班' },
  { id: 'SCH002', doctorId: 'R002', doctorName: '王秀峰', department: '放射科', date: '2026-05-01', timeSlot: '上午', modality: 'MR', room: 'MR室1', status: '上班' },
  { id: 'SCH003', doctorId: 'R003', doctorName: '张海涛', department: '放射科', date: '2026-05-01', timeSlot: '全天', modality: 'CT', room: 'CT室1', status: '上班' },
  { id: 'SCH004', doctorId: 'R004', doctorName: '刘芳', department: '放射科', date: '2026-05-01', timeSlot: '下午', modality: 'MR', room: 'MR室1', status: '上班' },
  { id: 'SCH005', doctorId: 'R001', doctorName: '李明辉', department: '放射科', date: '2026-05-02', timeSlot: '上午', modality: 'CT', room: 'CT室1', status: '上班' },
]

// ---------- 检查室 ----------
export const initialExamRooms: ExamRoom[] = [
  { id: 'ROOM-CT1', name: 'CT室1', roomNumber: 'CT室1', modality: ['CT'], deviceId: 'DEV-CT-01', deviceName: 'CT-1（GE Revolution CT）', status: '使用中', currentPatient: '张志刚', todaysBookings: 62 },
  { id: 'ROOM-CT2', name: 'CT室2', roomNumber: 'CT室2', modality: ['CT'], deviceId: 'DEV-CT-02', deviceName: 'CT-2（西门子SOMATOM Force）', status: '空闲', todaysBookings: 45 },
  { id: 'ROOM-MR1', name: 'MR室1', roomNumber: 'MR室1', modality: ['MR'], deviceId: 'DEV-MR-01', deviceName: 'MR-1（西门子MAGNETOM Vida）', status: '使用中', currentPatient: '李秀英', todaysBookings: 32 },
  { id: 'ROOM-MR2', name: 'MR室2', roomNumber: 'MR室2', modality: ['MR'], deviceId: 'DEV-MR-02', deviceName: 'MR-2（飞利浦Ingenia）', status: '维护中', todaysBookings: 0 },
  { id: 'ROOM-DR1', name: 'DR室1', roomNumber: 'DR室1', modality: ['DR'], deviceId: 'DEV-DR-01', deviceName: 'DR-1（飞利浦DigitalDiagnost）', status: '使用中', currentPatient: '王建国', todaysBookings: 98 },
  { id: 'ROOM-DR2', name: 'DR室2', roomNumber: 'DR室2', modality: ['DR'], deviceId: 'DEV-DR-02', deviceName: 'DR-2（GE Optima）', status: '空闲', todaysBookings: 75 },
  { id: 'ROOM-DSA1', name: 'DSA室1', roomNumber: 'DSA室1', modality: ['DSA'], deviceId: 'DEV-DSA-01', deviceName: 'DSA-1（飞利浦Azurion 7）', status: '使用中', currentPatient: '周玉芬', todaysBookings: 8 },
  { id: 'ROOM-MG1', name: '钼靶室1', roomNumber: '钼靶室1', modality: ['乳腺钼靶'], deviceId: 'DEV-MG-01', deviceName: '乳腺钼靶（GE Senographe）', status: '空闲', todaysBookings: 12 },
  { id: 'ROOM-RF1', name: '造影室1', roomNumber: '造影室1', modality: ['胃肠造影'], deviceId: 'DEV-RF-01', deviceName: '胃肠造影（岛津Flexavision）', status: '空闲', todaysBookings: 10 },
]

// ---------- 放射检查记录 ----------
export const initialRadiologyExams: RadiologyExam[] = [
  { id: 'RAD-EX001', patientId: 'RAD-P001', patientName: '张志刚', gender: '男', age: 62, patientType: '住院', examItemId: 'EI-CT-006', examItemName: '冠脉CTA', modality: 'CT', bodyPart: '心脏', examDate: '2026-05-01', examTime: '09:30', priority: '紧急', clinicalDiagnosis: '冠心病待查', clinicalHistory: '反复胸闷胸痛2月余', examIndications: '评估冠脉狭窄程度', relevantLabResults: 'LDL-C 3.8mmol/L', technologistId: 'R005', technologistName: '刘建国', deviceId: 'DEV-CT-01', deviceName: 'CT-1（GE Revolution CT）', roomId: 'ROOM-CT1', roomName: 'CT室1', status: '检查中', accessionNumber: '20260501001', imagesAcquired: 256, createdTime: '2026-05-01 08:00', updatedTime: '2026-05-01 09:30' },
  { id: 'RAD-EX002', patientId: 'RAD-P002', patientName: '李秀英', gender: '女', age: 55, patientType: '门诊', examItemId: 'EI-MR-001', examItemName: '头颅MR平扫', modality: 'MR', bodyPart: '头颅', examDate: '2026-05-01', examTime: '10:00', priority: '普通', clinicalDiagnosis: '头痛待查', clinicalHistory: '反复头痛3月', examIndications: '排除颅内病变', technologistId: 'R005', technologistName: '刘建国', deviceId: 'DEV-MR-01', deviceName: 'MR-1（西门子MAGNETOM Vida）', roomId: 'ROOM-MR1', roomName: 'MR室1', status: '待报告', accessionNumber: '20260501002', imagesAcquired: 1200, createdTime: '2026-05-01 09:00', updatedTime: '2026-05-01 10:00' },
  { id: 'RAD-EX003', patientId: 'RAD-P003', patientName: '王建国', gender: '男', age: 58, patientType: '体检', examItemId: 'EI-DR-001', examItemName: '胸部DR正侧位', modality: 'DR', bodyPart: '胸部', examDate: '2026-05-01', examTime: '11:00', priority: '普通', clinicalDiagnosis: '健康体检', clinicalHistory: '年度体检', examIndications: '胸部影像学筛查', technologistId: 'R006', technologistName: '陈小红', deviceId: 'DEV-DR-01', deviceName: 'DR-1（飞利浦DigitalDiagnost）', roomId: 'ROOM-DR1', roomName: 'DR室1', status: '待报告', accessionNumber: '20260501003', imagesAcquired: 2, createdTime: '2026-05-01 10:00', updatedTime: '2026-05-01 11:00' },
  { id: 'RAD-EX004', patientId: 'RAD-P004', patientName: '赵晓敏', gender: '女', age: 45, patientType: '急诊', examItemId: 'EI-CT-001', examItemName: '头颅CT平扫', modality: 'CT', bodyPart: '头颅', examDate: '2026-05-01', examTime: '12:00', priority: '紧急', clinicalDiagnosis: '外伤后头晕', clinicalHistory: '车祸外伤2小时', examIndications: '排除颅内出血', technologistId: 'R005', technologistName: '刘建国', deviceId: 'DEV-CT-01', deviceName: 'CT-1（GE Revolution CT）', roomId: 'ROOM-CT1', roomName: 'CT室1', status: '待报告', accessionNumber: '20260501004', imagesAcquired: 64, createdTime: '2026-05-01 11:30', updatedTime: '2026-05-01 12:00' },
  { id: 'RAD-EX005', patientId: 'RAD-P005', patientName: '周玉芬', gender: '女', age: 52, patientType: '住院', examItemId: 'EI-CT-003', examItemName: '腹部CT平扫+增强', modality: 'CT', bodyPart: '腹部', examDate: '2026-05-01', examTime: '14:00', priority: '普通', clinicalDiagnosis: '肝占位待查', clinicalHistory: '体检发现肝占位', examIndications: '肝脏肿瘤评估', technologistId: 'R005', technologistName: '刘建国', deviceId: 'DEV-CT-02', deviceName: 'CT-2（西门子SOMATOM Force）', roomId: 'ROOM-CT2', roomName: 'CT室2', status: '已预约', accessionNumber: '20260501005', imagesAcquired: 0, createdTime: '2026-05-01 13:00', updatedTime: '2026-05-01 13:00' },
  { id: 'RAD-EX006', patientId: 'RAD-P006', patientName: '孙伟', gender: '男', age: 35, patientType: '门诊', examItemId: 'EI-MR-003', examItemName: '腰椎MR平扫', modality: 'MR', bodyPart: '脊柱', examDate: '2026-05-01', examTime: '15:00', priority: '普通', clinicalDiagnosis: '腰痛待查', clinicalHistory: '反复腰痛半年', examIndications: '椎间盘病变评估', technologistId: 'R005', technologistName: '刘建国', deviceId: 'DEV-MR-01', deviceName: 'MR-1（西门子MAGNETOM Vida）', roomId: 'ROOM-MR1', roomName: 'MR室1', status: '已预约', accessionNumber: '20260501006', imagesAcquired: 0, createdTime: '2026-05-01 14:00', updatedTime: '2026-05-01 14:00' },
  { id: 'RAD-EX007', patientId: 'RAD-P007', patientName: '吴婷', gender: '女', age: 42, patientType: '住院', examItemId: 'EI-DSA-001', examItemName: '冠脉造影', modality: 'DSA', bodyPart: '心脏', examDate: '2026-05-01', examTime: '16:00', priority: '紧急', clinicalDiagnosis: '冠心病三支病变', clinicalHistory: '冠脉CTA示三支病变', examIndications: '支架治疗前评估', technologistId: 'R007', technologistName: '张建军', deviceId: 'DEV-DSA-01', deviceName: 'DSA-1（飞利浦Azurion 7）', roomId: 'ROOM-DSA1', roomName: 'DSA室1', status: '已预约', accessionNumber: '20260501007', imagesAcquired: 0, createdTime: '2026-05-01 15:00', updatedTime: '2026-05-01 15:00' },
  { id: 'RAD-EX008', patientId: 'RAD-P008', patientName: '郑丽', gender: '女', age: 38, patientType: '门诊', examItemId: 'EI-MG-001', examItemName: '乳腺钼靶', modality: '乳腺钼靶', bodyPart: '胸部', examDate: '2026-05-01', examTime: '10:00', priority: '普通', clinicalDiagnosis: '乳腺结节随访', clinicalHistory: '乳腺钼靶筛查', examIndications: '乳腺癌筛查', technologistId: 'R006', technologistName: '陈小红', deviceId: 'DEV-MG-01', deviceName: '乳腺钼靶（GE Senographe）', roomId: 'ROOM-MG1', roomName: '钼靶室1', status: '已完成', accessionNumber: '20260501008', imagesAcquired: 4, createdTime: '2026-05-01 09:00', updatedTime: '2026-05-01 10:00' },
]

// ---------- 危急值 ----------
export const initialCriticalValues: CriticalValue[] = [
  { id: 'CV001', reportId: 'RAD-RPT003', examId: 'RAD-EX004', patientId: 'RAD-P004', patientName: '赵晓敏', modality: 'CT', examItemName: '头颅CT平扫', criticalFinding: 'true', findingDetails: '右侧颞叶团块状高密度影，大小约3.5×2.8cm，周围大片低密度水肿带，脑中线结构左偏约8mm。左侧额颞顶部硬膜下血肿。', severity: '危急', reportedBy: 'R003', reportedByName: '张海涛', reportedTime: '2026-05-01 12:30', receivingDoctorId: 'R001', receivingDoctorName: '李明辉', receivingTime: '2026-05-01 12:35', acknowledged: false, status: '已接收' },
  { id: 'CV002', reportId: 'RAD-RPT005', examId: 'RAD-EX001', patientId: 'RAD-P001', patientName: '张志刚', modality: 'CT', examItemName: '冠脉CTA', criticalFinding: 'true', findingDetails: '左主干开口狭窄约85%，前降支近段狭窄约90%，回旋支近段狭窄约75%，右冠近段狭窄约80%。', severity: '危急', reportedBy: 'R003', reportedByName: '张海涛', reportedTime: '2026-05-01 10:30', receivingDoctorId: 'R002', receivingDoctorName: '王秀峰', receivingTime: '2026-05-01 10:35', acknowledged: false, status: '已接收' },
  { id: 'CV003', reportId: 'RAD-RPT006', examId: 'RAD-EX002', patientId: 'RAD-P002', patientName: '李秀英', modality: 'MR', examItemName: '头颅MR平扫', criticalFinding: 'true', findingDetails: '右侧额叶见约2.1×1.8cm异常信号，T1WI等信号，T2WI高信号，增强扫描明显强化，周围水肿。考虑转移瘤。', severity: '危急', reportedBy: 'R004', reportedByName: '刘芳', reportedTime: '2026-05-01 11:30', receivingDoctorId: 'R001', receivingDoctorName: '李明辉', receivingTime: '2026-05-01 11:40', acknowledged: false, status: '已接收' },
  { id: 'CV004', reportId: 'RAD-RPT007', examId: 'RAD-EX003', patientId: 'RAD-P003', patientName: '王建国', modality: 'DR', examItemName: '胸部DR正侧位', criticalFinding: 'true', findingDetails: '左肺门区见约3.5cm团块影，右肺中野外带见约1.2cm结节影。建议CT进一步检查。', severity: '高危', reportedBy: 'R003', reportedByName: '张海涛', reportedTime: '2026-05-01 11:20', receivingDoctorId: 'R002', receivingDoctorName: '王秀峰', receivingTime: '2026-05-01 11:30', acknowledged: false, status: '已通知' },
]

// ---------- 会诊 ----------
export const initialConsultations: Consultation[] = [
  { id: 'CONS001', patientId: 'RAD-P001', patientName: '张志刚', modality: 'CT', examItemName: '冠脉CTA', consultationType: 'MDT', requestingDepartment: '心内科', requestingDoctorId: 'R001', requestingDoctorName: '李明辉', consultedDepartment: '放射科', consultedDoctorId: 'R003', consultedDoctorName: '张海涛', requestReason: '冠脉CTA示三支病变，申请MDT讨论治疗方案', status: '已回复', isRemote: true, requestTime: '2026-05-01 10:45', responseTime: '2026-05-01 14:30', responseContent: '建议行CAG+PCI治疗，优先处理左主干及前降支病变。', reportId: 'RAD-RPT005', examId: 'RAD-EX001' },
  { id: 'CONS002', patientId: 'RAD-P002', patientName: '李秀英', modality: 'MR', examItemName: '头颅MR平扫', consultationType: '疑难病例', requestingDepartment: '神经内科', requestingDoctorId: 'R002', requestingDoctorName: '王秀峰', consultedDepartment: '放射科', consultedDoctorId: 'R004', consultedDoctorName: '刘芳', requestReason: '头颅MR示右额叶占位，申请放射科会诊明确诊断', status: '待回复', isRemote: false, requestTime: '2026-05-01 12:00', responseTime: '', responseContent: '', reportId: 'RAD-RPT006', examId: 'RAD-EX002' },
  { id: 'CONS003', patientId: 'RAD-P004', patientName: '赵晓敏', modality: 'CT', examItemName: '头颅CT平扫', consultationType: '远程会诊', requestingDepartment: '急诊科', requestingDoctorId: 'R001', requestingDoctorName: '李明辉', consultedDepartment: '神经外科', consultedDoctorId: '', consultedDoctorName: '待指定', requestReason: '外伤后颅内出血，申请神经外科紧急会诊', status: '已回复', isRemote: true, requestTime: '2026-05-01 12:35', responseTime: '2026-05-01 12:50', responseContent: '建议急诊开颅血肿清除术，患者已转神经外科。', reportId: 'RAD-RPT003', examId: 'RAD-EX004' },
]

// ---------- 报告模板 ----------
export const initialReportTemplates: ReportTemplate[] = [
  { id: 'TPL-CT-HEAD', name: '头颅CT平扫模板', category: 'CT平扫', modality: 'CT', bodyPart: '头颅', level: 'default', content: '颅内各层扫描：\n脑实质密度均匀，未见异常密度影。\n脑室系统形态正常，无扩张或受压改变。\n中线结构居中，无偏移。\n小脑及脑干形态正常。\n颅骨骨质完整，无骨折征象。\n\n结论：颅内CT平扫未见明显异常。', createdBy: 'R003', updatedAt: '2026-01-15' },
  { id: 'TPL-CT-CHEST', name: '胸部CT平扫模板', category: 'CT平扫', modality: 'CT', bodyPart: '胸部', level: 'default', content: '胸廓对称，纵隔居中。\n双肺纹理清晰，双肺野见散在少许索条影。\n双肺门结构正常。\n纵隔内未见明显肿大淋巴结。\n心脏形态正常。\n胸腔未见积液。\n\n结论：胸部CT平扫未见明显异常。', createdBy: 'R003', updatedAt: '2026-01-15' },
  { id: 'TPL-MR-HEAD', name: '头颅MR平扫模板', category: 'MR平扫', modality: 'MR', bodyPart: '头颅', level: 'default', content: 'T1WI、T2WI、FLAIR及DWI序列扫描：\n脑实质内未见异常信号影。\n脑室系统形态正常，脑沟、裂、池未见增宽或变窄。\n中线结构居中。\n小脑及脑干形态及信号正常。\n\n结论：颅脑MR平扫未见明显异常。', createdBy: 'R004', updatedAt: '2026-01-15' },
  { id: 'TPL-DR-CHEST', name: '胸部DR正侧位模板', category: 'DR投照', modality: 'DR', bodyPart: '胸部', level: 'default', content: '胸廓对称，肋骨及胸壁软组织未见异常。\n双肺野透亮度正常，肺纹理清晰。\n双肺门无增大。\n纵隔居中，无增宽。\n心影形态大小正常。\n双侧膈面光滑，肋膈角锐利。\n\n结论：胸部正侧位片未见明显异常。', createdBy: 'R003', updatedAt: '2026-01-15' },
  { id: 'TPL-CT-ABD', name: '腹部CT平扫模板', category: 'CT平扫', modality: 'CT', bodyPart: '腹部', level: 'dept', content: '肝脏大小形态正常，肝实质密度均匀，未见异常密度影。\n肝内外胆管无扩张。\n脾脏形态密度正常。\n胰腺形态正常，胰管无扩张。\n双肾形态大小正常，皮髓质分界清。\n腹膜后未见肿大淋巴结。\n腹腔未见积液。\n\n结论：腹部CT平扫未见明显异常。', createdBy: 'R003', updatedAt: '2026-02-10' },
]

// ---------- 报告词库 ----------
export const initialTermLibrary: TermLibrary[] = [
  { id: 'TERM001', category: 'CT描述', term: '未见异常密度影', count: 1250, standardReport: '脑实质密度均匀，未见异常密度影。' },
  { id: 'TERM002', category: 'CT描述', term: '脑室系统正常', count: 1180, standardReport: '脑室系统形态正常，无扩张或受压改变。' },
  { id: 'TERM003', category: 'CT描述', term: '中线结构居中', count: 1100, standardReport: '中线结构居中，无偏移。' },
  { id: 'TERM004', category: 'CT描述', term: '未见骨折', count: 980, standardReport: '颅骨/肋骨/椎体骨质完整，无骨折征象。' },
  { id: 'TERM005', category: 'CT描述', term: '肺纹理增粗', count: 860, standardReport: '双肺纹理增粗，排列紊乱。' },
  { id: 'TERM006', category: 'CT描述', term: '占位性病变', count: 720, standardReport: '可见团块状异常密度影，边界不清，周围组织受压推移。' },
  { id: 'TERM007', category: 'MR描述', term: '未见异常信号', count: 1050, standardReport: '脑实质内未见异常信号影。' },
  { id: 'TERM008', category: 'MR描述', term: 'DWI受限', count: 680, standardReport: 'DWI序列呈高信号，相应ADC值降低。' },
  { id: 'TERM009', category: '结论术语', term: '未见明显异常', count: 2200, standardReport: '结论：XX检查未见明显异常。' },
  { id: 'TERM010', category: '结论术语', term: '建议随访', count: 1350, standardReport: '结论：建议定期随访复查。' },
  { id: 'TERM011', category: '结论术语', term: '危急值', count: 320, standardReport: '结论：危急值，已电话通知临床科室。' },
  { id: 'TERM012', category: '急诊模板', term: '主动脉夹层', count: 85, standardReport: '升主动脉及降主动脉可见线样低密度影分隔管腔，考虑主动脉夹层，建议CTA进一步检查。' },
  { id: 'TERM013', category: '急诊模板', term: '肺栓塞', count: 62, standardReport: '双肺动脉主干及分支可见充盈缺损，考虑肺动脉栓塞。' },
  { id: 'TERM014', category: '急诊模板', term: '脑出血', count: 410, standardReport: '颅内可见团块状高密度影，周围可见低密度水肿带，中线结构偏移。' },
  { id: 'TERM015', category: '肿瘤评估', term: 'RECIST标准', count: 280, standardReport: '靶病灶：XX，最大直径XXmm。非靶病灶：XX。总体疗效评估：SD/PR/CR/PD。' },
]