// G005 放射科RIS系统 - 剂量追踪 v0.3.0
// 已拆分子组件: DoseSearchPanel, DoseTrackingTable, DoseTrendChart, DoseAlertConfig
import { useTranslation } from "react-i18next";
import { useState, useCallback } from "react";
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  Monitor,
  ShieldAlert,
  Info,
  FileText,
  Clock,
  User,
  Target,
  BarChart3,
  TrendingDown,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Award,
  Zap,
  FileSpreadsheet,
  Baby,
  Heart,
  TrendingUp as TrendingUpCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  DoseSearchPanel,
  DoseTrackingTable,
  DoseTrendChart,
  DoseAlertConfig,
} from "./dose";
import type { PatientDoseRecord, DeviceDoseData, DoseAlert } from "./dose";

// ============ 常量定义 ============
// 法规阈值配置（依据《医疗照射放射防护标准》GBZ 130-2020）
const REGULATORY_THRESHOLDS = {
  CT: {
    头颅平扫: { DLP: 800, CTDIvol: 60, alertThreshold: 0.8 },
    胸部平扫: { DLP: 600, CTDIvol: 35, alertThreshold: 0.8 },
    腹部平扫: { DLP: 800, CTDIvol: 50, alertThreshold: 0.8 },
    冠脉CTA: { DLP: 1000, CTDIvol: 80, alertThreshold: 1.0 },
    胸部增强: { DLP: 1000, CTDIvol: 60, alertThreshold: 0.8 },
    腹部增强: { DLP: 1200, CTDIvol: 70, alertThreshold: 0.8 },
  },
  DR: {
    胸部正侧位: { DAP: 0.3, alertThreshold: 1.0 },
    腹部平片: { DAP: 1.0, alertThreshold: 1.0 },
    骨盆: { DAP: 0.5, alertThreshold: 1.0 },
  },
  DSA: {
    冠脉造影: { DAP: 3000, alertThreshold: 1.0 },
    脑血管造影: { DAP: 2500, alertThreshold: 1.0 },
    外周血管: { DAP: 2000, alertThreshold: 1.0 },
  },
  MG: {
    乳腺钼靶: { AGD: 6, alertThreshold: 1.0 },
  },
};

// AAPM/欧盟CT剂量参考值
const AAPM_EU_REFERENCES = [
  {
    examType: "头部CT",
    aapmRef: 56,
    euRef: 60,
    hospitalAvg: 52,
    exceedRate: 0,
  },
  {
    examType: "胸部CT",
    aapmRef: 15,
    euRef: 10,
    hospitalAvg: 18,
    exceedRate: 0.8,
  },
  {
    examType: "腹部CT",
    aapmRef: 25,
    euRef: 15,
    hospitalAvg: 28,
    exceedRate: 0.87,
  },
];

// ============ 类型定义 ============
interface PatientDoseRecord {
  id: string;
  patientId: string;
  patientName: string;
  gender: string;
  age: number;
  modality: string;
  examItem: string;
  examDate: string;
  doseType: string;
  doseValue: number;
  doseUnit: string;
  alertLevel: "normal" | "warning" | "critical";
  threshold: number;
  device: string;
  examCount: number;
  cumulativeDLP: number;
  isPediatric?: boolean;
  pediatricAgeGroup?: string;
}

interface DeviceDoseData {
  device: string;
  todayDLP: number;
  todayCTDI: number;
  todayDAP: number;
  alertCount: number;
  status: "normal" | "warning" | "critical";
  examCount: number;
  utilizationRate: number;
  avgCTDI: number;
  maxCTDI: number;
}

interface DoseAlert {
  id: string;
  patientName: string;
  modality: string;
  examItem: string;
  doseValue: number;
  threshold: number;
  alertLevel: "critical" | "warning";
  device: string;
  time: string;
  status: "pending" | "acknowledged";
  notes?: string;
}

interface DeviceHistoryPoint {
  date: string;
  DLP: number;
  CTDIvol: number;
  DAP: number;
  examCount: number;
}

interface CumulativeStats {
  totalPatientsToday: number;
  highDosePatients: number;
  totalDLPToday: number;
  doseAlertsToday: number;
  averageDLP: { CT: number; DR: number; DSA: number; MG: number };
  totalExamCount: number;
  criticalAlerts: number;
  warningAlerts: number;
  deviceOnlineCount: number;
  averageCTDIvol: number;
  doseReductionRate: number;
}

interface MonthlyDoseTrend {
  month: string;
  ctAvgDLP: number;
  chestCTAvgDLP: number;
  abdomenCTAvgDLP: number;
  headCTAvgDLP: number;
}

interface BreastDoseRecord {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  examDate: string;
  agd: number;
  doseUnit: string;
  referenceValue: number;
  alertLevel: "normal" | "warning" | "critical";
  recallStatus: "none" | "recalled" | "completed";
  device: string;
}

interface PediatricDoseRecord {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  ageGroup: string;
  gender: string;
  examDate: string;
  modality: string;
  examItem: string;
  doseValue: number;
  doseUnit: string;
  doseReductionFactor: number;
  alertLevel: "normal" | "warning" | "critical";
  device: string;
}

interface DICOMSRRecord {
  id: string;
  patientName: string;
  patientId: string;
  studyDate: string;
  modality: string;
  examItem: string;
  ctdivol: number;
  dlp: number;
  totalDose: number;
  doseUnit: string;
  drlReference: number;
  drlCompliant: boolean;
  device: string;
}

interface CumulativeDosePoint {
  date: string;
  cumulativeDLP: number;
  threshold: number;
  examCount: number;
}

interface StaffDoseRecord {
  id: string;
  staffName: string;
  department: string;
  role: string;
  monthlyDose: number;
  annualDose: number;
  annualLimit: number;
  doseUnit: string;
  complianceRate: number;
  readings: { month: string; dose: number }[];
}

interface DRLRecord {
  modality: string;
  examType: string;
  nationalDRL: number;
  localDRL: number;
  hospitalAvg: number;
  exceedCount: number;
  totalCount: number;
  compliancePercent: number;
  unit: string;
}

interface ControlChartPoint {
  date: string;
  mean: number;
  ucl: number;
  lcl: number;
  range: number;
  rangeUcl: number;
}

interface PediatricProtocol {
  ageGroup: string;
  weightMin: number;
  weightMax: number;
  recommendedKVP: number;
  recommendedMAS: number;
  doseReductionFactor: number;
  protocolName: string;
}

// ============ 模拟数据 ============
const doseHistoryData = [
  { date: "04-25", CT: 1250, MR: 0, DR: 180, DSA: 420, MG: 8 },
  { date: "04-26", CT: 1180, MR: 0, DR: 195, DSA: 380, MG: 6 },
  { date: "04-27", CT: 1320, MR: 0, DR: 210, DSA: 450, MG: 10 },
  { date: "04-28", CT: 1190, MR: 0, DR: 175, DSA: 0, MG: 4 },
  { date: "04-29", CT: 980, MR: 0, DR: 120, DSA: 400, MG: 8 },
  { date: "04-30", CT: 1100, MR: 0, DR: 160, DSA: 390, MG: 12 },
  { date: "05-01", CT: 850, MR: 0, DR: 95, DSA: 200, MG: 4 },
];

// CTDIvol趋势数据
const ctdivolTrendData = [
  { date: "04-25", CT1: 22.5, CT2: 18.2, threshold: 50 },
  { date: "04-26", CT1: 21.8, CT2: 17.5, threshold: 50 },
  { date: "04-27", CT1: 24.2, CT2: 19.8, threshold: 50 },
  { date: "04-28", CT1: 20.5, CT2: 16.8, threshold: 50 },
  { date: "04-29", CT1: 18.9, CT2: 15.2, threshold: 50 },
  { date: "04-30", CT1: 23.1, CT2: 18.9, threshold: 50 },
  { date: "05-01", CT1: 19.5, CT2: 14.8, threshold: 50 },
];

// 设备DAP对比数据
const deviceDAPComparison = [
  { device: "CT-1", DAP: 850, threshold: 1000, avgDAP: 720 },
  { device: "CT-2", DAP: 620, threshold: 1000, avgDAP: 680 },
  { device: "DR-1", DAP: 95, threshold: 300, avgDAP: 85 },
  { device: "DR-2", DAP: 78, threshold: 300, avgDAP: 72 },
  { device: "DSA-1", DAP: 4200, threshold: 3000, avgDAP: 3500 },
  { device: "MG-1", DAP: 8, threshold: 10, avgDAP: 7.2 },
];

// 月度剂量趋势数据
const monthlyDoseTrend: MonthlyDoseTrend[] = [
  {
    month: "2025-07",
    ctAvgDLP: 820,
    chestCTAvgDLP: 580,
    abdomenCTAvgDLP: 950,
    headCTAvgDLP: 720,
  },
  {
    month: "2025-08",
    ctAvgDLP: 805,
    chestCTAvgDLP: 560,
    abdomenCTAvgDLP: 920,
    headCTAvgDLP: 710,
  },
  {
    month: "2025-09",
    ctAvgDLP: 790,
    chestCTAvgDLP: 540,
    abdomenCTAvgDLP: 880,
    headCTAvgDLP: 695,
  },
  {
    month: "2025-10",
    ctAvgDLP: 775,
    chestCTAvgDLP: 520,
    abdomenCTAvgDLP: 850,
    headCTAvgDLP: 680,
  },
  {
    month: "2025-11",
    ctAvgDLP: 760,
    chestCTAvgDLP: 500,
    abdomenCTAvgDLP: 820,
    headCTAvgDLP: 665,
  },
  {
    month: "2025-12",
    ctAvgDLP: 745,
    chestCTAvgDLP: 480,
    abdomenCTAvgDLP: 790,
    headCTAvgDLP: 650,
  },
  {
    month: "2026-01",
    ctAvgDLP: 730,
    chestCTAvgDLP: 460,
    abdomenCTAvgDLP: 760,
    headCTAvgDLP: 635,
  },
  {
    month: "2026-02",
    ctAvgDLP: 718,
    chestCTAvgDLP: 445,
    abdomenCTAvgDLP: 740,
    headCTAvgDLP: 620,
  },
  {
    month: "2026-03",
    ctAvgDLP: 705,
    chestCTAvgDLP: 430,
    abdomenCTAvgDLP: 720,
    headCTAvgDLP: 605,
  },
  {
    month: "2026-04",
    ctAvgDLP: 695,
    chestCTAvgDLP: 415,
    abdomenCTAvgDLP: 700,
    headCTAvgDLP: 590,
  },
];

// 设备换装前后对比数据
const equipmentUpgradeComparison = [
  {
    period: "换装前(2025-Q1)",
    ct1AvgDLP: 920,
    ct2AvgDLP: 880,
    hospitalAvgDLP: 900,
  },
  {
    period: "换装后(2026-Q1)",
    ct1AvgDLP: 720,
    ct2AvgDLP: 680,
    hospitalAvgDLP: 695,
  },
];

const deviceDoseData: DeviceDoseData[] = [
  {
    device: "CT-1",
    todayDLP: 850,
    todayCTDI: 22.5,
    todayDAP: 850,
    alertCount: 2,
    status: "normal",
    examCount: 28,
    utilizationRate: 85,
    avgCTDI: 21.2,
    maxCTDI: 28.5,
  },
  {
    device: "CT-2",
    todayDLP: 620,
    todayCTDI: 18.2,
    todayDAP: 620,
    alertCount: 0,
    status: "normal",
    examCount: 22,
    utilizationRate: 72,
    avgCTDI: 17.5,
    maxCTDI: 22.3,
  },
  {
    device: "DR-1",
    todayDLP: 95,
    todayCTDI: 0.8,
    todayDAP: 95,
    alertCount: 0,
    status: "normal",
    examCount: 45,
    utilizationRate: 90,
    avgCTDI: 0.75,
    maxCTDI: 1.2,
  },
  {
    device: "DR-2",
    todayDLP: 78,
    todayCTDI: 0.6,
    todayDAP: 78,
    alertCount: 0,
    status: "normal",
    examCount: 38,
    utilizationRate: 78,
    avgCTDI: 0.62,
    maxCTDI: 0.95,
  },
  {
    device: "DSA-1",
    todayDLP: 4200,
    todayCTDI: 35.8,
    todayDAP: 4200,
    alertCount: 3,
    status: "warning",
    examCount: 8,
    utilizationRate: 45,
    avgCTDI: 32.5,
    maxCTDI: 48.2,
  },
  {
    device: "MG-1",
    todayDLP: 8,
    todayCTDI: 0.4,
    todayDAP: 8,
    alertCount: 0,
    status: "normal",
    examCount: 18,
    utilizationRate: 65,
    avgCTDI: 0.38,
    maxCTDI: 0.52,
  },
];

const patientDoseRecords: PatientDoseRecord[] = [
  {
    id: "DDR001",
    patientId: "RAD-P001",
    patientName: "张志刚",
    gender: "男",
    age: 62,
    modality: "CT",
    examItem: "冠脉CTA",
    examDate: "2026-05-01",
    doseType: "DLP",
    doseValue: 856,
    doseUnit: "mGy·cm",
    alertLevel: "warning",
    threshold: 800,
    device: "CT-1",
    examCount: 5,
    cumulativeDLP: 4200,
  },
  {
    id: "DDR002",
    patientId: "RAD-P004",
    patientName: "赵晓敏",
    gender: "女",
    age: 45,
    modality: "CT",
    examItem: "头颅CT平扫",
    examDate: "2026-05-01",
    doseType: "DLP",
    doseValue: 680,
    doseUnit: "mGy·cm",
    alertLevel: "normal",
    threshold: 800,
    device: "CT-2",
    examCount: 2,
    cumulativeDLP: 1250,
  },
  {
    id: "DDR003",
    patientId: "RAD-P005",
    patientName: "周玉芬",
    gender: "女",
    age: 52,
    modality: "CT",
    examItem: "腹部CT增强",
    examDate: "2026-05-01",
    doseType: "DLP",
    doseValue: 1250,
    doseUnit: "mGy·cm",
    alertLevel: "critical",
    threshold: 1000,
    device: "CT-2",
    examCount: 3,
    cumulativeDLP: 2800,
  },
  {
    id: "DDR004",
    patientId: "RAD-P001",
    patientName: "张志刚",
    gender: "男",
    age: 62,
    modality: "DSA",
    examItem: "冠脉造影",
    examDate: "2026-04-28",
    doseType: "DAP",
    doseValue: 3850,
    doseUnit: "mGy·m²",
    alertLevel: "critical",
    threshold: 3000,
    device: "DSA-1",
    examCount: 12,
    cumulativeDLP: 15000,
  },
  {
    id: "DDR005",
    patientId: "RAD-P007",
    patientName: "吴婷",
    gender: "女",
    age: 42,
    modality: "乳腺钼靶",
    examItem: "乳腺钼靶",
    examDate: "2026-05-01",
    doseType: "AGD",
    doseValue: 4.2,
    doseUnit: "mGy",
    alertLevel: "normal",
    threshold: 6,
    device: "MG-1",
    examCount: 1,
    cumulativeDLP: 4.2,
  },
  {
    id: "DDR006",
    patientId: "RAD-P003",
    patientName: "王建国",
    gender: "男",
    age: 58,
    modality: "DR",
    examItem: "胸部DR正侧位",
    examDate: "2026-05-01",
    doseType: "DAP",
    doseValue: 0.15,
    doseUnit: "mGy·m²",
    alertLevel: "normal",
    threshold: 1,
    device: "DR-1",
    examCount: 8,
    cumulativeDLP: 1.2,
  },
  {
    id: "DDR007",
    patientId: "RAD-P008",
    patientName: "李秀英",
    gender: "女",
    age: 68,
    modality: "CT",
    examItem: "胸部CT平扫",
    examDate: "2026-05-01",
    doseType: "DLP",
    doseValue: 580,
    doseUnit: "mGy·cm",
    alertLevel: "normal",
    threshold: 600,
    device: "CT-1",
    examCount: 4,
    cumulativeDLP: 2100,
  },
  {
    id: "DDR008",
    patientId: "RAD-P009",
    patientName: "陈伟民",
    gender: "男",
    age: 55,
    modality: "DSA",
    examItem: "脑血管造影",
    examDate: "2026-04-30",
    doseType: "DAP",
    doseValue: 2650,
    doseUnit: "mGy·m²",
    alertLevel: "warning",
    threshold: 2500,
    device: "DSA-1",
    examCount: 6,
    cumulativeDLP: 8500,
  },
  {
    id: "DDR009",
    patientId: "RAD-P010",
    patientName: "刘子轩",
    gender: "男",
    age: 8,
    modality: "CT",
    examItem: "头部CT",
    examDate: "2026-05-01",
    doseType: "DLP",
    doseValue: 420,
    doseUnit: "mGy·cm",
    alertLevel: "normal",
    threshold: 560,
    device: "CT-1",
    examCount: 1,
    cumulativeDLP: 420,
    isPediatric: true,
    pediatricAgeGroup: "5-10岁",
  },
  {
    id: "DDR010",
    patientId: "RAD-P011",
    patientName: "王小花",
    gender: "女",
    age: 5,
    modality: "CT",
    examItem: "胸部CT",
    examDate: "2026-05-01",
    doseType: "DLP",
    doseValue: 280,
    doseUnit: "mGy·cm",
    alertLevel: "normal",
    threshold: 350,
    device: "CT-2",
    examCount: 1,
    cumulativeDLP: 280,
    isPediatric: true,
    pediatricAgeGroup: "0-5岁",
  },
  {
    id: "DDR011",
    patientId: "RAD-P012",
    patientName: "陈美玲",
    gender: "女",
    age: 38,
    modality: "MG",
    examItem: "乳腺钼靶",
    examDate: "2026-05-01",
    doseType: "AGD",
    doseValue: 5.8,
    doseUnit: "mGy",
    alertLevel: "warning",
    threshold: 6,
    device: "MG-1",
    examCount: 1,
    cumulativeDLP: 5.8,
  },
  {
    id: "DDR012",
    patientId: "RAD-P013",
    patientName: "黄志强",
    gender: "男",
    age: 45,
    modality: "CT",
    examItem: "腹部CT平扫",
    examDate: "2026-04-30",
    doseType: "DLP",
    doseValue: 780,
    doseUnit: "mGy·cm",
    alertLevel: "normal",
    threshold: 800,
    device: "CT-1",
    examCount: 2,
    cumulativeDLP: 1450,
  },
  {
    id: "DDR013",
    patientId: "RAD-P014",
    patientName: "林晓红",
    gender: "女",
    age: 55,
    modality: "CT",
    examItem: "胸部CT增强",
    examDate: "2026-04-30",
    doseType: "DLP",
    doseValue: 950,
    doseUnit: "mGy·cm",
    alertLevel: "warning",
    threshold: 1000,
    device: "CT-2",
    examCount: 2,
    cumulativeDLP: 1800,
  },
  {
    id: "DDR014",
    patientId: "RAD-P015",
    patientName: "周明辉",
    gender: "男",
    age: 12,
    modality: "CT",
    examItem: "鼻窦CT",
    examDate: "2026-04-30",
    doseType: "DLP",
    doseValue: 320,
    doseUnit: "mGy·cm",
    alertLevel: "normal",
    threshold: 400,
    device: "CT-1",
    examCount: 1,
    cumulativeDLP: 320,
    isPediatric: true,
    pediatricAgeGroup: "10-15岁",
  },
  {
    id: "DDR015",
    patientId: "RAD-P016",
    patientName: "吴彩云",
    gender: "女",
    age: 48,
    modality: "MG",
    examItem: "乳腺钼靶",
    examDate: "2026-04-30",
    doseType: "AGD",
    doseValue: 6.5,
    doseUnit: "mGy",
    alertLevel: "critical",
    threshold: 6,
    device: "MG-1",
    examCount: 1,
    cumulativeDLP: 6.5,
  },
];

const doseAlerts: DoseAlert[] = [
  {
    id: "ALERT001",
    patientName: "周玉芬",
    modality: "CT",
    examItem: "腹部CT增强",
    doseValue: 1250,
    threshold: 1000,
    alertLevel: "critical",
    device: "CT-2",
    time: "2026-05-01 14:30",
    status: "pending",
  },
  {
    id: "ALERT002",
    patientName: "张志刚",
    modality: "DSA",
    examItem: "冠脉造影",
    doseValue: 3850,
    threshold: 3000,
    alertLevel: "critical",
    device: "DSA-1",
    time: "2026-04-28 11:20",
    status: "acknowledged",
    notes: "已进行剂量优化讨论",
  },
  {
    id: "ALERT003",
    patientName: "张志刚",
    modality: "CT",
    examItem: "冠脉CTA",
    doseValue: 856,
    threshold: 800,
    alertLevel: "warning",
    device: "CT-1",
    time: "2026-05-01 09:45",
    status: "pending",
  },
  {
    id: "ALERT004",
    patientName: "陈伟民",
    modality: "DSA",
    examItem: "脑血管造影",
    doseValue: 2650,
    threshold: 2500,
    alertLevel: "warning",
    device: "DSA-1",
    time: "2026-04-30 16:20",
    status: "pending",
  },
  {
    id: "ALERT005",
    patientName: "吴彩云",
    modality: "MG",
    examItem: "乳腺钼靶",
    doseValue: 6.5,
    threshold: 6,
    alertLevel: "critical",
    device: "MG-1",
    time: "2026-04-30 10:15",
    status: "pending",
  },
];

const cumulativeStats: CumulativeStats = {
  totalPatientsToday: 247,
  highDosePatients: 8,
  totalDLPToday: 2865,
  doseAlertsToday: 5,
  averageDLP: { CT: 720, DR: 0.12, DSA: 2800, MG: 3.8 },
  totalExamCount: 312,
  criticalAlerts: 2,
  warningAlerts: 3,
  deviceOnlineCount: 6,
  averageCTDIvol: 18.5,
  doseReductionRate: 5.2,
};

// 乳腺剂量追踪数据
const breastDoseRecords: BreastDoseRecord[] = [
  {
    id: "B001",
    patientId: "RAD-P007",
    patientName: "吴婷",
    age: 42,
    examDate: "2026-05-01",
    agd: 4.2,
    doseUnit: "mGy",
    referenceValue: 6,
    alertLevel: "normal",
    recallStatus: "none",
    device: "MG-1",
  },
  {
    id: "B002",
    patientId: "RAD-P012",
    patientName: "陈美玲",
    age: 38,
    examDate: "2026-05-01",
    agd: 5.8,
    doseUnit: "mGy",
    referenceValue: 6,
    alertLevel: "warning",
    recallStatus: "none",
    device: "MG-1",
  },
  {
    id: "B003",
    patientId: "RAD-P016",
    patientName: "吴彩云",
    age: 48,
    examDate: "2026-04-30",
    agd: 6.5,
    doseUnit: "mGy",
    referenceValue: 6,
    alertLevel: "critical",
    recallStatus: "recalled",
    device: "MG-1",
  },
  {
    id: "B004",
    patientId: "RAD-P020",
    patientName: "张丽华",
    age: 52,
    examDate: "2026-04-29",
    agd: 3.8,
    doseUnit: "mGy",
    referenceValue: 6,
    alertLevel: "normal",
    recallStatus: "none",
    device: "MG-1",
  },
  {
    id: "B005",
    patientId: "RAD-P021",
    patientName: "李婉如",
    age: 45,
    examDate: "2026-04-29",
    agd: 4.5,
    doseUnit: "mGy",
    referenceValue: 6,
    alertLevel: "normal",
    recallStatus: "none",
    device: "MG-1",
  },
  {
    id: "B006",
    patientId: "RAD-P022",
    patientName: "王秀英",
    age: 55,
    examDate: "2026-04-28",
    agd: 5.2,
    doseUnit: "mGy",
    referenceValue: 6,
    alertLevel: "normal",
    recallStatus: "none",
    device: "MG-1",
  },
  {
    id: "B007",
    patientId: "RAD-P023",
    patientName: "刘芳",
    age: 40,
    examDate: "2026-04-28",
    agd: 4.8,
    doseUnit: "mGy",
    referenceValue: 6,
    alertLevel: "normal",
    recallStatus: "none",
    device: "MG-1",
  },
  {
    id: "B008",
    patientId: "RAD-P024",
    patientName: "赵雪梅",
    age: 50,
    examDate: "2026-04-27",
    agd: 6.2,
    doseUnit: "mGy",
    referenceValue: 6,
    alertLevel: "critical",
    recallStatus: "completed",
    device: "MG-1",
  },
];

// 儿童剂量追踪数据
const pediatricDoseRecords: PediatricDoseRecord[] = [
  {
    id: "P001",
    patientId: "RAD-P010",
    patientName: "刘子轩",
    age: 8,
    ageGroup: "5-10岁",
    gender: "男",
    examDate: "2026-05-01",
    modality: "CT",
    examItem: "头部CT",
    doseValue: 420,
    doseUnit: "mGy·cm",
    doseReductionFactor: 0.6,
    alertLevel: "normal",
    device: "CT-1",
  },
  {
    id: "P002",
    patientId: "RAD-P011",
    patientName: "王小花",
    age: 5,
    ageGroup: "0-5岁",
    gender: "女",
    examDate: "2026-05-01",
    modality: "CT",
    examItem: "胸部CT",
    doseValue: 280,
    doseUnit: "mGy·cm",
    doseReductionFactor: 0.4,
    alertLevel: "normal",
    device: "CT-2",
  },
  {
    id: "P003",
    patientId: "RAD-P015",
    patientName: "周明辉",
    age: 12,
    ageGroup: "10-15岁",
    gender: "男",
    examDate: "2026-04-30",
    modality: "CT",
    examItem: "鼻窦CT",
    doseValue: 320,
    doseUnit: "mGy·cm",
    doseReductionFactor: 0.7,
    alertLevel: "normal",
    device: "CT-1",
  },
  {
    id: "P004",
    patientId: "RAD-P025",
    patientName: "陈小宝",
    age: 3,
    ageGroup: "0-5岁",
    gender: "男",
    examDate: "2026-04-30",
    modality: "CT",
    examItem: "腹部CT",
    doseValue: 350,
    doseUnit: "mGy·cm",
    doseReductionFactor: 0.4,
    alertLevel: "normal",
    device: "CT-2",
  },
  {
    id: "P005",
    patientId: "RAD-P026",
    patientName: "张小明",
    age: 7,
    ageGroup: "5-10岁",
    gender: "男",
    examDate: "2026-04-29",
    modality: "CT",
    examItem: "头部CT",
    doseValue: 480,
    doseUnit: "mGy·cm",
    doseReductionFactor: 0.6,
    alertLevel: "warning",
    device: "CT-1",
  },
  {
    id: "P006",
    patientId: "RAD-P027",
    patientName: "李婷婷",
    age: 14,
    ageGroup: "10-15岁",
    gender: "女",
    examDate: "2026-04-29",
    modality: "CT",
    examItem: "胸部CT",
    doseValue: 380,
    doseUnit: "mGy·cm",
    doseReductionFactor: 0.7,
    alertLevel: "normal",
    device: "CT-2",
  },
];

// DICOM SR 模拟数据
const dicomSRRecords: DICOMSRRecord[] = [
  {
    id: "SR001",
    patientName: "张志刚",
    patientId: "RAD-P001",
    studyDate: "2026-05-01",
    modality: "CT",
    examItem: "冠脉CTA",
    ctdivol: 48.2,
    dlp: 856,
    totalDose: 856,
    doseUnit: "mGy·cm",
    drlReference: 800,
    drlCompliant: false,
    device: "CT-1",
  },
  {
    id: "SR002",
    patientName: "赵晓敏",
    patientId: "RAD-P004",
    studyDate: "2026-05-01",
    modality: "CT",
    examItem: "头颅CT平扫",
    ctdivol: 42.5,
    dlp: 680,
    totalDose: 680,
    doseUnit: "mGy·cm",
    drlReference: 800,
    drlCompliant: true,
    device: "CT-2",
  },
  {
    id: "SR003",
    patientName: "王建国",
    patientId: "RAD-P003",
    studyDate: "2026-05-01",
    modality: "DR",
    examItem: "胸部DR正侧位",
    ctdivol: 0,
    dlp: 0,
    totalDose: 0.15,
    doseUnit: "mGy·m²",
    drlReference: 0.3,
    drlCompliant: true,
    device: "DR-1",
  },
  {
    id: "SR004",
    patientName: "吴婷",
    patientId: "RAD-P007",
    studyDate: "2026-05-01",
    modality: "MG",
    examItem: "乳腺钼靶",
    ctdivol: 0,
    dlp: 0,
    totalDose: 4.2,
    doseUnit: "mGy",
    drlReference: 6,
    drlCompliant: true,
    device: "MG-1",
  },
];

// 累计剂量模拟数据
const cumulativeDoseData: CumulativeDosePoint[] = [
  { date: "2026-01", cumulativeDLP: 850, threshold: 1000, examCount: 3 },
  { date: "2026-02", cumulativeDLP: 1650, threshold: 2000, examCount: 5 },
  { date: "2026-03", cumulativeDLP: 2800, threshold: 3000, examCount: 8 },
  { date: "2026-04", cumulativeDLP: 3500, threshold: 4000, examCount: 10 },
  { date: "2026-05", cumulativeDLP: 4200, threshold: 5000, examCount: 12 },
];

// 工作人员剂量模拟数据
const staffDoseRecords: StaffDoseRecord[] = [
  {
    id: "S001",
    staffName: "李明",
    department: "CT室",
    role: "放射技师",
    monthlyDose: 0.85,
    annualDose: 4.2,
    annualLimit: 20,
    doseUnit: "mSv",
    complianceRate: 79,
    readings: [
      { month: "1月", dose: 0.45 },
      { month: "2月", dose: 0.38 },
      { month: "3月", dose: 0.52 },
      { month: "4月", dose: 0.48 },
      { month: "5月", dose: 0.42 },
    ],
  },
  {
    id: "S002",
    staffName: "王芳",
    department: "CT室",
    role: "放射医师",
    monthlyDose: 0.62,
    annualDose: 3.1,
    annualLimit: 20,
    doseUnit: "mSv",
    complianceRate: 84.5,
    readings: [
      { month: "1月", dose: 0.32 },
      { month: "2月", dose: 0.28 },
      { month: "3月", dose: 0.35 },
      { month: "4月", dose: 0.31 },
      { month: "5月", dose: 0.28 },
    ],
  },
  {
    id: "S003",
    staffName: "张伟",
    department: "DSA室",
    role: "介入医师",
    monthlyDose: 1.85,
    annualDose: 9.2,
    annualLimit: 20,
    doseUnit: "mSv",
    complianceRate: 54,
    readings: [
      { month: "1月", dose: 1.2 },
      { month: "2月", dose: 0.95 },
      { month: "3月", dose: 1.45 },
      { month: "4月", dose: 1.1 },
      { month: "5月", dose: 1.05 },
    ],
  },
  {
    id: "S004",
    staffName: "陈静",
    department: "DR室",
    role: "放射技师",
    monthlyDose: 0.18,
    annualDose: 0.9,
    annualLimit: 20,
    doseUnit: "mSv",
    complianceRate: 95.5,
    readings: [
      { month: "1月", dose: 0.08 },
      { month: "2月", dose: 0.06 },
      { month: "3月", dose: 0.1 },
      { month: "4月", dose: 0.09 },
      { month: "5月", dose: 0.07 },
    ],
  },
  {
    id: "S005",
    staffName: "刘敏",
    department: "DSA室",
    role: "护师",
    monthlyDose: 0.42,
    annualDose: 2.1,
    annualLimit: 20,
    doseUnit: "mSv",
    complianceRate: 89.5,
    readings: [
      { month: "1月", dose: 0.22 },
      { month: "2月", dose: 0.18 },
      { month: "3月", dose: 0.25 },
      { month: "4月", dose: 0.2 },
      { month: "5月", dose: 0.18 },
    ],
  },
  {
    id: "S006",
    staffName: "赵强",
    department: "CT室",
    role: "放射技师",
    monthlyDose: 0.55,
    annualDose: 2.8,
    annualLimit: 20,
    doseUnit: "mSv",
    complianceRate: 86,
    readings: [
      { month: "1月", dose: 0.28 },
      { month: "2月", dose: 0.24 },
      { month: "3月", dose: 0.3 },
      { month: "4月", dose: 0.26 },
      { month: "5月", dose: 0.22 },
    ],
  },
];

// DRL配置数据
const drlRecords: DRLRecord[] = [
  {
    modality: "CT",
    examType: "头颅CT平扫",
    nationalDRL: 800,
    localDRL: 750,
    hospitalAvg: 720,
    exceedCount: 12,
    totalCount: 1256,
    compliancePercent: 99,
    unit: "mGy·cm",
  },
  {
    modality: "CT",
    examType: "胸部CT平扫",
    nationalDRL: 600,
    localDRL: 550,
    hospitalAvg: 520,
    exceedCount: 8,
    totalCount: 1089,
    compliancePercent: 99.3,
    unit: "mGy·cm",
  },
  {
    modality: "CT",
    examType: "腹部CT平扫",
    nationalDRL: 800,
    localDRL: 750,
    hospitalAvg: 740,
    exceedCount: 15,
    totalCount: 876,
    compliancePercent: 98.3,
    unit: "mGy·cm",
  },
  {
    modality: "CT",
    examType: "冠脉CTA",
    nationalDRL: 1000,
    localDRL: 950,
    hospitalAvg: 920,
    exceedCount: 22,
    totalCount: 456,
    compliancePercent: 95.2,
    unit: "mGy·cm",
  },
  {
    modality: "DR",
    examType: "胸部正侧位",
    nationalDRL: 0.3,
    localDRL: 0.28,
    hospitalAvg: 0.25,
    exceedCount: 0,
    totalCount: 2156,
    compliancePercent: 100,
    unit: "mGy·m²",
  },
  {
    modality: "DSA",
    examType: "冠脉造影",
    nationalDRL: 3000,
    localDRL: 2800,
    hospitalAvg: 2650,
    exceedCount: 18,
    totalCount: 156,
    compliancePercent: 88.5,
    unit: "mGy·m²",
  },
  {
    modality: "MG",
    examType: "乳腺钼靶",
    nationalDRL: 6,
    localDRL: 5.5,
    hospitalAvg: 5.2,
    exceedCount: 3,
    totalCount: 324,
    compliancePercent: 99.1,
    unit: "mGy",
  },
];

// 剂量控制图数据
const controlChartData: ControlChartPoint[] = [
  { date: "04-25", mean: 22.5, ucl: 32, lcl: 12, range: 8.5, rangeUcl: 15 },
  { date: "04-26", mean: 21.8, ucl: 32, lcl: 12, range: 7.2, rangeUcl: 15 },
  { date: "04-27", mean: 24.2, ucl: 32, lcl: 12, range: 9.8, rangeUcl: 15 },
  { date: "04-28", mean: 20.5, ucl: 32, lcl: 12, range: 6.5, rangeUcl: 15 },
  { date: "04-29", mean: 18.9, ucl: 32, lcl: 12, range: 5.8, rangeUcl: 15 },
  { date: "04-30", mean: 23.1, ucl: 32, lcl: 12, range: 8.2, rangeUcl: 15 },
  { date: "05-01", mean: 19.5, ucl: 32, lcl: 12, range: 6.2, rangeUcl: 15 },
];

// 儿童协议优化建议
const pediatricProtocols: PediatricProtocol[] = [
  {
    ageGroup: "0-5岁",
    weightMin: 5,
    weightMax: 15,
    recommendedKVP: 80,
    recommendedMAS: 60,
    doseReductionFactor: 0.4,
    protocolName: "儿童低剂量头部CT",
  },
  {
    ageGroup: "5-10岁",
    weightMin: 15,
    weightMax: 30,
    recommendedKVP: 100,
    recommendedMAS: 80,
    doseReductionFactor: 0.6,
    protocolName: "儿童常规剂量头部CT",
  },
  {
    ageGroup: "10-15岁",
    weightMin: 30,
    weightMax: 50,
    recommendedKVP: 120,
    recommendedMAS: 100,
    doseReductionFactor: 0.7,
    protocolName: "青少年头部CT",
  },
  {
    ageGroup: "0-5岁",
    weightMin: 5,
    weightMax: 15,
    recommendedKVP: 80,
    recommendedMAS: 40,
    doseReductionFactor: 0.35,
    protocolName: "儿童低剂量胸部CT",
  },
  {
    ageGroup: "5-10岁",
    weightMin: 15,
    weightMax: 30,
    recommendedKVP: 100,
    recommendedMAS: 50,
    doseReductionFactor: 0.5,
    protocolName: "儿童常规剂量胸部CT",
  },
  {
    ageGroup: "10-15岁",
    weightMin: 30,
    weightMax: 50,
    recommendedKVP: 120,
    recommendedMAS: 70,
    doseReductionFactor: 0.65,
    protocolName: "青少年胸部CT",
  },
];

// ============ 工具函数 ============
const getAlertBadge = (level: string) => {
  if (level === "critical")
    return { bg: "#fef2f2", color: "#dc2626", label: "危", border: "#fecaca" };
  if (level === "warning")
    return { bg: "#fffbeb", color: "#d97706", label: "警", border: "#fde68a" };
  return { bg: "#f0fdf4", color: "#16a34a", label: "正", border: "#bbf7d0" };
};

const getStatusBadge = (status: string) => {
  if (status === "critical")
    return { bg: "#fef2f2", color: "#dc2626", label: "超标" };
  if (status === "warning")
    return { bg: "#fffbeb", color: "#d97706", label: "预警" };
  return { bg: "#f0fdf4", color: "#16a34a", label: "正常" };
};

// ============ CSV导出函数 ============
const exportDoseDataToCSV = (
  data: PatientDoseRecord[],
  filename: string = "dose_records.csv",
) => {
  const headers = [
    "记录ID",
    "患者ID",
    "患者姓名",
    "性别",
    "年龄",
    "设备类型",
    "检查项目",
    "检查日期",
    "剂量类型",
    "剂量值",
    "单位",
    "阈值",
    "预警级别",
    "使用设备",
    "累计检查次数",
    "累计DLP",
  ];

  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      [
        row.id,
        row.patientId,
        row.patientName,
        row.gender,
        row.age,
        row.modality,
        row.examItem,
        row.examDate,
        row.doseType,
        row.doseValue,
        row.doseUnit,
        row.threshold,
        row.alertLevel,
        row.device,
        row.examCount,
        row.cumulativeDLP,
      ].join(","),
    ),
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

const exportDeviceDoseToCSV = (
  data: DeviceDoseData[],
  filename: string = "device_dose.csv",
) => {
  const headers = [
    "设备名称",
    "今日DLP",
    "今日CTDIvol",
    "今日DAP",
    "预警次数",
    "状态",
    "检查人数",
    "利用率(%)",
    "平均CTDI",
    "最大CTDI",
  ];

  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      [
        row.device,
        row.todayDLP,
        row.todayCTDI,
        row.todayDAP,
        row.alertCount,
        row.status,
        row.examCount,
        row.utilizationRate,
        row.avgCTDI,
        row.maxCTDI,
      ].join(","),
    ),
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

// ============ 子组件 ============

// AAPM/欧盟剂量参考值对比组件
const AAPMEUReferenceComparison = () => {
  const chartData = AAPM_EU_REFERENCES.map((ref) => ({
    name: ref.examType,
    aapm: ref.aapmRef,
    eu: ref.euRef,
    hospital: ref.hospitalAvg,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const ref = AAPM_EU_REFERENCES.find((r) => r.examType === label);
      return (
        <div
          style={{
            background: "#fff",
            padding: 12,
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#1e3a5f",
              marginBottom: 8,
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            <div>
              AAPM参考值:{" "}
              <span style={{ fontWeight: 600, color: "#1e40af" }}>
                {payload[0]?.value} mGy
              </span>
            </div>
            <div>
              欧盟参考值:{" "}
              <span style={{ fontWeight: 600, color: "#7c3aed" }}>
                {payload[1]?.value} mGy
              </span>
            </div>
            <div>
              本院平均值:{" "}
              <span style={{ fontWeight: 600, color: "#dc2626" }}>
                {payload[2]?.value} mGy
              </span>
            </div>
            {ref && (
              <div>
                超标比例:{" "}
                <span
                  style={{
                    fontWeight: 600,
                    color: ref.exceedRate > 0.5 ? "#dc2626" : "#16a34a",
                  }}
                >
                  {(ref.exceedRate * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 20,
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}>
            AAPM/欧盟 CT剂量参考值对比
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
            本院CT剂量 vs 国际参考值（单位: CTDIvol mGy）
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: "#1e40af",
              }}
            />
            <span style={{ fontSize: 10, color: "#64748b" }}>AAPM参考值</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: "#7c3aed",
              }}
            />
            <span style={{ fontSize: 10, color: "#64748b" }}>欧盟参考值</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: "#dc2626",
              }}
            />
            <span style={{ fontSize: 10, color: "#64748b" }}>本院平均值</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, 70]} />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="aapm"
            fill="#1e40af"
            radius={[4, 4, 0, 0]}
            name="AAPM参考值"
          />
          <Bar
            dataKey="eu"
            fill="#7c3aed"
            radius={[4, 4, 0, 0]}
            name="欧盟参考值"
          />
          <Bar
            dataKey="hospital"
            fill="#dc2626"
            radius={[4, 4, 0, 0]}
            name="本院平均值"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.hospital > entry.aapm ? "#dc2626" : "#16a34a"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* 超标告警表格 */}
      <div style={{ marginTop: 20 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#1e3a5f",
            marginBottom: 12,
          }}
        >
          CT剂量参考值对比表
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {[
                "检查类型",
                "AAPM参考值",
                "欧盟参考值",
                "本院平均值",
                "超标比例",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 12px",
                    textAlign: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#64748b",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AAPM_EU_REFERENCES.map((ref, i) => {
              const isExceed = ref.exceedRate > 0;
              return (
                <tr
                  key={ref.examType}
                  style={{ background: i % 2 === 0 ? "#fff" : "#fafbfc" }}
                >
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#1e3a5f",
                      textAlign: "center",
                    }}
                  >
                    {ref.examType}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 12,
                      color: "#334155",
                      textAlign: "center",
                    }}
                  >
                    {ref.aapmRef} mGy
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 12,
                      color: "#334155",
                      textAlign: "center",
                    }}
                  >
                    {ref.euRef} mGy
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                      color: isExceed ? "#dc2626" : "#16a34a",
                      textAlign: "center",
                    }}
                  >
                    {ref.hospitalAvg} mGy
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        background: isExceed ? "#fef2f2" : "#f0fdf4",
                        color: isExceed ? "#dc2626" : "#16a34a",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {isExceed
                        ? `${(ref.exceedRate * 100).toFixed(0)}%`
                        : "0%"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 告警说明 */}
      {AAPM_EU_REFERENCES.some((r) => r.exceedRate > 0.5) && (
        <div
          style={{
            marginTop: 16,
            padding: "12px 16px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <AlertTriangle
            size={16}
            color="#dc2626"
            style={{ marginTop: 2, flexShrink: 0 }}
          />
          <div style={{ fontSize: 12, color: "#dc2626" }}>
            <strong>超标告警：</strong>
            胸部CT和腹部CT的本院平均值超过AAPM参考值，需要进行剂量优化分析。建议检查扫描参数设置，考虑降低剂量配置。
          </div>
        </div>
      )}
    </div>
  );
};

// 剂量趋势分析组件
const DoseTrendAnalysis = () => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "#fff",
            padding: 12,
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#1e3a5f",
              marginBottom: 8,
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            <div>
              CT平均DLP:{" "}
              <span style={{ fontWeight: 600, color: "#1e40af" }}>
                {payload[0]?.value} mGy·cm
              </span>
            </div>
            <div>
              胸部CT:{" "}
              <span style={{ fontWeight: 600, color: "#dc2626" }}>
                {payload[1]?.value} mGy·cm
              </span>
            </div>
            <div>
              腹部CT:{" "}
              <span style={{ fontWeight: 600, color: "#d97706" }}>
                {payload[2]?.value} mGy·cm
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 月度剂量趋势折线图 */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}>
              每月CT剂量平均值趋势
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
              2025年7月 - 2026年4月 CT剂量DLP趋势分析
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 10,
                  height: 3,
                  background: "#1e40af",
                  borderRadius: 2,
                }}
              />
              <span style={{ fontSize: 10, color: "#64748b" }}>CT平均DLP</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 10,
                  height: 3,
                  background: "#dc2626",
                  borderRadius: 2,
                }}
              />
              <span style={{ fontSize: 10, color: "#64748b" }}>胸部CT</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 10,
                  height: 3,
                  background: "#d97706",
                  borderRadius: 2,
                }}
              />
              <span style={{ fontSize: 10, color: "#64748b" }}>腹部CT</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={monthlyDoseTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              domain={[300, 1000]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="ctAvgDLP"
              stroke="#1e40af"
              strokeWidth={2}
              dot={{ fill: "#1e40af", strokeWidth: 2, r: 3 }}
              name="CT平均DLP"
            />
            <Line
              type="monotone"
              dataKey="chestCTAvgDLP"
              stroke="#dc2626"
              strokeWidth={2}
              dot={{ fill: "#dc2626", strokeWidth: 2, r: 3 }}
              name="胸部CT"
            />
            <Line
              type="monotone"
              dataKey="abdomenCTAvgDLP"
              stroke="#d97706"
              strokeWidth={2}
              dot={{ fill: "#d97706", strokeWidth: 2, r: 3 }}
              name="腹部CT"
            />
            <ReferenceLine
              y={560}
              stroke="#dc2626"
              strokeDasharray="5 5"
              label={{
                value: "AAPM胸部参考值",
                position: "right",
                fontSize: 9,
                fill: "#dc2626",
              }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* 趋势统计 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            marginTop: 16,
            padding: 12,
            background: "#f8fafc",
            borderRadius: 8,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#16a34a" }}>
              -15.3%
            </div>
            <div style={{ fontSize: 10, color: "#64748b" }}>CT剂量优化幅度</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1e40af" }}>
              820→695
            </div>
            <div style={{ fontSize: 10, color: "#64748b" }}>DLP降低趋势</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#dc2626" }}>
              580→415
            </div>
            <div style={{ fontSize: 10, color: "#64748b" }}>胸部CT降幅</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#16a34a" }}>
              达标
            </div>
            <div style={{ fontSize: 10, color: "#64748b" }}>当前胸部CT状态</div>
          </div>
        </div>
      </div>

      {/* 新设备换装前后对比 */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}>
              新设备换装前后剂量对比
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
              2025年Q1 vs 2026年Q1 设备升级效果评估
            </div>
          </div>
          <div
            style={{
              padding: "4px 12px",
              background: "#ecfdf5",
              color: "#16a34a",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <TrendingDown size={12} />
            剂量降低 22.8%
          </div>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          {/* 换装前 */}
          <div
            style={{
              padding: 16,
              background: "#fef2f2",
              borderRadius: 8,
              border: "1px solid #fecaca",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#dc2626",
                marginBottom: 12,
              }}
            >
              换装前 (2025-Q1)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  CT-1 平均DLP
                </span>
                <span
                  style={{ fontSize: 14, fontWeight: 700, color: "#dc2626" }}
                >
                  920 mGy·cm
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  CT-2 平均DLP
                </span>
                <span
                  style={{ fontSize: 14, fontWeight: 700, color: "#dc2626" }}
                >
                  880 mGy·cm
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 8,
                  borderTop: "1px solid #fecaca",
                }}
              >
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  全院平均DLP
                </span>
                <span
                  style={{ fontSize: 16, fontWeight: 800, color: "#dc2626" }}
                >
                  900 mGy·cm
                </span>
              </div>
            </div>
          </div>

          {/* 换装后 */}
          <div
            style={{
              padding: 16,
              background: "#ecfdf5",
              borderRadius: 8,
              border: "1px solid #bbf7d0",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#16a34a",
                marginBottom: 12,
              }}
            >
              换装后 (2026-Q1)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  CT-1 平均DLP
                </span>
                <span
                  style={{ fontSize: 14, fontWeight: 700, color: "#16a34a" }}
                >
                  720 mGy·cm
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  CT-2 平均DLP
                </span>
                <span
                  style={{ fontSize: 14, fontWeight: 700, color: "#16a34a" }}
                >
                  680 mGy·cm
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 8,
                  borderTop: "1px solid #bbf7d0",
                }}
              >
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  全院平均DLP
                </span>
                <span
                  style={{ fontSize: 16, fontWeight: 800, color: "#16a34a" }}
                >
                  695 mGy·cm
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            padding: "10px 12px",
            background: "#eff6ff",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <TrendingUpCircle size={14} color="#1e40af" />
          <span style={{ fontSize: 11, color: "#1e40af" }}>
            设备换装后，CT-1剂量降低21.7%，CT-2剂量降低22.7%，全院平均剂量降低22.8%，达到预期优化目标
          </span>
        </div>
      </div>
    </div>
  );
};

// 乳腺剂量追踪组件
const BreastDoseTracking = () => {
  const totalExams = breastDoseRecords.length;
  const recalledExams = breastDoseRecords.filter(
    (r) => r.recallStatus !== "none",
  ).length;
  const avgAGD =
    breastDoseRecords.reduce((sum, r) => sum + r.agd, 0) / totalExams;
  const exceedCount = breastDoseRecords.filter(
    (r) => r.agd > r.referenceValue,
  ).length;

  const recallPieData = [
    { name: "无需召回", value: totalExams - recalledExams },
    { name: "已召回", value: recalledExams },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 乳腺剂量统计卡片 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b" }}>本月检查量</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#1e40af",
              marginTop: 4,
            }}
          >
            {totalExams}
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
            人次
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b" }}>平均AGD</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#16a34a",
              marginTop: 4,
            }}
          >
            {avgAGD.toFixed(1)}
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
            mGy
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b" }}>召回重拍</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#d97706",
              marginTop: 4,
            }}
          >
            {recalledExams}
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
            例 ({((recalledExams / totalExams) * 100).toFixed(1)}%)
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b" }}>超标次数</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: exceedCount > 0 ? "#dc2626" : "#16a34a",
              marginTop: 4,
            }}
          >
            {exceedCount}
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
            次 (AGD&gt;6mGy)
          </div>
        </div>
      </div>

      {/* AGD参考值对比图表 */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}>
              乳腺摄影AGD剂量追踪
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
              平均腺体剂量(AGD)参考值: 6 mGy（欧盟标准）
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: "#1e40af",
                }}
              />
              <span style={{ fontSize: 10, color: "#64748b" }}>AGD值</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: "#dc2626",
                }}
              />
              <span style={{ fontSize: 10, color: "#64748b" }}>
                参考线(6mGy)
              </span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={breastDoseRecords.map((r) => ({
              name: r.patientName.slice(0, 3),
              agd: r.agd,
              alert: r.agd > 6,
            }))}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, 8]} />
            <Tooltip
              content={({ active, payload, label }: any) => {
                if (active && payload && payload.length) {
                  const record = breastDoseRecords.find((r) =>
                    r.patientName.startsWith(label),
                  );
                  return (
                    <div
                      style={{
                        background: "#fff",
                        padding: 10,
                        border: "1px solid #e2e8f0",
                        borderRadius: 6,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#1e3a5f",
                        }}
                      >
                        {record?.patientName}
                      </div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>
                        AGD: {payload[0]?.value} mGy
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: (record?.agd ?? 0) > 6 ? "#dc2626" : "#16a34a",
                        }}
                      >
                        {(record?.agd ?? 0) > 6 ? "超标" : "正常"}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={6} stroke="#dc2626" strokeDasharray="3 3" />
            <Bar dataKey="agd" radius={[4, 4, 0, 0]} name="AGD">
              {breastDoseRecords.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.agd > 6 ? "#dc2626" : "#1e40af"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 召回记录列表 */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#1e3a5f",
            marginBottom: 16,
          }}
        >
          乳腺剂量检查记录
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {[
                  "患者姓名",
                  "年龄",
                  "检查日期",
                  "AGD(mGy)",
                  "参考值",
                  "状态",
                  "召回状态",
                  "设备",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 12px",
                      textAlign: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#64748b",
                      borderBottom: "2px solid #e2e8f0",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {breastDoseRecords.map((record, i) => {
                const badge = getAlertBadge(record.alertLevel);
                return (
                  <tr
                    key={record.id}
                    style={{ background: i % 2 === 0 ? "#fff" : "#fafbfc" }}
                  >
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#1e3a5f",
                        textAlign: "center",
                      }}
                    >
                      {record.patientName}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        color: "#334155",
                        textAlign: "center",
                      }}
                    >
                      {record.age}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        color: "#64748b",
                        textAlign: "center",
                      }}
                    >
                      {record.examDate}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: record.agd > 6 ? "#dc2626" : "#16a34a",
                        textAlign: "center",
                      }}
                    >
                      {record.agd}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        color: "#64748b",
                        textAlign: "center",
                      }}
                    >
                      {record.referenceValue}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          background: badge.bg,
                          color: badge.color,
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {badge.label}级
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      {record.recallStatus === "none" ? (
                        <span style={{ fontSize: 11, color: "#16a34a" }}>
                          无需召回
                        </span>
                      ) : record.recallStatus === "recalled" ? (
                        <span
                          style={{
                            padding: "2px 8px",
                            background: "#fffbeb",
                            color: "#d97706",
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          待重拍
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: "2px 8px",
                            background: "#f0fdf4",
                            color: "#16a34a",
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          已完成
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        color: "#334155",
                        textAlign: "center",
                      }}
                    >
                      {record.device}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 儿童剂量特殊管理组件
const PediatricDoseManagement = () => {
  const totalPediatricExams = pediatricDoseRecords.length;
  const ageGroups = {
    "0-5岁": pediatricDoseRecords.filter((r) => r.ageGroup === "0-5岁").length,
    "5-10岁": pediatricDoseRecords.filter((r) => r.ageGroup === "5-10岁")
      .length,
    "10-15岁": pediatricDoseRecords.filter((r) => r.ageGroup === "10-15岁")
      .length,
  };
  const avgReductionFactor =
    pediatricDoseRecords.reduce((sum, r) => sum + r.doseReductionFactor, 0) /
    totalPediatricExams;

  const ageGroupPieData = [
    { name: "0-5岁", value: ageGroups["0-5岁"] },
    { name: "5-10岁", value: ageGroups["5-10岁"] },
    { name: "10-15岁", value: ageGroups["10-15岁"] },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 儿童剂量统计卡片 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 12,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b" }}>儿童检查总量</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#1e40af",
              marginTop: 4,
            }}
          >
            {totalPediatricExams}
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
            人次
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b" }}>0-5岁</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#dc2626",
              marginTop: 4,
            }}
          >
            {ageGroups["0-5岁"]}
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
            幼儿
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b" }}>5-10岁</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#d97706",
              marginTop: 4,
            }}
          >
            {ageGroups["5-10岁"]}
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
            儿童
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b" }}>10-15岁</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#16a34a",
              marginTop: 4,
            }}
          >
            {ageGroups["10-15岁"]}
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
            青少年
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b" }}>平均折扣系数</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#1e40af",
              marginTop: 4,
            }}
          >
            {(avgReductionFactor * 100).toFixed(0)}%
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
            相对成人
          </div>
        </div>
      </div>

      {/* 儿童剂量折扣系数说明 */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#1e3a5f",
            marginBottom: 16,
          }}
        >
          儿童CT剂量折扣系数参考
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
          }}
        >
          <div
            style={{
              padding: 16,
              background: "#fef2f2",
              borderRadius: 8,
              textAlign: "center",
              border: "1px solid #fecaca",
            }}
          >
            <Baby size={24} color="#dc2626" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: "#dc2626" }}>
              0-5岁
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#dc2626",
                marginTop: 4,
              }}
            >
              40%
            </div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>
              DLP = 成人 × 0.4
            </div>
          </div>
          <div
            style={{
              padding: 16,
              background: "#fffbeb",
              borderRadius: 8,
              textAlign: "center",
              border: "1px solid #fde68a",
            }}
          >
            <Baby size={24} color="#d97706" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: "#d97706" }}>
              5-10岁
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#d97706",
                marginTop: 4,
              }}
            >
              60%
            </div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>
              DLP = 成人 × 0.6
            </div>
          </div>
          <div
            style={{
              padding: 16,
              background: "#eff6ff",
              borderRadius: 8,
              textAlign: "center",
              border: "1px solid #bfdbfe",
            }}
          >
            <Baby size={24} color="#1e40af" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1e40af" }}>
              10-15岁
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#1e40af",
                marginTop: 4,
              }}
            >
              70%
            </div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>
              DLP = 成人 × 0.7
            </div>
          </div>
          <div
            style={{
              padding: 16,
              background: "#f0fdf4",
              borderRadius: 8,
              textAlign: "center",
              border: "1px solid #bbf7d0",
            }}
          >
            <User size={24} color="#16a34a" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: "#16a34a" }}>
              15岁以上
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#16a34a",
                marginTop: 4,
              }}
            >
              100%
            </div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>
              DLP = 成人 × 1.0
            </div>
          </div>
        </div>
      </div>

      {/* 儿童剂量检查记录 */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#1e3a5f",
            marginBottom: 16,
          }}
        >
          儿童CT检查记录
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {[
                  "患者姓名",
                  "年龄",
                  "年龄组",
                  "性别",
                  "检查日期",
                  "设备",
                  "检查项目",
                  "剂量值",
                  "折扣系数",
                  "预警级别",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 12px",
                      textAlign: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#64748b",
                      borderBottom: "2px solid #e2e8f0",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pediatricDoseRecords.map((record, i) => {
                const badge = getAlertBadge(record.alertLevel);
                const ageGroupColor =
                  record.ageGroup === "0-5岁"
                    ? "#dc2626"
                    : record.ageGroup === "5-10岁"
                      ? "#d97706"
                      : "#1e40af";
                return (
                  <tr
                    key={record.id}
                    style={{ background: i % 2 === 0 ? "#fff" : "#fafbfc" }}
                  >
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#1e3a5f",
                        textAlign: "center",
                      }}
                    >
                      {record.patientName}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        color: "#334155",
                        textAlign: "center",
                      }}
                    >
                      {record.age}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          background:
                            record.ageGroup === "0-5岁"
                              ? "#fef2f2"
                              : record.ageGroup === "5-10岁"
                                ? "#fffbeb"
                                : "#eff6ff",
                          color: ageGroupColor,
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                      >
                        {record.ageGroup}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        color: "#334155",
                        textAlign: "center",
                      }}
                    >
                      {record.gender}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        color: "#64748b",
                        textAlign: "center",
                      }}
                    >
                      {record.examDate}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        color: "#334155",
                        textAlign: "center",
                      }}
                    >
                      {record.device}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        color: "#334155",
                        textAlign: "center",
                      }}
                    >
                      {record.examItem}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#1e3a5f",
                        textAlign: "center",
                      }}
                    >
                      {record.doseValue}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          background: "#eff6ff",
                          color: "#1e40af",
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                      >
                        ×{record.doseReductionFactor.toFixed(1)}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          background: badge.bg,
                          color: badge.color,
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {badge.label}级
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 儿童剂量优化说明 */}
      <div
        style={{
          padding: "12px 16px",
          background: "#eff6ff",
          borderRadius: 8,
          border: "1px solid #bfdbfe",
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <Info
          size={14}
          color="#1e40af"
          style={{ marginTop: 2, flexShrink: 0 }}
        />
        <div style={{ fontSize: 11, color: "#1e40af", lineHeight: 1.6 }}>
          <strong>儿童剂量管理要点：</strong>
          儿童患者对辐射更敏感，应根据年龄组选择适当的剂量折扣系数。
          系统会自动计算儿童患者相对于成人剂量的折扣值，确保辐射防护的最优化。
          AAPM和欧盟指南均建议对儿童CT检查实施年龄特异性剂量管理。
        </div>
      </div>
    </div>
  );
};

// ============ Phase 5b 子组件 ============

// 1. DICOM SR RDSR Parser 组件
const DICOMSRParser = () => {
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);

  const handleImportSR = () => {
    setShowUploadSuccess(true);
    setTimeout(() => setShowUploadSuccess(false), 3000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 导入区 */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}>
              DICOM SR RDSR 解析
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
              导入结构化剂量报告并提取关键参数
            </div>
          </div>
          <button
            onClick={handleImportSR}
            style={{
              padding: "8px 16px",
              background: "#1e40af",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <FileText size={14} /> 导入DICOM SR
          </button>
        </div>
        {showUploadSuccess && (
          <div
            style={{
              padding: "10px 14px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 8,
              color: "#16a34a",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <CheckCircle size={14} /> DICOM SR导入成功，已解析{" "}
            {dicomSRRecords.length} 条剂量记录
          </div>
        )}
      </div>

      {/* 解析结果表格 */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#1e3a5f",
            marginBottom: 16,
          }}
        >
          RDSR 解析结果
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {[
                  "患者",
                  "检查日期",
                  "设备",
                  "检查项目",
                  "CTDIvol",
                  "DLP",
                  "总剂量",
                  "DRL参考值",
                  "DRL合规",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 12px",
                      textAlign: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#64748b",
                      borderBottom: "2px solid #e2e8f0",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dicomSRRecords.map((r, i) => (
                <tr
                  key={r.id}
                  style={{ background: i % 2 === 0 ? "#fff" : "#fafbfc" }}
                >
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#1e3a5f",
                      textAlign: "center",
                    }}
                  >
                    {r.patientName}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 12,
                      color: "#64748b",
                      textAlign: "center",
                    }}
                  >
                    {r.studyDate}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 12,
                      color: "#334155",
                      textAlign: "center",
                    }}
                  >
                    {r.device}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 12,
                      color: "#334155",
                      textAlign: "center",
                    }}
                  >
                    {r.examItem}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#1e3a5f",
                      textAlign: "center",
                    }}
                  >
                    {r.ctdivol || "-"}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#1e3a5f",
                      textAlign: "center",
                    }}
                  >
                    {r.dlp || "-"}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 12,
                      color: "#334155",
                      textAlign: "center",
                    }}
                  >
                    {r.totalDose} {r.doseUnit}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 12,
                      color: "#64748b",
                      textAlign: "center",
                    }}
                  >
                    {r.drlReference}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        background: r.drlCompliant ? "#f0fdf4" : "#fef2f2",
                        color: r.drlCompliant ? "#16a34a" : "#dc2626",
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {r.drlCompliant ? "合格" : "超标"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 2. 累计剂量追踪组件
const CumulativeDoseTracker = () => {
  const lastPoint = cumulativeDoseData[cumulativeDoseData.length - 1]!;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#1e3a5f",
            marginBottom: 16,
          }}
        >
          患者累计剂量时间线 - 张志刚 (RAD-P001)
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={cumulativeDoseData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <ReferenceLine
              y={5000}
              stroke="#dc2626"
              strokeDasharray="5 5"
              label={{
                value: "年度阈值",
                position: "right",
                fontSize: 10,
                fill: "#dc2626",
              }}
            />
            <Area
              type="monotone"
              dataKey="cumulativeDLP"
              stroke="#1e40af"
              fill="#3b82f6"
              fillOpacity={0.15}
              strokeWidth={2}
              name="累计DLP"
            />
            <Area
              type="monotone"
              dataKey="threshold"
              stroke="#d97706"
              fill="#f59e0b"
              fillOpacity={0.05}
              strokeWidth={1.5}
              strokeDasharray="3 3"
              name="阶段阈值"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: 16,
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800, color: "#1e40af" }}>
            {lastPoint.cumulativeDLP}
          </div>
          <div style={{ fontSize: 10, color: "#64748b" }}>当前累计DLP</div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: 16,
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800, color: "#16a34a" }}>
            {lastPoint.examCount}
          </div>
          <div style={{ fontSize: 10, color: "#64748b" }}>累计检查次数</div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: 16,
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800, color: "#d97706" }}>
            {Math.round(lastPoint.cumulativeDLP / lastPoint.examCount)}
          </div>
          <div style={{ fontSize: 10, color: "#64748b" }}>次均剂量</div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: 16,
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: lastPoint.cumulativeDLP > 4000 ? "#dc2626" : "#16a34a",
            }}
          >
            {lastPoint.cumulativeDLP > 4000 ? "接近阈值" : "安全"}
          </div>
          <div style={{ fontSize: 10, color: "#64748b" }}>状态</div>
        </div>
      </div>
      <div
        style={{
          padding: "12px 16px",
          background: lastPoint.cumulativeDLP > 4000 ? "#fffbeb" : "#f0fdf4",
          borderRadius: 8,
          border: `1px solid ${lastPoint.cumulativeDLP > 4000 ? "#fde68a" : "#bbf7d0"}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          color: lastPoint.cumulativeDLP > 4000 ? "#d97706" : "#16a34a",
        }}
      >
        {lastPoint.cumulativeDLP > 4000 ? (
          <AlertTriangle size={14} />
        ) : (
          <CheckCircle size={14} />
        )}
        {lastPoint.cumulativeDLP > 4000
          ? "该患者累计剂量接近年度阈值（5000 mGy·cm），建议关注后续检查必要性"
          : "该患者累计剂量在安全范围内"}
      </div>
    </div>
  );
};

// 3. DRL管理组件
const DRLManagement = () => {
  const overallCompliance = Math.round(
    drlRecords.reduce((s, r) => s + r.compliancePercent, 0) / drlRecords.length,
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* DRL合规总览 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b" }}>DRL整体合规率</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: overallCompliance >= 95 ? "#16a34a" : "#d97706",
              marginTop: 4,
            }}
          >
            {overallCompliance}%
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b" }}>DRL超标检查</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color:
                drlRecords.reduce((s, r) => s + r.exceedCount, 0) > 50
                  ? "#dc2626"
                  : "#16a34a",
              marginTop: 4,
            }}
          >
            {drlRecords.reduce((s, r) => s + r.exceedCount, 0)}
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>次</div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b" }}>监控设备类型</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#1e40af",
              marginTop: 4,
            }}
          >
            {drlRecords.length}
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>种</div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b" }}>检查总量</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#1e40af",
              marginTop: 4,
            }}
          >
            {drlRecords.reduce((s, r) => s + r.totalCount, 0).toLocaleString()}
          </div>
        </div>
      </div>
      {/* DRL配置表格 */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}>
            DRL配置表（按模态/检查类型）
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span
              style={{
                padding: "4px 10px",
                background: "#eff6ff",
                color: "#1e40af",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 600,
              }}
            >
              国家标准
            </span>
            <span
              style={{
                padding: "4px 10px",
                background: "#f5f3ff",
                color: "#7c3aed",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 600,
              }}
            >
              地方标准
            </span>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {[
                  "检查类型",
                  "国家DRL",
                  "地方DRL",
                  "本院均值",
                  "超标次数",
                  "总检查数",
                  "合规率",
                  "单位",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 12px",
                      textAlign: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#64748b",
                      borderBottom: "2px solid #e2e8f0",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drlRecords.map((r, i) => {
                const isExceed = r.compliancePercent < 95;
                return (
                  <tr
                    key={`${r.modality}-${r.examType}`}
                    style={{ background: i % 2 === 0 ? "#fff" : "#fafbfc" }}
                  >
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#1e3a5f",
                        textAlign: "center",
                      }}
                    >
                      <span
                        style={{
                          padding: "2px 8px",
                          background: "#eff6ff",
                          color: "#2563eb",
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 600,
                          marginRight: 6,
                        }}
                      >
                        {r.modality}
                      </span>
                      {r.examType}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        color: "#1e40af",
                        textAlign: "center",
                        fontWeight: 600,
                      }}
                    >
                      {r.nationalDRL}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        color: "#7c3aed",
                        textAlign: "center",
                        fontWeight: 600,
                      }}
                    >
                      {r.localDRL}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        color:
                          r.hospitalAvg > r.localDRL ? "#dc2626" : "#16a34a",
                        textAlign: "center",
                        fontWeight: 700,
                      }}
                    >
                      {r.hospitalAvg}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        color: r.exceedCount > 0 ? "#dc2626" : "#16a34a",
                        textAlign: "center",
                        fontWeight: 600,
                      }}
                    >
                      {r.exceedCount}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        color: "#334155",
                        textAlign: "center",
                      }}
                    >
                      {r.totalCount.toLocaleString()}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "2px 8px",
                          background: isExceed ? "#fef2f2" : "#f0fdf4",
                          color: isExceed ? "#dc2626" : "#16a34a",
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {r.compliancePercent}%
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 11,
                        color: "#94a3b8",
                        textAlign: "center",
                      }}
                    >
                      {r.unit}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* 不合规告警 */}
      {drlRecords.filter((r) => r.compliancePercent < 95).length > 0 && (
        <div
          style={{
            padding: "12px 16px",
            background: "#fef2f2",
            borderRadius: 8,
            border: "1px solid #fecaca",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <AlertTriangle
            size={14}
            color="#dc2626"
            style={{ marginTop: 2, flexShrink: 0 }}
          />
          <div style={{ fontSize: 12, color: "#dc2626" }}>
            以下检查类型DRL合规率低于95%：
            {drlRecords
              .filter((r) => r.compliancePercent < 95)
              .map((r) => r.examType)
              .join("、")}
            。 建议进行剂量优化分析并调整扫描参数。
          </div>
        </div>
      )}
    </div>
  );
};

// 4. 儿科协议优化组件
const PediatricProtocolOptimization = () => {
  const ageGroups = ["0-5岁", "5-10岁", "10-15岁"];
  const [selectedAge, setSelectedAge] = useState("0-5岁");

  const filteredProtocols = pediatricProtocols.filter(
    (p) => p.ageGroup === selectedAge,
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#1e3a5f",
            marginBottom: 16,
          }}
        >
          儿科协议优化建议
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {ageGroups.map((ag) => (
            <button
              key={ag}
              onClick={() => setSelectedAge(ag)}
              style={{
                padding: "6px 16px",
                borderRadius: 6,
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                background: selectedAge === ag ? "#1e40af" : "#f1f5f9",
                color: selectedAge === ag ? "#fff" : "#64748b",
              }}
            >
              {ag}
            </button>
          ))}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {[
                "协议名称",
                "年龄组",
                "体重范围(kg)",
                "推荐KVP",
                "推荐mAs",
                "剂量折扣",
                "说明",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 12px",
                    textAlign: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#64748b",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredProtocols.map((p, i) => (
              <tr
                key={i}
                style={{ background: i % 2 === 0 ? "#fff" : "#fafbfc" }}
              >
                <td
                  style={{
                    padding: "10px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#1e3a5f",
                    textAlign: "center",
                  }}
                >
                  {p.protocolName}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    fontSize: 12,
                    color: "#334155",
                    textAlign: "center",
                  }}
                >
                  {p.ageGroup}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    fontSize: 12,
                    color: "#334155",
                    textAlign: "center",
                  }}
                >
                  {p.weightMin}-{p.weightMax}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#1e40af",
                    textAlign: "center",
                  }}
                >
                  {p.recommendedKVP} kVp
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#7c3aed",
                    textAlign: "center",
                  }}
                >
                  {p.recommendedMAS} mAs
                </td>
                <td style={{ padding: "10px 12px", textAlign: "center" }}>
                  <span
                    style={{
                      padding: "2px 8px",
                      background: "#eff6ff",
                      color: "#1e40af",
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    ×{p.doseReductionFactor}
                  </span>
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    fontSize: 11,
                    color: "#64748b",
                    textAlign: "center",
                  }}
                >
                  成人剂量×{p.doseReductionFactor}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 成人vs儿童剂量对比 */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#1e3a5f",
            marginBottom: 16,
          }}
        >
          成人 vs 儿童剂量对比（CT头部）
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={[
              { name: "成人(>15岁)", dose: 720, fill: "#3b82f6" },
              { name: "10-15岁", dose: 504, fill: "#8b5cf6" },
              { name: "5-10岁", dose: 432, fill: "#f59e0b" },
              { name: "0-5岁", dose: 288, fill: "#ef4444" },
            ]}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => [`${v} mGy·cm`, "DLP"]}
            />
            <Bar dataKey="dose" radius={[4, 4, 0, 0]}>
              {[
                { name: "成人(>15岁)", dose: 720, fill: "#3b82f6" },
                { name: "10-15岁", dose: 504, fill: "#8b5cf6" },
                { name: "5-10岁", dose: 432, fill: "#f59e0b" },
                { name: "0-5岁", dose: 288, fill: "#ef4444" },
              ].map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 5. 工作人员剂量监测组件
const StaffDoseMonitoring = () => {
  if (!staffDoseRecords[0]) return null;
  const monthlyChartData = staffDoseRecords[0].readings.map((r, idx) => ({
    month: r.month,
    ...Object.fromEntries(
      staffDoseRecords.map((s) => [s.staffName, s.readings[idx]?.dose ?? 0]),
    ),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b" }}>监测人数</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#1e40af",
              marginTop: 4,
            }}
          >
            {staffDoseRecords.length}
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b" }}>最高年剂量</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color:
                Math.max(...staffDoseRecords.map((s) => s.annualDose)) > 10
                  ? "#dc2626"
                  : "#1e40af",
              marginTop: 4,
            }}
          >
            {Math.max(...staffDoseRecords.map((s) => s.annualDose))}
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
            mSv
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b" }}>平均合规率</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#16a34a",
              marginTop: 4,
            }}
          >
            {Math.round(
              staffDoseRecords.reduce((s, r) => s + r.complianceRate, 0) /
                staffDoseRecords.length,
            )}
            %
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b" }}>高风险人员</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color:
                staffDoseRecords.filter((s) => s.complianceRate < 60).length > 0
                  ? "#dc2626"
                  : "#16a34a",
              marginTop: 4,
            }}
          >
            {staffDoseRecords.filter((s) => s.complianceRate < 60).length}
          </div>
        </div>
      </div>

      {/* 工作人员剂量对比图表 */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#1e3a5f",
            marginBottom: 16,
          }}
        >
          月度人员剂量对比
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine
              y={0.5}
              stroke="#d97706"
              strokeDasharray="3 3"
              label={{
                value: "关注线",
                position: "right",
                fontSize: 9,
                fill: "#d97706",
              }}
            />
            {staffDoseRecords.map((s, idx) => (
              <Bar
                key={s.id}
                dataKey={s.staffName}
                fill={
                  [
                    "#3b82f6",
                    "#8b5cf6",
                    "#ef4444",
                    "#10b981",
                    "#f59e0b",
                    "#6366f1",
                  ][idx]
                }
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 人员剂量表格 */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#1e3a5f",
            marginBottom: 16,
          }}
        >
          个人剂量监测记录
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {[
                  "姓名",
                  "科室",
                  "岗位",
                  "本月剂量(mSv)",
                  "年累计(mSv)",
                  "年限值(mSv)",
                  "合规率",
                  "状态",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 12px",
                      textAlign: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#64748b",
                      borderBottom: "2px solid #e2e8f0",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staffDoseRecords.map((s, i) => {
                const isHighRisk = s.complianceRate < 60;
                return (
                  <tr
                    key={s.id}
                    style={{ background: i % 2 === 0 ? "#fff" : "#fafbfc" }}
                  >
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#1e3a5f",
                        textAlign: "center",
                      }}
                    >
                      {s.staffName}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        color: "#334155",
                        textAlign: "center",
                      }}
                    >
                      {s.department}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        color: "#64748b",
                        textAlign: "center",
                      }}
                    >
                      {s.role}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#1e3a5f",
                        textAlign: "center",
                      }}
                    >
                      {s.monthlyDose}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        color: s.annualDose > 15 ? "#dc2626" : "#334155",
                        textAlign: "center",
                        fontWeight: 600,
                      }}
                    >
                      {s.annualDose}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        color: "#64748b",
                        textAlign: "center",
                      }}
                    >
                      {s.annualLimit}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "2px 8px",
                          background: isHighRisk
                            ? "#fef2f2"
                            : s.complianceRate < 80
                              ? "#fffbeb"
                              : "#f0fdf4",
                          color: isHighRisk
                            ? "#dc2626"
                            : s.complianceRate < 80
                              ? "#d97706"
                              : "#16a34a",
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {s.complianceRate}%
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          background: isHighRisk ? "#fef2f2" : "#f0fdf4",
                          color: isHighRisk ? "#dc2626" : "#16a34a",
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                      >
                        {isHighRisk ? "高风险" : "正常"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 6. 剂量控制图组件
const DoseControlCharts = () => {
  const outOfControl = controlChartData.filter(
    (p) => p.mean > p.ucl || p.mean < p.lcl || p.range > p.rangeUcl,
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* X-bar图 */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}>
              X-bar 控制图（CTDIvol均值）
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
              7日CTDIvol均值监控 · UCL: 32 · LCL: 12 · CL: 22
            </div>
          </div>
          {outOfControl.length > 0 && (
            <span
              style={{
                padding: "4px 10px",
                background: "#fef2f2",
                color: "#dc2626",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <AlertTriangle size={12} /> {outOfControl.length}个失控点
            </span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={controlChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, 40]} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine
              y={22}
              stroke="#16a34a"
              strokeDasharray="5 5"
              label={{
                value: "CL(22)",
                position: "right",
                fontSize: 9,
                fill: "#16a34a",
              }}
            />
            <ReferenceLine
              y={32}
              stroke="#dc2626"
              strokeDasharray="5 5"
              label={{
                value: "UCL(32)",
                position: "right",
                fontSize: 9,
                fill: "#dc2626",
              }}
            />
            <ReferenceLine
              y={12}
              stroke="#d97706"
              strokeDasharray="5 5"
              label={{
                value: "LCL(12)",
                position: "right",
                fontSize: 9,
                fill: "#d97706",
              }}
            />
            <Line
              type="monotone"
              dataKey="mean"
              stroke="#1e40af"
              strokeWidth={2}
              dot={{ fill: "#1e40af", r: 4 }}
              name="均值"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* R图 */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#1e3a5f",
            marginBottom: 16,
          }}
        >
          R 控制图（极差监控）
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={controlChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, 20]} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <ReferenceLine
              y={15}
              stroke="#dc2626"
              strokeDasharray="5 5"
              label={{
                value: "UCL(15)",
                position: "right",
                fontSize: 9,
                fill: "#dc2626",
              }}
            />
            <Line
              type="monotone"
              dataKey="range"
              stroke="#d97706"
              strokeWidth={2}
              dot={{ fill: "#d97706", r: 4 }}
              name="极差"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 趋势分析 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: 12,
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b" }}>均值偏移</div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "#1e40af",
              marginTop: 4,
            }}
          >
            {controlChartData[0] &&
            controlChartData[controlChartData.length - 1]
              ? (controlChartData[controlChartData.length - 1]!.mean -
                  controlChartData[0]!.mean >
                0
                  ? "+"
                  : "") +
                (
                  controlChartData[controlChartData.length - 1]!.mean -
                  controlChartData[0]!.mean
                ).toFixed(1)
              : "-"}
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: 12,
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b" }}>过程能力Cp</div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "#16a34a",
              marginTop: 4,
            }}
          >
            1.25
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: 12,
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b" }}>失控点数</div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: outOfControl.length > 0 ? "#dc2626" : "#16a34a",
              marginTop: 4,
            }}
          >
            {outOfControl.length}
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: 12,
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b" }}>过程状态</div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: outOfControl.length > 0 ? "#dc2626" : "#16a34a",
              marginTop: 4,
            }}
          >
            {outOfControl.length > 0 ? "失控" : "受控"}
          </div>
        </div>
      </div>

      {outOfControl.length > 0 && (
        <div
          style={{
            padding: "12px 16px",
            background: "#fef2f2",
            borderRadius: 8,
            border: "1px solid #fecaca",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <AlertTriangle
            size={14}
            color="#dc2626"
            style={{ marginTop: 2, flexShrink: 0 }}
          />
          <div style={{ fontSize: 12, color: "#dc2626" }}>
            <strong>SPC失控告警：</strong>检测到 {outOfControl.length}{" "}
            个数据点超出控制限。
            建议检查设备校准状态、扫描参数设置，并在剂量优化后重新评估过程能力。
          </div>
        </div>
      )}
    </div>
  );
};

// 患者剂量档案卡组件
const PatientDoseProfileCard = ({
  patient,
  onViewDetails,
}: {
  patient: PatientDoseRecord;
  onViewDetails: (patient: PatientDoseRecord) => void;
}) => {
  const badge = getAlertBadge(patient.alertLevel);
  const doseRatio = patient.doseValue / patient.threshold;
  const modalityThresholds =
    REGULATORY_THRESHOLDS[
      patient.modality as keyof typeof REGULATORY_THRESHOLDS
    ];
  const examThreshold = modalityThresholds?.[
    patient.examItem as keyof typeof modalityThresholds
  ] as { DLP?: number; DAP?: number; AGD?: number } | undefined;

  const referenceValue =
    examThreshold?.DLP || examThreshold?.DAP || examThreshold?.AGD || "-";

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        border: `1px solid ${badge.border}`,
        overflow: "hidden",
      }}
    >
      {/* 头部 */}
      <div
        style={{
          padding: "14px 16px",
          background: badge.bg,
          borderBottom: `1px solid ${badge.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={18} color={badge.color} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1e3a5f" }}>
              {patient.patientName}
            </div>
            <div style={{ fontSize: 11, color: "#64748b" }}>
              {patient.gender} · {patient.age}岁 · ID: {patient.patientId}
            </div>
          </div>
        </div>
        <span
          style={{
            padding: "4px 10px",
            background: badge.bg,
            color: badge.color,
            border: `1px solid ${badge.border}`,
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {badge.label}级预警
        </span>
      </div>

      {/* 内容 */}
      <div style={{ padding: 16 }}>
        {/* 检查信息 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Monitor size={14} color="#64748b" />
            <span style={{ fontSize: 12, color: "#64748b" }}>设备:</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#1e3a5f" }}>
              {patient.device}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={14} color="#64748b" />
            <span style={{ fontSize: 12, color: "#64748b" }}>日期:</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#1e3a5f" }}>
              {patient.examDate}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <span
            style={{
              padding: "3px 10px",
              background: "#eff6ff",
              color: "#2563eb",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {patient.modality}
          </span>
          <span
            style={{
              padding: "3px 10px",
              background: "#f5f3ff",
              color: "#7c3aed",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {patient.examItem}
          </span>
          {patient.isPediatric && (
            <span
              style={{
                padding: "3px 10px",
                background: "#fef2f2",
                color: "#dc2626",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              儿童({patient.pediatricAgeGroup})
            </span>
          )}
        </div>

        {/* 剂量信息 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 8,
              padding: 12,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>
              本次剂量
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: badge.color }}>
              {patient.doseValue}
            </div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>
              {patient.doseUnit}
            </div>
          </div>
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 8,
              padding: 12,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>
              法规阈值
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1e3a5f" }}>
              {patient.threshold}
            </div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>
              {patient.doseUnit}
            </div>
          </div>
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 8,
              padding: 12,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>
              占比
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: doseRatio > 1 ? "#dc2626" : "#16a34a",
              }}
            >
              {Math.round(doseRatio * 100)}%
            </div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>阈值比</div>
          </div>
        </div>

        {/* 剂量进度条 */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 11, color: "#64748b" }}>剂量安全指标</span>
            <span
              style={{
                fontSize: 11,
                color: doseRatio > 1 ? "#dc2626" : "#16a34a",
                fontWeight: 600,
              }}
            >
              {doseRatio > 1 ? "超出" : "在控"}
              {Math.round((doseRatio - 1) * 100)}%
            </span>
          </div>
          <div
            style={{
              height: 8,
              background: "#e2e8f0",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(doseRatio * 100, 100)}%`,
                background:
                  doseRatio > 1
                    ? "#dc2626"
                    : doseRatio > 0.8
                      ? "#d97706"
                      : "#16a34a",
                borderRadius: 4,
                transition: "width 0.3s",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 4,
            }}
          >
            <span style={{ fontSize: 9, color: "#94a3b8" }}>0%</span>
            <span style={{ fontSize: 9, color: "#94a3b8" }}>80%</span>
            <span style={{ fontSize: 9, color: "#94a3b8" }}>100%</span>
          </div>
        </div>

        {/* 统计信息 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            padding: 12,
            background: "#f8fafc",
            borderRadius: 8,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#1e3a5f" }}>
              {patient.examCount}
            </div>
            <div style={{ fontSize: 10, color: "#64748b" }}>累计检查</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#1e3a5f" }}>
              {patient.cumulativeDLP}
            </div>
            <div style={{ fontSize: 10, color: "#64748b" }}>累计DLP</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#1e3a5f" }}>
              {referenceValue}
            </div>
            <div style={{ fontSize: 10, color: "#64748b" }}>参考值</div>
          </div>
        </div>
      </div>

      {/* 底部操作 */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          gap: 8,
        }}
      >
        <button
          onClick={() => onViewDetails(patient)}
          style={{
            flex: 1,
            padding: "8px 12px",
            background: "#eff6ff",
            color: "#2563eb",
            border: "none",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Eye size={13} /> 查看详情
        </button>
        <button
          onClick={() => exportDoseDataToCSV([patient])}
          style={{
            flex: 1,
            padding: "8px 12px",
            background: "#f8fafc",
            color: "#334155",
            border: "none",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <FileText size={13} /> 历史记录
        </button>
      </div>
    </div>
  );
};

// 设备DAP对比柱状图组件
const DeviceDAPComparisonChart = () => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            background: "#fff",
            padding: 12,
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#1e3a5f",
              marginBottom: 8,
            }}
          >
            {data.device}
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            <div>
              今日DAP:{" "}
              <span style={{ fontWeight: 600, color: "#1e3a5f" }}>
                {data.DAP}
              </span>
            </div>
            <div>
              平均DAP:{" "}
              <span style={{ fontWeight: 600, color: "#1e3a5f" }}>
                {data.avgDAP}
              </span>
            </div>
            <div>
              法规阈值:{" "}
              <span style={{ fontWeight: 600, color: "#d97706" }}>
                {data.threshold}
              </span>
            </div>
            <div>
              占比:{" "}
              <span
                style={{
                  fontWeight: 600,
                  color: data.DAP > data.threshold ? "#dc2626" : "#16a34a",
                }}
              >
                {Math.round((data.DAP / data.threshold) * 100)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 20,
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}>
            设备DAP对比分析
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
            今日DAP vs 法规阈值 vs 设备平均值
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: "#3b82f6",
              }}
            />
            <span style={{ fontSize: 10, color: "#64748b" }}>今日DAP</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: "#94a3b8",
              }}
            />
            <span style={{ fontSize: 10, color: "#64748b" }}>平均DAP</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={deviceDAPComparison} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="device" tick={{ fontSize: 11, fill: "#94a3b8" }} />
          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={3000}
            stroke="#dc2626"
            strokeDasharray="3 3"
            label={{
              value: "DSA阈值",
              position: "right",
              fontSize: 10,
              fill: "#dc2626",
            }}
          />
          <ReferenceLine
            y={1000}
            stroke="#f59e0b"
            strokeDasharray="3 3"
            label={{
              value: "CT阈值",
              position: "right",
              fontSize: 10,
              fill: "#f59e0b",
            }}
          />
          <Bar
            dataKey="DAP"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            name="今日DAP"
          >
            {deviceDAPComparison.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.DAP > entry.threshold ? "#dc2626" : "#3b82f6"}
              />
            ))}
          </Bar>
          <Bar
            dataKey="avgDAP"
            fill="#94a3b8"
            radius={[4, 4, 0, 0]}
            name="平均DAP"
          />
        </BarChart>
      </ResponsiveContainer>
      {/* 法规阈值说明 */}
      <div
        style={{
          marginTop: 12,
          padding: "10px 12px",
          background: "#f8fafc",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <ShieldAlert size={14} color="#d97706" />
        <span style={{ fontSize: 11, color: "#64748b" }}>
          法规阈值: CT DLP {"<"} 1000mGy·cm | DR DAP {"<"} 300mGy·m² | DSA DAP{" "}
          {"<"} 3000mGy·m² | MG AGD {"<"} 6mGy
        </span>
      </div>
    </div>
  );
};

// CTDIvol趋势折线图组件
const CTDIvolTrendChart = () => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "#fff",
            padding: 12,
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#1e3a5f",
              marginBottom: 8,
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            <div>
              CT-1:{" "}
              <span style={{ fontWeight: 600, color: "#3b82f6" }}>
                {payload[0]?.value} mGy
              </span>
            </div>
            <div>
              CT-2:{" "}
              <span style={{ fontWeight: 600, color: "#8b5cf6" }}>
                {payload[1]?.value} mGy
              </span>
            </div>
            <div>
              法规阈值:{" "}
              <span style={{ fontWeight: 600, color: "#dc2626" }}>
                {payload[2]?.value} mGy
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 20,
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}>
            CTDIvol 趋势监控
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
            CT设备7日CTDIvol趋势及法规阈值
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 10,
                height: 3,
                background: "#3b82f6",
                borderRadius: 2,
              }}
            />
            <span style={{ fontSize: 10, color: "#64748b" }}>CT-1</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 10,
                height: 3,
                background: "#8b5cf6",
                borderRadius: 2,
              }}
            />
            <span style={{ fontSize: 10, color: "#64748b" }}>CT-2</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 10,
                height: 3,
                background: "#dc2626",
                borderRadius: 2,
              }}
            />
            <span style={{ fontSize: 10, color: "#64748b" }}>阈值</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={ctdivolTrendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, 60]} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="CT1"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
            name="CT-1"
          />
          <Line
            type="monotone"
            dataKey="CT2"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 3 }}
            name="CT-2"
          />
          <Line
            type="monotone"
            dataKey="threshold"
            stroke="#dc2626"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="法规阈值"
          />
        </LineChart>
      </ResponsiveContainer>
      {/* 统计摘要 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          marginTop: 16,
          padding: 12,
          background: "#f8fafc",
          borderRadius: 8,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#3b82f6" }}>
            21.5
          </div>
          <div style={{ fontSize: 10, color: "#64748b" }}>CT-1均值</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#8b5cf6" }}>
            17.2
          </div>
          <div style={{ fontSize: 10, color: "#64748b" }}>CT-2均值</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#16a34a" }}>
            -12%
          </div>
          <div style={{ fontSize: 10, color: "#64748b" }}>较上周</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#dc2626" }}>
            0
          </div>
          <div style={{ fontSize: 10, color: "#64748b" }}>超阈值天数</div>
        </div>
      </div>
    </div>
  );
};

// 设备历史趋势弹窗组件
const DeviceHistoryModal = ({
  device,
  onClose,
}: {
  device: string;
  onClose: () => void;
}) => {
  const mockHistoryData = [
    { date: "04-25", DLP: 820, CTDI: 22.5, examCount: 25 },
    { date: "04-26", DLP: 780, CTDI: 21.2, examCount: 23 },
    { date: "04-27", DLP: 950, CTDI: 25.8, examCount: 28 },
    { date: "04-28", DLP: 690, CTDI: 18.5, examCount: 20 },
    { date: "04-29", DLP: 850, CTDI: 23.2, examCount: 26 },
    { date: "04-30", DLP: 920, CTDI: 24.5, examCount: 27 },
    { date: "05-01", DLP: 850, CTDI: 22.5, examCount: 28 },
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          width: 600,
          maxHeight: "80vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1e3a5f" }}>
              {device} 历史趋势
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
              近7日剂量趋势分析
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 8,
              background: "#f8fafc",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            <XCircle size={18} color="#64748b" />
          </button>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={mockHistoryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="DLP"
              stroke="#3b82f6"
              strokeWidth={2}
              name="DLP"
            />
            <Line
              type="monotone"
              dataKey="CTDI"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="CTDIvol"
            />
          </LineChart>
        </ResponsiveContainer>

        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
        >
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 8,
              padding: 12,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 10, color: "#64748b" }}>7日平均DLP</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#1e3a5f" }}>
              840
            </div>
          </div>
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 8,
              padding: 12,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 10, color: "#64748b" }}>7日平均CTDI</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#1e3a5f" }}>
              22.6
            </div>
          </div>
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 8,
              padding: 12,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 10, color: "#64748b" }}>总检查量</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#1e3a5f" }}>
              177
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ 主组件 ============
export default function DoseTrackPage() {
  const { t } = useTranslation("v3exam");
  const [view, setView] = useState<
    | "overview"
    | "patient"
    | "device"
    | "alert"
    | "aapm"
    | "trend"
    | "breast"
    | "pediatric"
    | "dicom"
    | "cumulative"
    | "drl"
    | "pediatricopt"
    | "staff"
    | "spc"
  >("overview");
  const [modalityFilter, setModalityFilter] = useState<string>("全部");
  const [alertFilter, setAlertFilter] = useState<string>("全部");
  const [searchText, setSearchText] = useState("");
  const [selectedPatient, setSelectedPatient] =
    useState<PatientDoseRecord | null>(null);
  const [deviceHistoryDevice, setDeviceHistoryDevice] = useState<string | null>(
    null,
  );
  const [alerts, setAlerts] = useState<DoseAlert[]>(doseAlerts);

  const modalities = ["全部", "CT", "MR", "DR", "DSA", "乳腺钼靶", "胃肠造影"];

  // 过滤数据
  const filteredPatientRecords = patientDoseRecords.filter((record) => {
    const matchesModality =
      modalityFilter === "全部" || record.modality === modalityFilter;
    const matchesSearch =
      !searchText ||
      record.patientName.includes(searchText) ||
      record.patientId.includes(searchText) ||
      record.examItem.includes(searchText);
    return matchesModality && matchesSearch;
  });

  const filteredAlerts = alerts.filter((alert) => {
    if (alertFilter === "全部") return true;
    return alert.status === alertFilter;
  });

  // 处理导出
  const handleExportPatientCSV = useCallback(() => {
    exportDoseDataToCSV(
      filteredPatientRecords,
      `patient_dose_${new Date().toISOString().split("T")[0]}.csv`,
    );
  }, [filteredPatientRecords]);

  const handleExportDeviceCSV = useCallback(() => {
    exportDeviceDoseToCSV(
      deviceDoseData,
      `device_dose_${new Date().toISOString().split("T")[0]}.csv`,
    );
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
      {/* 页面标题 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#1e3a5f",
              margin: "0 0 4px",
            }}
          >
             {t("doseTrack.title")}
           </h1>
           <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
             {t("doseTrack.subtitle")}
           </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleExportPatientCSV}
            style={{
              padding: "6px 14px",
              background: "#fff",
              color: "#334155",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <FileSpreadsheet size={13} /> {t("doseTrack.exportPatient")}
          </button>
          <button
            onClick={handleExportDeviceCSV}
            style={{
              padding: "6px 14px",
              background: "#fff",
              color: "#334155",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <BarChart3 size={13} /> {t("doseTrack.exportDevice")}
          </button>
        </div>
      </div>

      {/* 核心统计卡片 - 增强版 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {/* 今日检查人数 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{t("doseTrack.stats.patientsToday")}</div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#1e3a5f",
                lineHeight: 1.2,
                marginTop: 4,
              }}
            >
              {cumulativeStats.totalPatientsToday}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#16a34a",
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <TrendingUp size={11} /> +5.2%
            </div>
          </div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#3b82f6",
            }}
          >
            <Activity size={18} />
          </div>
        </div>

        {/* 高剂量患者 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{t("doseTrack.stats.highDose")}</div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#dc2626",
                lineHeight: 1.2,
                marginTop: 4,
              }}
            >
              {cumulativeStats.highDosePatients}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#dc2626",
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <AlertTriangle size={11} /> +2人
            </div>
          </div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#dc2626",
            }}
          >
            <AlertTriangle size={18} />
          </div>
        </div>

        {/* 今日总DLP */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{t("doseTrack.stats.totalDLP")}</div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#1e3a5f",
                lineHeight: 1.2,
                marginTop: 4,
              }}
            >
              {cumulativeStats.totalDLPToday}
              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>
                {" "}
                mGy·cm
              </span>
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#dc2626",
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <TrendingDown size={11} /> -3.1%
            </div>
          </div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#f5f3ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#8b5cf6",
            }}
          >
            <TrendingUp size={18} />
          </div>
        </div>

        {/* 剂量预警 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{t("doseTrack.stats.doseAlerts")}</div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#d97706",
                lineHeight: 1.2,
                marginTop: 4,
              }}
            >
              {cumulativeStats.doseAlertsToday}
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
              <span style={{ color: "#dc2626" }}>
                {cumulativeStats.criticalAlerts}危
              </span>{" "}
              /{" "}
              <span style={{ color: "#d97706" }}>
                {cumulativeStats.warningAlerts}警
              </span>
            </div>
          </div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#fffbeb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#d97706",
            }}
          >
            <ShieldAlert size={18} />
          </div>
        </div>

        {/* 监控设备数 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{t("doseTrack.stats.devicesOnline")}</div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#1e3a5f",
                lineHeight: 1.2,
                marginTop: 4,
              }}
            >
              {cumulativeStats.deviceOnlineCount}
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
              平均CTDI: {cumulativeStats.averageCTDIvol} mGy
            </div>
          </div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#ecfdf5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#059669",
            }}
          >
            <Monitor size={18} />
          </div>
        </div>
      </div>

      {/* 次级统计卡片 - 剂量优化趋势 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "12px 16px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#ecfdf5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#059669",
            }}
          >
            <Award size={16} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#64748b" }}>{t("doseTrack.stats.doseReduction")}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#059669" }}>
              {cumulativeStats.doseReductionRate}%
            </div>
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "12px 16px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#3b82f6",
            }}
          >
            <Zap size={16} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#64748b" }}>{t("doseTrack.stats.examCount")}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#3b82f6" }}>
              {cumulativeStats.totalExamCount}
            </div>
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "12px 16px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#f5f3ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#8b5cf6",
            }}
          >
            <Clock size={16} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#64748b" }}>{t("doseTrack.stats.avgCTDIvol")}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#8b5cf6" }}>
              {cumulativeStats.averageCTDIvol} mGy
            </div>
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "12px 16px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#dc2626",
            }}
          >
            <CheckCircle size={16} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#64748b" }}>{t("doseTrack.stats.pendingAlerts")}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#dc2626" }}>
              {doseAlerts.filter((a) => a.status === "pending").length}
            </div>
          </div>
        </div>
      </div>

      {/* 视图切换 + 筛选器 */}
      <DoseSearchPanel
        view={view}
        setView={(v: any) => setView(v)}
        searchText={searchText}
        setSearchText={setSearchText}
        modalityFilter={modalityFilter}
        setModalityFilter={setModalityFilter}
        alertFilter={alertFilter}
        setAlertFilter={setAlertFilter}
        modalities={modalities}
      />

      {/* 总览视图 */}
      {view === "overview" && (
        <DoseTrendChart
          doseHistoryData={doseHistoryData}
          ctdivolTrendData={ctdivolTrendData}
          deviceDAPComparison={deviceDAPComparison}
          deviceDoseData={deviceDoseData}
          onViewDeviceHistory={(device) => setDeviceHistoryDevice(device)}
        />
      )}

      {/* 患者剂量视图 */}
      {view === "patient" && (
        <DoseTrackingTable
          filteredPatientRecords={filteredPatientRecords}
          selectedPatient={selectedPatient}
          setSelectedPatient={setSelectedPatient}
        />
      )}

      {/* 设备剂量视图 */}
      {view === "device" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {deviceDoseData.map((d) => (
            <div
              key={d.device}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 20,
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "#eff6ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Monitor size={18} color="#3b82f6" />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#1e3a5f",
                      }}
                    >
                      {d.device}
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background:
                              d.status === "warning" ? "#d97706" : "#16a34a",
                          }}
                        />
                        {d.status === "warning" ? t("doseTrack.device.statusWarning") : t("doseTrack.device.statusNormal")}
                      </span>
                    </div>
                  </div>
                </div>
                {d.alertCount > 0 && (
                  <span
                    style={{
                      padding: "4px 10px",
                      background: "#fef2f2",
                      color: "#dc2626",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <AlertTriangle size={12} /> {d.alertCount}起预警
                  </span>
                )}
              </div>

              {/* 剂量指标 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: 8,
                    padding: 12,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}
                  >
                    {t("doseTrack.device.dlp")}
                  </div>
                  <div
                    style={{ fontSize: 22, fontWeight: 800, color: "#1e3a5f" }}
                  >
                    {d.todayDLP}
                  </div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>mGy·cm</div>
                </div>
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: 8,
                    padding: 12,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}
                  >
                    {t("doseTrack.device.ctdivol")}
                   </div>
                   <div
                     style={{ fontSize: 22, fontWeight: 800, color: "#1e3a5f" }}
                   >
                     {d.todayCTDI}
                  </div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>mGy</div>
                </div>
              </div>

              {/* 详细统计 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    padding: 8,
                    background: "#f8fafc",
                    borderRadius: 6,
                  }}
                >
                  <div
                    style={{ fontSize: 14, fontWeight: 700, color: "#1e3a5f" }}
                  >
                    {d.examCount}
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>{t("doseTrack.device.examCount")}</div>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    padding: 8,
                    background: "#f8fafc",
                    borderRadius: 6,
                  }}
                >
                  <div
                    style={{ fontSize: 14, fontWeight: 700, color: "#1e3a5f" }}
                  >
                    {d.utilizationRate}%
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>{t("doseTrack.device.utilization")}</div>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    padding: 8,
                    background: "#f8fafc",
                    borderRadius: 6,
                  }}
                >
                  <div
                    style={{ fontSize: 14, fontWeight: 700, color: "#1e3a5f" }}
                  >
                    {d.avgCTDI}
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>{t("doseTrack.device.avgCTDI")}</div>
                </div>
              </div>

              {/* CTDI范围 */}
              <div
                style={{
                  marginBottom: 12,
                  padding: 10,
                  background: "#f8fafc",
                  borderRadius: 6,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: 11, color: "#64748b" }}>
                    {t("doseTrack.device.ctdiRange")}
                   </span>
                  <span
                    style={{ fontSize: 11, color: "#1e3a5f", fontWeight: 600 }}
                  >
                    {d.avgCTDI} - {d.maxCTDI} mGy
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    background: "#e2e8f0",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(d.maxCTDI / 60) * 100}%`,
                      background: d.maxCTDI > 50 ? "#dc2626" : "#3b82f6",
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>

              {/* 操作按钮 */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setDeviceHistoryDevice(d.device)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    background: "#eff6ff",
                    color: "#2563eb",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  <Clock size={13} /> {t("doseTrack.device.history")}
                </button>
                <button
                  onClick={() =>
                    window.open(`/api/device/${d.device}/qc-report`, "_blank")
                  }
                  style={{
                    flex: 1,
                    padding: "8px",
                    background: "#f8fafc",
                    color: "#334155",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  <FileText size={13} /> {t("doseTrack.device.qcReport")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 剂量预警视图 */}
      {view === "alert" && (
        <DoseAlertConfig
          doseAlerts={doseAlerts}
          cumulativeStats={cumulativeStats}
          filteredAlerts={filteredAlerts}
          onAcknowledgeAlert={(alertId) => {
            setAlerts((prev) =>
              prev.map((a) =>
                a.id === alertId ? { ...a, status: "acknowledged" as const } : a,
              ),
            );
          }}
          onViewPatient={(patientName) => {
            setView("patient");
            setSelectedPatient(
              patientDoseRecords.find(
                (r) => r.patientName === patientName,
              ) || null,
            );
          }}
        />
      )}

      {/* AAPM/欧盟剂量参考值对比视图 */}
      {view === "aapm" && <AAPMEUReferenceComparison />}

      {/* 剂量趋势分析视图 */}
      {view === "trend" && <DoseTrendAnalysis />}

      {/* 乳腺剂量追踪视图 */}
      {view === "breast" && <BreastDoseTracking />}

      {/* 儿童剂量特殊管理视图 */}
      {view === "pediatric" && <PediatricDoseManagement />}

      {/* Phase 5b: DICOM SR RDSR 解析 */}
      {view === "dicom" && <DICOMSRParser />}

      {/* Phase 5b: 累计剂量追踪 */}
      {view === "cumulative" && <CumulativeDoseTracker />}

      {/* Phase 5b: DRL管理 */}
      {view === "drl" && <DRLManagement />}

      {/* Phase 5b: 儿科协议优化 */}
      {view === "pediatricopt" && <PediatricProtocolOptimization />}

      {/* Phase 5b: 工作人员剂量监测 */}
      {view === "staff" && <StaffDoseMonitoring />}

      {/* Phase 5b: 剂量控制图 */}
      {view === "spc" && <DoseControlCharts />}

      {/* 设备历史趋势弹窗 */}
      {deviceHistoryDevice && (
        <DeviceHistoryModal
          device={deviceHistoryDevice}
          onClose={() => setDeviceHistoryDevice(null)}
        />
      )}

      {/* 底部说明 */}
      <div
        style={{
          marginTop: 20,
          padding: "12px 16px",
          background: "#f8fafc",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <Info
          size={14}
          style={{ color: "#64748b", marginTop: 2, flexShrink: 0 }}
        />
        <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>
          <strong style={{ color: "#334155" }}>剂量参考：</strong>
          CT头颅平扫 DLP参考值约700-800 mGy·cm；胸部CT平扫约400-600
          mGy·cm；冠脉CTA约800-1200 mGy·cm； DSA冠脉造影约2000-4000
          mGy·m²；乳腺钼靶约3-6 mGy。 根据《医疗照射放射防护标准》GBZ
          130-2020要求，对超出指导水平的检查应进行患者剂量优化分析。
          法规阈值标注依据国家标准制定，超出阈值时系统自动触发预警机制。
          AAPM参考值基于美国医学物理师协会建议；欧盟参考值基于欧盟委员会指南。
        </div>
      </div>

      {/* 版本信息 */}
      <div
        style={{
          marginTop: 12,
          textAlign: "center",
          fontSize: 10,
          color: "#94a3b8",
        }}
      >
        DoseTrackPage v0.3.0 · G005-001渐进式修改规范 · 最后更新: 2026-05-03
      </div>
    </div>
  );
}


