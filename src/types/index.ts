// ============================================================
// G005 放射科RIS系统 - 类型定义 v0.1.0
// 整合东软/联影/GE/锐科/岱嘉五大竞品优秀功能
// ============================================================

// ---------- 基础枚举 ----------
export type Gender = '男' | '女' | '其他';
export type PatientType = '门诊' | '住院' | '体检' | '急诊';
export type ExamStatus = '待登记' | '已登记' | '待检查' | '检查中' | '待报告' | '已报告' | '已发布' | '已取消' | '检查异常';
export type ReportStatus = '未开始' | '书写中' | '待审核' | '已审核' | '已发布' | '已驳回';
export type ModalityType = 'CT' | 'MR' | 'DR' | 'DSA' | 'CR' | 'MG' | 'RF' | 'US' | 'PET-CT' | 'SPECT' | '乳腺钼靶' | '胃肠造影';
export type BodyPart = '头颅' | '颈部' | '胸部' | '腹部' | '盆腔' | '脊柱' | '四肢' | '心脏' | '血管' | '全身';
export type Priority = '普通' | '紧急' | '危重' | '会诊';
export type UserRole = '医生' | '技师' | '护士' | '管理员' | '主任';

// ---------- 用户 ----------
export interface User {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  phone: string;
  username: string;
  password?: string;
  title?: string;        // 职称：主任医师/副主任医师/主治医师/住院医师
  specialty?: string;    // 专业：CT/MR/DSA/DR
}

// ---------- 患者 ----------
export interface Patient {
  id: string;
  name: string;
  gender: Gender;
  age: number;
  phone: string;
  idCard: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  patientType: PatientType;
  allergyHistory: string;
  medicalHistory: string;
  registrationDate: string;
  lastExamDate?: string;
  totalExamCount: number;
  insuranceType?: string;   // 医保类型
  bedNumber?: string;        // 床位号（住院）
  attendingDoctor?: string;  // 主治医师
}

// ---------- 检查项目 ----------
export interface ExamItem {
  id: string;
  code: string;
  name: string;
  modality: ModalityType;
  bodyPart: BodyPart;
  price: number;
  preparationInstructions?: string;  // 检查前准备
  duration: number;                 // 预计检查时长（分钟）
  isActive: boolean;
}

// ---------- 放射检查 ----------
export interface RadiologyExam {
  id: string;
  patientId: string;
  patientName: string;
  gender: Gender;
  age: number;
  patientType: PatientType;
  examItemId: string;
  examItemName: string;
  modality: ModalityType;
  bodyPart: BodyPart;
  examDate: string;
  examTime?: string;
  scheduledTime?: string;
  priority: Priority;
  clinicalDiagnosis?: string;
  clinicalHistory?: string;
  examIndications?: string;
  relevantLabResults?: string;
  priorImagingSummary?: string;
  technologistId?: string;
  technologistName?: string;
  radiologistId?: string;
  radiologistName?: string;
  deviceId?: string;
  deviceName?: string;
  roomId?: string;
  roomName?: string;
  status: ExamStatus;
  findings?: string;
  diagnosis?: string;
  impression?: string;       // 诊断印象（结构化）
  comparisonWithPrior?: string;
  recommendations?: string;
  criticalFinding?: boolean;
  criticalFindingDetails?: string;
  reportId?: string;
  reportTime?: string;
  publishedTime?: string;
  imagesAcquired: number;
  accessionNumber: string;   // 检验 accession 号（核心DICOM字段）
  studyInstanceUID?: string;  // DICOM Study Instance UID
  createdTime: string;
  updatedTime: string;
}

// ---------- 放射报告 ----------
export interface RadiologyReport {
  id: string;
  reportId: string;
  examId: string;
  accessionNumber: string;
  patientId: string;
  patientName: string;
  gender: Gender;
  age: number;
  patientType: PatientType;
  examItemName: string;
  modality: ModalityType;
  bodyPart: BodyPart;
  examDate: string;
  deviceName?: string;
  clinicalHistory?: string;
  examFindings: string;      // 检查所见
  diagnosis: string;         // 诊断意见
  impression: string;        // 印象
  recommendations?: string;  // 建议
  comparisonWithPrior?: string;
  criticalFinding: boolean;
  criticalFindingDetails?: string;
  qualityScore?: number;     // 报告质量评分 0-100
  templateId?: string;
  templateName?: string;
  reportDoctorId?: string;
  reportDoctorName?: string;
  signedTime?: string;
  reportVerificationCode?: string;  // 电子签名验证码
  auditorId?: string;
  auditorName?: string;
  approvedTime?: string;
  auditVerificationCode?: string;
  auditSuggestion?: string;
  status: ReportStatus;
  isPreliminary: boolean;    // 是否为初稿
  isAddendum: boolean;       // 是否为补充报告
  addendumReportId?: string; // 补充报告关联ID
  publishedTime?: string;
  publishedBy?: string;
  createdTime: string;
  updatedTime: string;
}

// ---------- 报告模板 ----------
export interface ReportTemplate {
  id: string;
  name: string;
  category: string;        // 模板分类：CT/MR/DR/DSA/钼靶/胃肠
  modality: ModalityType;
  bodyPart: BodyPart;
  level: 'default' | 'dept' | 'personal';
  content: string;
  sections?: TemplateSection[];
  createdBy: string;
  usageCount: number;
  isActive: boolean;
  isFavorite?: boolean;
}

export interface TemplateSection {
  title: string;
  content: string;
  order: number;
}

// ---------- 设备/仪器 ----------
export interface ModalityDevice {
  id: string;
  name: string;
  manufacturer: string;     // 厂商
  model: string;           // 型号
  serialNumber?: string;
  modality: ModalityType;
  department: string;
  roomNumber?: string;
  status: '空闲' | '使用中' | '维护中' | '维修中' | '已报废';
  acquisitionYear?: number;
  dailyCapacity?: number;   // 日最大检查量
  currentLoad?: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  notes?: string;
}

// ---------- 检查室 ----------
export interface ExamRoom {
  id: string;
  name: string;
  roomNumber: string;
  modality: ModalityType[];
  deviceId?: string;
  deviceName?: string;
  status: '空闲' | '使用中' | '维护中';
  currentPatient?: string;
  todaysBookings?: number;
}

// ---------- 预约 ----------
export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  gender: Gender;
  age: number;
  patientType: PatientType;
  examItemId: string;
  examItemName: string;
  modality: ModalityType;
  appointmentDate: string;
  appointmentTime: string;
  deviceId?: string;
  deviceName?: string;
  roomId?: string;
  roomName?: string;
  technologistId?: string;
  technologistName?: string;
  priority: Priority;
  clinicalDiagnosis?: string;
  notes?: string;
  status: '待确认' | '已确认' | '已登记' | '已完成' | '已取消' | '迟到';
  createdTime: string;
}

// ---------- 危急值 ----------
export interface CriticalValue {
  id: string;
  reportId: string;
  examId: string;
  patientId: string;
  patientName: string;
  modality: ModalityType;
  examItemName: string;
  criticalFinding: string;
  findingDetails: string;
  severity: '高危' | '危急';
  reportedBy: string;
  reportedByName: string;
  reportedTime: string;
  receivingDoctorId?: string;
  receivingDoctorName?: string;
  receivingTime?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedTime?: string;
  followUpNotes?: string;
  status: '待通知' | '已通知' | '已接收' | '已处理';
}

// ---------- 词汇库 ----------
export interface TermItem {
  id: string;
  category: string;        // 器官/部位/病变/测量值
  modality: ModalityType[];
  keyword: string;
  pinyin: string;
  fullTerm: string;
  synonyms?: string[];
  typicalFindings?: string;
  typicalDiagnosis?: string;
  usageExamples?: string[];
  isActive: boolean;
}

// ---------- 统计 ----------
export interface StatisticsData {
  today: { exams: number; reports: number; pending: number; critical: number };
  week: { exams: number; reports: number; critical: number };
  month: { exams: number; reports: number; critical: number; revenue: number };
  byModality: Record<ModalityType, number>;
  byBodyPart: Record<string, number>;
}

// ---------- 审核日志 ----------
export interface AuditLog {
  id: string;
  entityType: 'report' | 'exam' | 'patient' | 'template';
  entityId: string;
  action: string;
  operatorId: string;
  operatorName: string;
  operatorRole: UserRole;
  details?: string;
  timestamp: string;
}

// ---------- 医师排班 ----------
export interface DoctorSchedule {
  id: string;
  doctorId: string;
  doctorName: string;
  modality: ModalityType;
  date: string;
  shiftType: '上午' | '下午' | '夜班' | '全天' | '休息';
  roomId?: string;
  roomName?: string;
  status: '已排班' | '请假' | '替班';
  notes?: string;
}

// ---------- 数据字典 ----------
export interface DictionaryItem {
  id: string;
  category: string;       // 检查类型/设备/检查室/医保
  code: string;
  name: string;
  pinyin: string;
  sortOrder: number;
  isActive: boolean;
  extra?: Record<string, string>;
}

// ---------- 科室工作负载 ----------
export interface WorkloadStats {
  doctorId: string;
  doctorName: string;
  modality: ModalityType;
  todayReports: number;
  weekReports: number;
  monthReports: number;
  avgReportTime: number;   // 平均报告时间（分钟）
  criticalFindings: number;
  qualityScore: number;     // 报告质量均分
}

// ---------- DICOM工作列表项 ----------
export interface DicomWorklistItem {
  patientId: string;
  patientName: string;
  patientBirthDate?: string;
  patientSex?: Gender;
  accessionNumber: string;
  studyInstanceUID?: string;
  examItemName: string;
  modality: ModalityType;
  bodyPart: BodyPart;
  clinicalHistory?: string;
  requestingPhysician?: string;
  scheduledDate: string;
  scheduledTime: string;
  roomName?: string;
  deviceName?: string;
  priority?: Priority;
  status: 'scheduled' | 'arrived' | 'in-progress' | 'completed' | 'cancelled';
}

// ---------- 影像质量控制 ----------
export interface ImageQCRecord {
  id: string;
  examId: string;
  reportId: string;
  modalitiesAcquired: string[];
  imageCount: number;
  requiredImages: number;
  missingSequences?: string[];
  qualityIssue?: string;
  score: number;
  qcDoctorId?: string;
  qcDoctorName?: string;
  qcTime?: string;
  notes?: string;
}

// ---------- 体检接口 ----------
export interface PhysicalExamOrder {
  orderId: string;
  patientId: string;
  patientName: string;
  gender: Gender;
  age: number;
  examItems: { itemId: string; itemName: string; modality: ModalityType }[];
  packageName?: string;
  appointmentDate: string;
  status: '待检查' | '部分完成' | '已完成' | '已取消';
  hospitalName?: string;
  notes?: string;
}

// ---------- 设备维护记录 ----------
export interface DeviceMaintenance {
  id: string;
  deviceId: string;
  deviceName: string;
  modality: ModalityType;
  maintenanceType: '日常维护' | '定期保养' | '故障维修' | '性能检测' | '校准';
  performedBy: string;
  performedDate: string;
  nextMaintenanceDate?: string;
  cost?: number;
  status: '已完成' | '进行中' | '已延期';
  notes?: string;
  partsReplaced?: string[];
}

// ---------- 会诊记录 ----------
export interface Consultation {
  id: string;
  reportId: string;
  examId: string;
  patientId: string;
  patientName: string;
  modality: ModalityType;
  examItemName: string;
  requestingDoctorId: string;
  requestingDoctorName: string;
  requestingDepartment: string;
  consultedDoctorId?: string;
  consultedDoctorName?: string;
  consultedDepartment?: string;
  consultationType: '疑难病例' | 'MDT' | '远程会诊' | '二次意见';
  status: '待回复' | '已回复' | '已拒绝' | '已取消';
  requestTime: string;
  responseTime?: string;
  requestReason: string;
  responseContent?: string;
  isRemote: boolean;
  remotePlatform?: string;
}

// ---------- 排程/叫号 ----------
export interface QueueCall {
  id: string;
  roomId: string;
  roomName: string;
  modality: ModalityType;
  patientId: string;
  patientName: string;
  examItemName: string;
  queueNumber: number;
  calledNumber?: number;
  status: '等待中' | '已叫号' | '检查中' | '已完成';
  calledTime?: string;
  examStartTime?: string;
  examEndTime?: string;
}
