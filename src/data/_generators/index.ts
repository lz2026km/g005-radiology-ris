// [v3.0.6.8-27] 生成器统一导出
export * from "./medicalDataGen";

// 预生成数据 (各 200 条), 避免运行时重复生成
import {
  generateDoctorPerformance,
  generateExamReport,
  generateQualityScore,
  generateCriticalValueEvents,
  generateCosignTasks,
  generateDailyKPI,
} from "./medicalDataGen";

export const DOCTOR_PERFORMANCE_PRE = generateDoctorPerformance(800, 6);
export const EXAM_REPORT_PRE = generateExamReport(600, 30);
export const QUALITY_SCORE_PRE = generateQualityScore(250, 90);
export const CRITICAL_EVENTS_PRE = generateCriticalValueEvents(80, 30);
export const COSIGN_TASKS_PRE = generateCosignTasks(150, 7);
export const DAILY_KPI_PRE = generateDailyKPI(30);
