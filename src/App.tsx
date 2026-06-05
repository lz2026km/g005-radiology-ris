import React, { lazy, Suspense, createContext, useContext, useState, useEffect } from 'react'
// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 v1.0.7 - 报告子系统全面升级（Phase R0-R7 收官）
// I1: i18next国际化框架
// I6: RTL语言支持预留
// I8: 语言切换器UI
// E1: react-hot-toast统一操作成功/失败提示
// E7: 路由切换时顶部进度条 (NProgressBar)
// E9: 操作历史Undo机制 (UndoToastProvider)
// ============================================================
import './styles/design-system.css'
import { Routes, Route, Navigate, BrowserRouter, useNavigate, useLocation } from 'react-router-dom'
import { initTheme } from './utils/theme'
import { LanguageSwitcher } from './components/LanguageSwitcher'
// E1: Toast通知系统
import { ToastProvider } from './components/ToastProvider'
// E7: NProgressBar进度条
import { NProgressBar } from './components/NProgressBar'
// E9: UndoToast撤销窗口
import { UndoToastProvider } from './components/UndoToast'

const NavigateCtx = createContext<(path: string) => void>(() => {})
export const useNav = () => useContext(NavigateCtx)

// P5: lucide-react按需导入（只导入实际使用的图标）
import { LayoutDashboard, Users, CalendarClock, Activity, FileText,
  ShieldCheck, BarChart3, ClipboardCheck, BookOpen, Shield,
  Menu, X, Stethoscope, LogOut, Bell, Package, ShieldAlert,
  AlertTriangle, Camera, UserCheck, AlertCircle, GraduationCap,
  UsersRound, Database, Scan, Heart, Thermometer, Droplets,
  Monitor, TestTube, Radio, Cpu, Wifi, Printer, ListChecks,
  ClipboardList, ListOrdered, ScrollText, FileEdit, AlertOctagon,
  MessageSquare, TrendingUp, DollarSign, Gauge, FileStack, Wrench, Settings,
  Leaf, Zap, Network, BarChart2, Package as PackageIcon2, UserCircle,
  History, Search, Sliders, Wand2, Download, Send, Smartphone, Stamp, Link2,
  Clock, Target, Award
} from 'lucide-react'

// P1: React.lazy + Suspense按需加载53个页面
const HomePage = lazy(() => import('./pages/HomePage'))
const PatientPage = lazy(() => import('./pages/PatientPage'))
const ExamPage = lazy(() => import('./pages/ExamPage'))
const ReportPage = lazy(() => import('./pages/ReportPage'))
const ReportWritePage = lazy(() => import('./pages/ReportWritePage'))
const ReportWriteV2Page = lazy(() => import('./pages/ReportWriteV2Page'))
const WorklistPage = lazy(() => import('./pages/WorklistPage'))
const StatisticsPage = lazy(() => import('./pages/StatisticsPage'))
const CriticalValuePage = lazy(() => import('./pages/CriticalValuePage'))
const TermLibraryPage = lazy(() => import('./pages/TermLibraryPage'))
const DevicePage = lazy(() => import('./pages/DevicePage'))
const ConsultationPage = lazy(() => import('./pages/ConsultationPage'))
const QCPage = lazy(() => import('./pages/QCPage'))
const AppointmentPage = lazy(() => import('./pages/AppointmentPage'))
const DoseTrackPage = lazy(() => import('./pages/DoseTrackPage'))
const QueueCallPage = lazy(() => import('./pages/QueueCallPage'))
const DicomViewerPage = lazy(() => import('./pages/DicomViewerPage'))
const TypicalCasesPage = lazy(() => import('./pages/TypicalCasesPage'))
const FindingLibraryPage = lazy(() => import('./pages/FindingLibraryPage'))
const OperationLogPage = lazy(() => import('./pages/OperationLogPage'))
const NotificationCenter = lazy(() => import('./pages/NotificationCenter'))
const SchedulePage = lazy(() => import('./pages/SchedulePage'))
const DepartmentPage = lazy(() => import('./pages/DepartmentPage'))
const MaterialsPage = lazy(() => import('./pages/MaterialsPage'))
const PrintManagementPage = lazy(() => import('./pages/PrintManagementPage'))
const RegionalReportPage = lazy(() => import('./pages/RegionalReportPage'))
const AIAssistPage = lazy(() => import('./pages/AIAssistPage'))
const AuditPage = lazy(() => import('./pages/AuditPage'))
const AuthorityPage = lazy(() => import('./pages/AuthorityPage'))
const CostAnalysisPage = lazy(() => import('./pages/CostAnalysisPage'))
const EquipmentLifecyclePage = lazy(() => import('./pages/EquipmentLifecyclePage'))
const FollowUpPage = lazy(() => import('./pages/FollowUpPage'))
const CancerScreenPage = lazy(() => import('./pages/CancerScreenPage'))
const NationalReportPage = lazy(() => import('./pages/NationalReportPage'))
const InsuranceAuditPage = lazy(() => import('./pages/InsuranceAuditPage'))
const DataReportCenterPage = lazy(() => import('./pages/DataReportCenterPage'))
const DictionaryPage = lazy(() => import('./pages/DictionaryPage'))
const OperationsCenterPage = lazy(() => import('./pages/OperationsCenterPage'))
const DepartmentDashboardPage = lazy(() => import('./pages/DepartmentDashboardPage'))
const StatsReportPage = lazy(() => import('./pages/StatsReportPage'))
const ClinicalDataPage = lazy(() => import('./pages/ClinicalDataPage'))
const TemplateManagementPage = lazy(() => import('./pages/TemplateManagementPage'))
const TemplateDesignerPage = lazy(() => import('./pages/TemplateDesignerPage'))
const TemplateInheritancePage = lazy(() => import('./pages/TemplateInheritancePage'))
const TemplateCategoryPage = lazy(() => import('./pages/TemplateCategoryPage'))
const ReportReviewPage = lazy(() => import('./pages/ReportReviewPage'))
const ReportRevisionsPage = lazy(() => import('./pages/ReportRevisionsPage'))
const CollaborationPage = lazy(() => import('./pages/CollaborationPage'))
const KeywordCheckPage = lazy(() => import('./pages/KeywordCheckPage'))
const ReportScoreRulePage = lazy(() => import('./pages/ReportScoreRulePage'))
const ReportDefectLibraryPage = lazy(() => import('./pages/ReportDefectLibraryPage'))
const AIReportDraftPage = lazy(() => import('./pages/AIReportDraftPage'))
const CriticalValueRulePage = lazy(() => import('./pages/CriticalValueRulePage'))
const CriticalValueStatsPage = lazy(() => import('./pages/CriticalValueStatsPage'))
const SpecialAssessmentPages = lazy(() => import('./pages/SpecialAssessmentPages'))
const ReportExportPage = lazy(() => import('./pages/ReportExportPage'))
const ReportDeliveryPage = lazy(() => import('./pages/ReportDeliveryPage'))
const PatientReportPortalPage = lazy(() => import('./pages/PatientReportPortalPage'))
const CASignaturePage = lazy(() => import('./pages/CASignaturePage'))
const BlockchainProofPage = lazy(() => import('./pages/BlockchainProofPage'))
const AppointmentManagementPage = lazy(() => import('./pages/AppointmentManagementPage'))
const DeviceFaultPage = lazy(() => import('./pages/DeviceFaultPage'))
const AIQCPage = lazy(() => import('./pages/AIQCPage'))
const AIStructuredReportPage = lazy(() => import('./pages/AIStructuredReportPage'))
const RegionalImagingPage = lazy(() => import('./pages/RegionalImagingPage'))
const EquipmentEfficiencyPage = lazy(() => import('./pages/EquipmentEfficiencyPage'))
const SuppliesPage = lazy(() => import('./pages/SuppliesPage'))
const PatientPortalPage = lazy(() => import('./pages/PatientPortalPage'))
const DirectorDashboardPage = lazy(() => import('./pages/DirectorDashboardPage'))
const GreenITPage = lazy(() => import('./pages/GreenITPage'))
const ResearchPage = lazy(() => import('./pages/ResearchPage'))
const DicomPrintPage = lazy(() => import('./pages/System/DicomPrintPage'))
const NuclearStatsPage = lazy(() => import('./pages/NuclearStatsPage'))
const AIMedicalDevicePage = lazy(() => import('./pages/AIMedicalDevicePage'))
const TermSynonymGraphPage = lazy(() => import('./pages/TermSynonymGraphPage'))
const ReportPhraseBankPage = lazy(() => import('./pages/ReportPhraseBankPage'))
const ReportKpiDashboardPage = lazy(() => import('./pages/ReportKpiDashboardPage'))
const DoctorWorkloadPage = lazy(() => import('./pages/DoctorWorkloadPage'))
const DiagnosisAccuracyPage = lazy(() => import('./pages/DiagnosisAccuracyPage'))
const ReportTimelinessPage = lazy(() => import('./pages/ReportTimelinessPage'))
const ReportSearchPage = lazy(() => import('./pages/ReportSearchPage'))

import { initialUsers, initialModalityDevices, initialExamRooms } from './data/initialData'

// I1: 侧边栏配置 - 使用i18n key引用
const SIDEBAR_ITEMS = [
  { section: 'nav.workbench', items: [
    { path: '/', icon: <LayoutDashboard size={18} />, labelKey: 'nav.homeOverview', roles: ['医生','技师','护士','管理员','主任'] },
    { path: '/worklist', icon: <ListChecks size={18} />, labelKey: 'nav.worklist', roles: ['医生','技师','护士','管理员'] },
    { path: '/exams', icon: <ClipboardList size={18} />, labelKey: 'nav.examRecords', roles: ['医生','技师','管理员'] },
  ]},
  { section: 'nav.patientManagement', items: [
    { path: '/patients', icon: <Users size={18} />, labelKey: 'nav.patientManage', roles: ['医生','技师','护士','管理员'] },
    { path: '/appointments', icon: <CalendarClock size={18} />, labelKey: 'nav.appointment', roles: ['护士','管理员'] },
    { path: '/appointment-management', icon: <Settings size={18} />, labelKey: 'nav.appointmentManage', roles: ['护士','管理员'] },
    { path: '/queue-call', icon: <ListOrdered size={18} />, labelKey: 'nav.queueCall', roles: ['护士','技师','管理员'] },
    { path: '/follow-up', icon: <UserCheck size={18} />, labelKey: 'nav.followUp', roles: ['医生','主任','管理员'] },
  ]},
  { section: 'nav.reportManagement', items: [
    { path: '/reports', icon: <FileText size={18} />, labelKey: 'nav.reportList', roles: ['医生','管理员'] },
    { path: '/report-write', icon: <FileEdit size={18} />, labelKey: 'nav.writeReport', roles: ['医生','管理员'] },
    { path: '/report-write-v2', icon: <FileEdit size={18} />, labelKey: 'nav.writeReportV2', roles: ['医生','管理员'] },
    { path: '/critical-value', icon: <AlertOctagon size={18} />, labelKey: 'nav.criticalValue', roles: ['医生','主任','管理员'] },
    { path: '/consultation', icon: <MessageSquare size={18} />, labelKey: 'nav.consultation', roles: ['医生','主任','管理员'] },
    { path: '/report-review', icon: <ClipboardCheck size={18} />, labelKey: 'nav.reportReview', roles: ['医生','主任','管理员'] },
    { path: '/report-revisions', icon: <History size={18} />, labelKey: 'nav.reportRevisions', roles: ['医生','主任','管理员'] },
    { path: '/collaboration', icon: <Users size={18} />, labelKey: 'nav.collaboration', roles: ['医生','主任','管理员'] },
    { path: '/keyword-check', icon: <Search size={18} />, labelKey: 'nav.keywordCheck', roles: ['医生','主任','管理员'] },
    { path: '/report-score-rule', icon: <Sliders size={18} />, labelKey: 'nav.scoreRule', roles: ['主任','管理员'] },
    { path: '/report-defect-library', icon: <AlertOctagon size={18} />, labelKey: 'nav.defectLibrary', roles: ['主任','管理员'] },
    { path: '/ai-report-draft', icon: <Wand2 size={18} />, labelKey: 'nav.aiReportDraft', roles: ['医生','主任','管理员'] },
    { path: '/critical-value-rule', icon: <Settings size={18} />, labelKey: 'nav.cvRule', roles: ['主任','管理员'] },
    { path: '/critical-value-stats', icon: <BarChart3 size={18} />, labelKey: 'nav.cvStats', roles: ['主任','管理员'] },
    { path: '/special-assessment', icon: <Award size={18} />, labelKey: 'nav.specialAssessment', roles: ['医生','主任','管理员'] },
    { path: '/report-export', icon: <Download size={18} />, labelKey: 'nav.reportExport', roles: ['医生','主任','管理员'] },
    { path: '/report-delivery', icon: <Send size={18} />, labelKey: 'nav.reportDelivery', roles: ['医生','主任','管理员'] },
    { path: '/patient-report-portal', icon: <Smartphone size={18} />, labelKey: 'nav.patientPortal', roles: ['医生','主任','管理员'] },
    { path: '/ca-signature', icon: <Stamp size={18} />, labelKey: 'nav.caSignature', roles: ['主任','管理员'] },
    { path: '/blockchain-proof', icon: <Link2 size={18} />, labelKey: 'nav.blockchainProof', roles: ['主任','管理员'] },
  ]},
  { section: 'nav.imagingPrint', items: [
    { path: '/dicom-viewer', icon: <Activity size={18} />, labelKey: 'nav.dicomBrowser', roles: ['医生','技师','管理员'] },
    { path: '/print-management', icon: <Printer size={18} />, labelKey: 'nav.filmPrint', roles: ['技师','管理员'] },
    { path: '/ai-assist', icon: <Cpu size={18} />, labelKey: 'nav.aiAssist', roles: ['医生','技师','管理员'] },
  ]},
  { section: 'nav.aiIntelligence', items: [
    { path: '/ai-qc', icon: <Zap size={18} />, labelKey: 'nav.aiQc', roles: ['医生','技师','主任','管理员'] },
    { path: '/ai-structured-report', icon: <FileText size={18} />, labelKey: 'nav.aiStructuredReport', roles: ['医生','管理员'] },
    { path: '/ai-medical-device', icon: <Cpu size={18} />, labelKey: 'nav.aiMedicalDevice', roles: ['医生','技师','主任','管理员'] },
  ]},
  { section: 'nav.qualityControl', items: [
    { path: '/qc', icon: <ShieldCheck size={18} />, labelKey: 'nav.imageQc', roles: ['医生','技师','主任','管理员'] },
    { path: '/equipment-efficiency', icon: <BarChart2 size={18} />, labelKey: 'nav.equipmentEfficiency', roles: ['主任','管理员'] },
    { path: '/typical-cases', icon: <GraduationCap size={18} />, labelKey: 'nav.typicalCases', roles: ['医生','主任','管理员'] },
    { path: '/finding-library', icon: <Database size={18} />, labelKey: 'nav.typicalFindings', roles: ['医生','技师','管理员'] },
    { path: '/term-library', icon: <BookOpen size={18} />, labelKey: 'nav.reportGlossary', roles: ['医生','管理员'] },
    { path: '/template-management', icon: <FileStack size={18} />, labelKey: 'nav.templateManage', roles: ['医生','管理员'] },
    { path: '/template-designer', icon: <FileStack size={18} />, labelKey: 'nav.templateDesigner', roles: ['医生','管理员'] },
    { path: '/template-inheritance', icon: <FileStack size={18} />, labelKey: 'nav.templateInheritance', roles: ['医生','管理员'] },
    { path: '/template-category', icon: <FileStack size={18} />, labelKey: 'nav.templateCategory', roles: ['医生','管理员'] },
    { path: '/term-synonym-graph', icon: <Network size={18} />, labelKey: 'nav.termSynonymGraph', roles: ['医生','管理员'] },
    { path: '/report-phrase-bank', icon: <BookOpen size={18} />, labelKey: 'nav.phraseBank', roles: ['医生','管理员'] },
  ]},
  { section: 'nav.regionalCoordination', items: [
    { path: '/regional-imaging', icon: <Network size={18} />, labelKey: 'nav.regionalImaging', roles: ['医生','主任','管理员'] },
    { path: '/regional-report', icon: <FileText size={18} />, labelKey: 'nav.regionalReport', roles: ['医生','主任','管理员'] },
    { path: '/schedule', icon: <CalendarClock size={18} />, labelKey: 'nav.departmentSchedule', roles: ['技师','管理员'] },
    { path: '/department', icon: <UsersRound size={18} />, labelKey: 'nav.departmentManage', roles: ['主任','管理员'] },
  ]},
  { section: 'nav.patientService', items: [
    { path: '/cancer-screen', icon: <Shield size={18} />, labelKey: 'nav.cancerScreen', roles: ['医生','主任','管理员'] },
    { path: '/patient-portal', icon: <UserCircle size={18} />, labelKey: 'nav.patientImageQuery', roles: ['医生','护士','管理员'] },
    { path: '/clinical-data', icon: <Database size={18} />, labelKey: 'nav.clinicalData', roles: ['医生','主任','管理员'] },
  ]},
  { section: 'nav.dataAnalysis', items: [
    { path: '/statistics', icon: <TrendingUp size={18} />, labelKey: 'nav.statistics', roles: ['医生','主任','管理员'] },
    { path: '/green-it', icon: <Leaf size={18} />, labelKey: 'nav.greenIt', roles: ['医生','主任','管理员'] },
    { path: '/department-dashboard', icon: <Gauge size={18} />, labelKey: 'nav.departmentDashboard', roles: ['主任','管理员'] },
    { path: '/operations-center', icon: <Monitor size={18} />, labelKey: 'nav.operationsCenter', roles: ['主任','管理员'] },
    { path: '/cost-analysis', icon: <DollarSign size={18} />, labelKey: 'nav.costAnalysis', roles: ['主任','管理员'] },
    { path: '/stats-report', icon: <BarChart3 size={18} />, labelKey: 'nav.dataStats', roles: ['主任','管理员'] },
    { path: '/nuclear-stats', icon: <Radio size={18} />, labelKey: 'nav.nuclearStats', roles: ['医生','主任','管理员'] },
    { path: '/report-kpi-dashboard', icon: <BarChart3 size={18} />, labelKey: 'nav.kpiDashboard', roles: ['主任','管理员'] },
    { path: '/doctor-workload', icon: <Users size={18} />, labelKey: 'nav.doctorWorkload', roles: ['主任','管理员'] },
    { path: '/diagnosis-accuracy', icon: <Target size={18} />, labelKey: 'nav.diagnosisAccuracy', roles: ['主任','管理员'] },
    { path: '/report-timeliness', icon: <Clock size={18} />, labelKey: 'nav.reportTimeliness', roles: ['医生','主任','管理员'] },
    { path: '/report-search', icon: <Search size={18} />, labelKey: 'nav.reportSearch', roles: ['医生','主任','管理员'] },
  ]},
  { section: 'nav.dataReport', items: [
    { path: '/national-report', icon: <ShieldAlert size={18} />, labelKey: 'nav.nationalReport', roles: ['主任','管理员'] },
    { path: '/data-report-center', icon: <Database size={18} />, labelKey: 'nav.dataReportCenter', roles: ['主任','管理员'] },
    { path: '/insurance-audit', icon: <ShieldCheck size={18} />, labelKey: 'nav.insuranceAudit', roles: ['主任','管理员'] },
  ]},
  { section: 'nav.systemManage', items: [
    { path: '/authority', icon: <Shield size={18} />, labelKey: 'nav.authority', roles: ['管理员'] },
    { path: '/dictionary', icon: <BookOpen size={18} />, labelKey: 'nav.dataDictionary', roles: ['管理员'] },
    { path: '/operation-log', icon: <ScrollText size={18} />, labelKey: 'nav.operationLog', roles: ['医生','管理员','主任'] },
    { path: '/audit', icon: <FileText size={18} />, labelKey: 'nav.auditLog', roles: ['管理员','主任'] },
    { path: '/notification-center', icon: <Bell size={18} />, labelKey: 'nav.notification', roles: ['医生','技师','护士','管理员','主任'] },
    { path: '/system/dicom-print', icon: <Printer size={18} />, labelKey: 'nav.dicomPrint', roles: ['技师','管理员'] },
  ]},
  { section: 'nav.equipmentMaterials', items: [
    { path: '/equipment-lifecycle', icon: <Cpu size={18} />, labelKey: 'nav.equipmentLifecycle', roles: ['技师','主任','管理员'] },
    { path: '/device-fault', icon: <Wrench size={18} />, labelKey: 'nav.faultRegister', roles: ['技师','管理员'] },
    { path: '/materials', icon: <Package size={18} />, labelKey: 'nav.materialsManage', roles: ['护士','管理员'] },
    { path: '/supplies', icon: <PackageIcon2 size={18} />, labelKey: 'nav.radiologyMaterials', roles: ['技师','管理员'] },
    { path: '/dose-track', icon: <Activity size={18} />, labelKey: 'nav.doseTrack', roles: ['医生','技师','主任','管理员'] },
  ]},
]

const currentUser = { ...initialUsers[0], role: '管理员' } // 李明辉 - 主任

// I8: Language Switcher state
let currentLocale = 'zh-CN';
const localeChangeHandlers: Array<(locale: string) => void> = [];

export const onLocaleChange = (handler: (locale: string) => void) => {
  localeChangeHandlers.push(handler);
};

export const notifyLocaleChange = (locale: string) => {
  currentLocale = locale;
  localeChangeHandlers.forEach(h => h(locale));
};

export const getCurrentLocale = () => currentLocale;

// P8: 首屏数据区域使用Skeleton骨架屏
function Loading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', color: '#94a3b8', fontSize: 14, gap: 12 }}>
      <div style={{ width: 32, height: 32, border: '3px solid #334155', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      放射RIS系统加载中...
    </div>
  )
}

// I1: Simple i18n translation function
const translations: Record<string, Record<string, string>> = {
  'zh-CN': {
    'nav.workbench': '工作台',
    'nav.homeOverview': '首页概览',
    'nav.worklist': '检查工作列表',
    'nav.examRecords': '检查记录',
    'nav.patientManagement': '患者管理',
    'nav.patientManage': '患者管理',
    'nav.appointment': '检查预约',
    'nav.appointmentManage': '预约管理',
    'nav.queueCall': '排队叫号',
    'nav.followUp': '随访管理',
    'nav.reportManagement': '报告管理',
    'nav.reportList': '报告列表',
    'nav.writeReport': '书写报告',
    'nav.writeReportV2': '报告书写 v2.0 (R1)',
    'nav.criticalValue': '危急值管理',
    'nav.reportReview': '审核工作台 (R3)',
    'nav.reportRevisions': '修订管理 (R3)',
    'nav.collaboration': '多人协同 (R3)',
    'nav.keywordCheck': '关键字扫描 (R4)',
    'nav.scoreRule': '评分规则 (R4)',
    'nav.defectLibrary': '缺陷字典 (R4)',
    'nav.aiReportDraft': 'AI 初稿 (R4)',
    'nav.cvRule': '危急值规则 (R5)',
    'nav.cvStats': '危急值统计 (R5)',
    'nav.specialAssessment': '特殊分类评估 (R5)',
    'nav.reportExport': '报告导出 (R6)',
    'nav.reportDelivery': '报告推送 (R6)',
    'nav.patientPortal': '患者门户 (R6)',
    'nav.caSignature': 'CA 签名 (R6)',
    'nav.blockchainProof': '区块链存证 (R6)',
    'nav.consultation': '会诊管理',
    'nav.imagingPrint': '影像与打印',
    'nav.dicomBrowser': 'DICOM浏览',
    'nav.filmPrint': '胶片打印',
    'nav.aiAssist': 'AI辅助诊断',
    'nav.aiIntelligence': 'AI智能',
    'nav.aiQc': 'AI影像质控',
    'nav.aiStructuredReport': 'AI结构化报告',
    'nav.aiMedicalDevice': 'AI医疗器械注册证',
    'nav.qualityControl': '质量控制',
    'nav.imageQc': '影像质控',
    'nav.equipmentEfficiency': '设备效率分析',
    'nav.typicalCases': '典型病例库',
    'nav.typicalFindings': '典型征象库',
    'nav.reportGlossary': '报告词库',
    'nav.templateManage': '模板管理',
    'nav.templateDesigner': '模板设计器 (R2)',
    'nav.templateInheritance': '模板继承/克隆 (R2)',
    'nav.templateCategory': '模板分类树 (R2)',
    'nav.termSynonymGraph': '术语同义词图谱 (R7)',
    'nav.phraseBank': '报告短语库 (R7)',
    'nav.regionalCoordination': '区域协同',
    'nav.regionalImaging': '区域影像协同',
    'nav.regionalReport': '区域报告',
    'nav.departmentSchedule': '科室排班',
    'nav.departmentManage': '科室管理',
    'nav.patientService': '患者服务',
    'nav.cancerScreen': '早癌筛查',
    'nav.patientImageQuery': '患者影像查询',
    'nav.clinicalData': '临床数据中台',
    'nav.dataAnalysis': '数据分析',
    'nav.statistics': '统计分析',
    'nav.greenIt': '绿色IT统计',
    'nav.departmentDashboard': '科室看板',
    'nav.operationsCenter': '运营指挥中心',
    'nav.costAnalysis': '成本效益分析',
    'nav.dataStats': '数据统计',
    'nav.nuclearStats': '核医学统计',
    'nav.kpiDashboard': 'KPI 大盘 (R7)',
    'nav.doctorWorkload': '医生工作量 (R7)',
    'nav.diagnosisAccuracy': '诊断符合率 (R7)',
    'nav.reportTimeliness': '报告及时率 (R7)',
    'nav.reportSearch': '报告检索 (R7)',
    'nav.dataReport': '数据上报',
    'nav.nationalReport': '国家数据上报',
    'nav.dataReportCenter': '数据上报中心',
    'nav.insuranceAudit': '医保审核',
    'nav.systemManage': '系统管理',
    'nav.authority': '权限管理',
    'nav.dataDictionary': '数据字典',
    'nav.operationLog': '操作日志',
    'nav.auditLog': '审计日志',
    'nav.notification': '通知中心',
    'nav.dicomPrint': 'DICOM打印',
    'nav.equipmentMaterials': '设备物资',
    'nav.equipmentLifecycle': '设备全生命周期',
    'nav.faultRegister': '故障登记',
    'nav.materialsManage': '耗材管理',
    'nav.radiologyMaterials': '放射物资管理',
    'nav.doseTrack': '剂量追踪',
    'app.title': '005放射信息系统',
    'app.version': 'v1.0.7 · 报告子系统全面升级 R0-R7',
    'app.loading': '放射RIS系统加载中...',
    'app.hospital': '汉东省人民医院 · 放射科信息系统',
    'time.justNow': '刚刚',
    'time.minutesAgo': '{{count}}分钟前',
    'time.hoursAgo': '{{count}}小时前',
    'time.daysAgo': '{{count}}天前',
    'date.format': 'YYYY年MM月DD日',
  },
  'en-US': {
    'nav.workbench': 'Workbench',
    'nav.homeOverview': 'Home Overview',
    'nav.worklist': 'Worklist',
    'nav.examRecords': 'Exam Records',
    'nav.patientManagement': 'Patient Management',
    'nav.patientManage': 'Patient Management',
    'nav.appointment': 'Appointment',
    'nav.appointmentManage': 'Appointment Management',
    'nav.queueCall': 'Queue Call',
    'nav.followUp': 'Follow-up',
    'nav.reportManagement': 'Report Management',
    'nav.reportList': 'Report List',
    'nav.writeReport': 'Write Report',
    'nav.writeReportV2': 'Write Report v2.0 (R1)',
    'nav.criticalValue': 'Critical Values',
    'nav.reportReview': 'Review Workbench (R3)',
    'nav.reportRevisions': 'Revisions (R3)',
    'nav.collaboration': 'Collaboration (R3)',
    'nav.keywordCheck': 'Keyword Check (R4)',
    'nav.scoreRule': 'Score Rule (R4)',
    'nav.defectLibrary': 'Defect Library (R4)',
    'nav.aiReportDraft': 'AI Draft (R4)',
    'nav.cvRule': 'CV Rules (R5)',
    'nav.cvStats': 'CV Stats (R5)',
    'nav.specialAssessment': 'Special Assessment (R5)',
    'nav.reportExport': 'Report Export (R6)',
    'nav.reportDelivery': 'Report Delivery (R6)',
    'nav.patientPortal': 'Patient Portal (R6)',
    'nav.caSignature': 'CA Signature (R6)',
    'nav.blockchainProof': 'Blockchain Proof (R6)',
    'nav.consultation': 'Consultation',
    'nav.imagingPrint': 'Imaging & Print',
    'nav.dicomBrowser': 'DICOM Browser',
    'nav.filmPrint': 'Film Print',
    'nav.aiAssist': 'AI Assisted Diagnosis',
    'nav.aiIntelligence': 'AI Intelligence',
    'nav.aiQc': 'AI Image QC',
    'nav.aiStructuredReport': 'AI Structured Report',
    'nav.aiMedicalDevice': 'AI Medical Device Registration',
    'nav.qualityControl': 'Quality Control',
    'nav.imageQc': 'Image QC',
    'nav.equipmentEfficiency': 'Equipment Efficiency',
    'nav.typicalCases': 'Typical Cases',
    'nav.typicalFindings': 'Typical Findings',
    'nav.reportGlossary': 'Report Glossary',
    'nav.templateManage': 'Template Management',
    'nav.templateDesigner': 'Template Designer (R2)',
    'nav.templateInheritance': 'Template Inheritance (R2)',
    'nav.templateCategory': 'Template Category (R2)',
    'nav.termSynonymGraph': 'Term Synonym Graph (R7)',
    'nav.phraseBank': 'Phrase Bank (R7)',
    'nav.regionalCoordination': 'Regional Coordination',
    'nav.regionalImaging': 'Regional Imaging',
    'nav.regionalReport': 'Regional Report',
    'nav.departmentSchedule': 'Department Schedule',
    'nav.departmentManage': 'Department Management',
    'nav.patientService': 'Patient Service',
    'nav.cancerScreen': 'Cancer Screening',
    'nav.patientImageQuery': 'Patient Image Query',
    'nav.clinicalData': 'Clinical Data Hub',
    'nav.dataAnalysis': 'Data Analysis',
    'nav.statistics': 'Statistics',
    'nav.greenIt': 'Green IT Statistics',
    'nav.departmentDashboard': 'Department Dashboard',
    'nav.operationsCenter': 'Operations Center',
    'nav.costAnalysis': 'Cost Analysis',
    'nav.dataStats': 'Data Statistics',
    'nav.nuclearStats': 'Nuclear Medicine Stats',
    'nav.kpiDashboard': 'KPI Dashboard (R7)',
    'nav.doctorWorkload': 'Doctor Workload (R7)',
    'nav.diagnosisAccuracy': 'Diagnosis Accuracy (R7)',
    'nav.reportTimeliness': 'Report Timeliness (R7)',
    'nav.reportSearch': 'Report Search (R7)',
    'nav.dataReport': 'Data Report',
    'nav.nationalReport': 'National Report',
    'nav.dataReportCenter': 'Data Report Center',
    'nav.insuranceAudit': 'Insurance Audit',
    'nav.systemManage': 'System Management',
    'nav.authority': 'Authority',
    'nav.dataDictionary': 'Data Dictionary',
    'nav.operationLog': 'Operation Log',
    'nav.auditLog': 'Audit Log',
    'nav.notification': 'Notification Center',
    'nav.dicomPrint': 'DICOM Print',
    'nav.equipmentMaterials': 'Equipment & Materials',
    'nav.equipmentLifecycle': 'Equipment Lifecycle',
    'nav.faultRegister': 'Fault Register',
    'nav.materialsManage': 'Materials Management',
    'nav.radiologyMaterials': 'Radiology Materials',
    'nav.doseTrack': 'Dose Tracking',
    'app.title': '005 Radiology Information System',
    'app.version': 'v1.0.7 · Report Subsystem Upgrade R0-R7',
    'app.loading': 'Loading RIS...',
    'app.hospital': 'Handong Provincial Hospital · Radiology',
    'time.justNow': 'Just now',
    'time.minutesAgo': '{{count}} minutes ago',
    'time.hoursAgo': '{{count}} hours ago',
    'time.daysAgo': '{{count}} days ago',
    'date.format': 'MMMM D, YYYY',
  },
};

// I1: Translation function - I10: 参数化支持
export const t = (key: string, params?: Record<string, unknown>): string => {
  const locale = currentLocale;
  let text = translations[locale]?.[key] || translations['zh-CN']?.[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{{${k}}}`, String(v));
    });
  }
  return text;
};

// P4: useMemo依赖优化 - 提取sidebar items计算
function useSidebarItems(role: string) {
  return React.useMemo(() => {
    return SIDEBAR_ITEMS.map(section => ({
      ...section,
      items: section.items.filter(item => item.roles.includes(role))
    })).filter(section => section.items.length > 0)
  }, [role])
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [locale, setLocale] = useState(currentLocale)
  const navigate = useNavigate()
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  // Handle locale change
  useEffect(() => {
    const handler = (newLocale: string) => setLocale(newLocale);
    onLocaleChange(handler);
    return () => {
      const idx = localeChangeHandlers.indexOf(handler);
      if (idx > -1) localeChangeHandlers.splice(idx, 1);
    };
  }, []);

  // P4: useMemo依赖优化避免不必要重渲染
  const filteredItems = useSidebarItems(currentUser.role)

  // I6: RTL support - get direction based on locale
  const direction = locale === 'ar' || locale === 'he' || locale === 'fa' || locale === 'ur' ? 'rtl' : 'ltr';

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', direction }}>
      <aside style={{
        width: sidebarOpen ? 260 : 60,
        background: '#1a3a5c',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #334155',
        transition: 'width 0.2s',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '16px 14px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Radio size={18} color="#fff" />
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f2f5' }}>{t('app.title')}</div>
              <div style={{ fontSize: 11, color: '#8b919e' }}>{t('app.version')}</div>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {filteredItems.map((section, idx) => (
            <div key={idx} style={{ marginBottom: 16 }}>
              {sidebarOpen && (
                <div style={{ padding: '8px 16px 4px', fontSize: 14, fontWeight: 700, color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {t(section.section)}
                </div>
              )}
              {section.items.map((item, i) => (
                <NavigateCtx.Provider key={item.path} value={navigate}>
                  <div
                    onClick={() => navigate(item.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: sidebarOpen ? '9px 14px' : '9px 20px',
                      margin: '2px 8px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      color: '#ffffff',
                      background: isActive(item.path) ? 'rgba(255,255,255,0.15)' : 'transparent',
                      borderLeft: isActive(item.path) ? '4px solid #22c55e' : '4px solid transparent',
                      fontSize: 20,
                      fontWeight: isActive(item.path) ? 700 : 500,
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { if (!isActive(item.path)) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                    onMouseLeave={e => { if (!isActive(item.path)) e.currentTarget.style.background = 'transparent' }}
                  >
                    <span style={{ flexShrink: 0 }}>{item.icon}</span>
                    {sidebarOpen && <span>{t(item.labelKey)}</span>}
                  </div>
                </NavigateCtx.Provider>
              ))}
            </div>
          ))}
        </nav>

        {/* I8: Language Switcher in sidebar bottom */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid #334155' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #334155',
              background: '#0f172a', color: '#64748b', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12,
            }}>
            {sidebarOpen ? <><X size={14} /> 收起</> : <><Menu size={14} /> 展开</>}
          </button>
        </div>

        <div style={{ padding: '12px 8px', borderTop: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderRadius: 6, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{currentUser.name.slice(0, 1)}</span>
            </div>
            {sidebarOpen && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>{currentUser.name}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{currentUser.title || currentUser.role}</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          height: 52, background: '#1e293b', borderBottom: '1px solid #334155',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'none', border: 'none', color: '#c8ccd4', cursor: 'pointer',
                padding: 4, display: 'flex', borderRadius: 4
              }}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <span style={{ fontSize: 14, color: '#f1f5f9', fontWeight: 600 }}>
              {t('app.hospital')}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
              <Activity size={14} style={{ color: '#22c55e' }} />
              <span>系统正常</span>
            </div>
            <button style={{ background: 'none', border: 'none', color: '#c8ccd4', cursor: 'pointer', display: 'flex', position: 'relative' }}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }} />
            </button>
            <span style={{ fontSize: 13, color: '#c8ccd4' }}>{new Date().toLocaleDateString(locale === 'en-US' ? 'en-US' : 'zh-CN')}</span>
          </div>
        </header>

        <div style={{ flex: 1, overflow: 'auto', background: '#f8fafc' }}>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/worklist" element={<WorklistPage />} />
              <Route path="/patients" element={<PatientPage />} />
              <Route path="/patient/:id" element={<PatientPage />} />
              <Route path="/exams" element={<ExamPage />} />
              <Route path="/reports" element={<ReportPage />} />
              <Route path="/report-write" element={<ReportWritePage />} />
              <Route path="/report-write/:id" element={<ReportWritePage />} />
              <Route path="/report-write-v2" element={<ReportWriteV2Page />} />
              <Route path="/report-write-v2/:id" element={<ReportWriteV2Page />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/critical-value" element={<CriticalValuePage />} />
              <Route path="/term-library" element={<TermLibraryPage />} />
              <Route path="/devices" element={<DevicePage />} />
              <Route path="/consultation" element={<ConsultationPage />} />
              <Route path="/qc" element={<QCPage />} />
              <Route path="/appointments" element={<AppointmentPage />} />
              <Route path="/dose-track" element={<DoseTrackPage />} />
              <Route path="/queue-call" element={<QueueCallPage />} />
              <Route path="/dicom-viewer" element={<DicomViewerPage />} />
              <Route path="/typical-cases" element={<TypicalCasesPage />} />
              <Route path="/finding-library" element={<FindingLibraryPage />} />
              <Route path="/operation-log" element={<OperationLogPage />} />
              <Route path="/notification-center" element={<NotificationCenter />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/department" element={<DepartmentPage />} />
              <Route path="/materials" element={<MaterialsPage />} />
              <Route path="/print-management" element={<PrintManagementPage />} />
              <Route path="/regional-report" element={<RegionalReportPage />} />
              <Route path="/ai-assist" element={<AIAssistPage />} />
              <Route path="/audit" element={<AuditPage />} />
              <Route path="/authority" element={<AuthorityPage />} />
              <Route path="/cost-analysis" element={<CostAnalysisPage />} />
              <Route path="/equipment-lifecycle" element={<EquipmentLifecyclePage />} />
              <Route path="/follow-up" element={<FollowUpPage />} />
              <Route path="/cancer-screen" element={<CancerScreenPage />} />
              <Route path="/national-report" element={<NationalReportPage />} />
              <Route path="/insurance-audit" element={<InsuranceAuditPage />} />
              <Route path="/data-report-center" element={<DataReportCenterPage />} />
              <Route path="/dictionary" element={<DictionaryPage />} />
              <Route path="/operations-center" element={<OperationsCenterPage />} />
              <Route path="/department-dashboard" element={<DepartmentDashboardPage />} />
              <Route path="/stats-report" element={<StatsReportPage />} />
              <Route path="/clinical-data" element={<ClinicalDataPage />} />
              <Route path="/template-management" element={<TemplateManagementPage />} />
              <Route path="/template-designer" element={<TemplateDesignerPage />} />
              <Route path="/template-designer/:id" element={<TemplateDesignerPage />} />
              <Route path="/template-inheritance" element={<TemplateInheritancePage />} />
              <Route path="/template-category" element={<TemplateCategoryPage />} />
              <Route path="/report-review" element={<ReportReviewPage />} />
              <Route path="/report-revisions" element={<ReportRevisionsPage />} />
              <Route path="/collaboration" element={<CollaborationPage />} />
              <Route path="/keyword-check" element={<KeywordCheckPage />} />
              <Route path="/report-score-rule" element={<ReportScoreRulePage />} />
              <Route path="/report-defect-library" element={<ReportDefectLibraryPage />} />
              <Route path="/ai-report-draft" element={<AIReportDraftPage />} />
              <Route path="/critical-value-rule" element={<CriticalValueRulePage />} />
              <Route path="/critical-value-stats" element={<CriticalValueStatsPage />} />
              <Route path="/special-assessment" element={<SpecialAssessmentPages />} />
              <Route path="/report-export" element={<ReportExportPage />} />
              <Route path="/report-delivery" element={<ReportDeliveryPage />} />
              <Route path="/patient-report-portal" element={<PatientReportPortalPage />} />
              <Route path="/ca-signature" element={<CASignaturePage />} />
              <Route path="/blockchain-proof" element={<BlockchainProofPage />} />
              <Route path="/appointment-management" element={<AppointmentManagementPage />} />
              <Route path="/device-fault" element={<DeviceFaultPage />} />
              <Route path="/ai-qc" element={<AIQCPage />} />
              <Route path="/ai-structured-report" element={<AIStructuredReportPage />} />
              <Route path="/ai-medical-device" element={<AIMedicalDevicePage />} />
              <Route path="/regional-imaging" element={<RegionalImagingPage />} />
              <Route path="/equipment-efficiency" element={<EquipmentEfficiencyPage />} />
              <Route path="/supplies" element={<SuppliesPage />} />
              <Route path="/patient-portal" element={<PatientPortalPage />} />
              <Route path="/director-dashboard" element={<DirectorDashboardPage />} />
              <Route path="/green-it" element={<GreenITPage />} />
              <Route path="/research" element={<ResearchPage />} />
              <Route path="/nuclear-stats" element={<NuclearStatsPage />} />
              <Route path="/system/dicom-print" element={<DicomPrintPage />} />
              <Route path="/term-synonym-graph" element={<TermSynonymGraphPage />} />
              <Route path="/report-phrase-bank" element={<ReportPhraseBankPage />} />
              <Route path="/report-kpi-dashboard" element={<ReportKpiDashboardPage />} />
              <Route path="/doctor-workload" element={<DoctorWorkloadPage />} />
              <Route path="/diagnosis-accuracy" element={<DiagnosisAccuracyPage />} />
              <Route path="/report-timeliness" element={<ReportTimelinessPage />} />
              <Route path="/report-search" element={<ReportSearchPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  // U10: Initialize theme on app load
  useEffect(() => {
    initTheme()
  }, [])
  
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}