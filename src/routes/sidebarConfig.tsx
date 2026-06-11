/**
 * G005 放射RIS系统 v3.0.1 - 全局路由表与侧边栏配置
 * 从 v3.0.0 单体 App.tsx (768 行) 拆出,便于按域分文件维护
 */
import React from 'react'
import {
  LayoutDashboard, Users, CalendarClock, Activity, FileText,
  ShieldCheck, BarChart3, ClipboardCheck, BookOpen, Shield,
  Menu, Stethoscope, Bell, Package, ShieldAlert,
  AlertTriangle, Camera, UserCheck, AlertCircle, GraduationCap,
  UsersRound, Database, Heart, Thermometer,
  Monitor, TestTube, Radio, Cpu, Wifi, Printer, ListChecks,
  ClipboardList, ListOrdered, ScrollText, FileEdit, AlertOctagon,
  MessageSquare, TrendingUp, DollarSign, Gauge, FileStack, Wrench, Settings,
  Leaf, Zap, Network, BarChart2, UserCircle,
  History, Search, Sliders, Wand2, Download, Send, Smartphone, Stamp, Link2,
  Clock, Target, Award,
} from 'lucide-react'
import type { ReactNode } from 'react'

export type Role = '医生' | '技师' | '护士' | '管理员' | '主任'

export interface SidebarItem {
  path: string
  icon: ReactNode
  labelKey: string
  roles: ReadonlyArray<Role>
}

export interface SidebarSection {
  section: string
  items: ReadonlyArray<SidebarItem>
}

export const ROLE_NAMES: ReadonlyArray<Role> = ['医生', '技师', '护士', '管理员', '主任']

export const SIDEBAR_ITEMS: ReadonlyArray<SidebarSection> = [
  {
    section: 'nav.workbench',
    items: [
      { path: '/', icon: React.createElement(LayoutDashboard, { size: 18 }), labelKey: 'nav.homeOverview', roles: ['医生', '技师', '护士', '管理员', '主任'] },
      { path: '/v3/home', icon: React.createElement(LayoutDashboard, { size: 18 }), labelKey: 'nav.v3Home', roles: ['医生', '技师', '护士', '管理员', '主任'] },
      { path: '/worklist', icon: React.createElement(ListChecks, { size: 18 }), labelKey: 'nav.worklist', roles: ['医生', '技师', '护士', '管理员'] },
      { path: '/v3/worklist', icon: React.createElement(ListChecks, { size: 18 }), labelKey: 'nav.v3Worklist', roles: ['医生', '技师', '护士', '管理员'] },
      { path: '/exams', icon: React.createElement(ClipboardList, { size: 18 }), labelKey: 'nav.examRecords', roles: ['医生', '技师', '管理员'] },
    ],
  },
  {
    section: 'nav.patientManagement',
    items: [
      { path: '/patients', icon: React.createElement(Users, { size: 18 }), labelKey: 'nav.patientManage', roles: ['医生', '技师', '护士', '管理员'] },
      { path: '/v3/patients', icon: React.createElement(Users, { size: 18 }), labelKey: 'nav.v3Patients', roles: ['医生', '技师', '护士', '管理员'] },
      { path: '/appointments', icon: React.createElement(CalendarClock, { size: 18 }), labelKey: 'nav.appointment', roles: ['护士', '管理员'] },
      { path: '/v3/appointment', icon: React.createElement(CalendarClock, { size: 18 }), labelKey: 'nav.v3Appointment', roles: ['护士', '管理员'] },
      { path: '/appointment-management', icon: React.createElement(Settings, { size: 18 }), labelKey: 'nav.appointmentManage', roles: ['护士', '管理员'] },
      { path: '/queue-call', icon: React.createElement(ListOrdered, { size: 18 }), labelKey: 'nav.queueCall', roles: ['护士', '技师', '管理员'] },
      { path: '/follow-up', icon: React.createElement(UserCheck, { size: 18 }), labelKey: 'nav.followUp', roles: ['医生', '主任', '管理员'] },
    ],
  },
  {
    section: 'nav.reportManagement',
    items: [
      { path: '/reports', icon: React.createElement(FileText, { size: 18 }), labelKey: 'nav.reportList', roles: ['医生', '管理员'] },
      { path: '/report-write-v2', icon: React.createElement(FileEdit, { size: 18 }), labelKey: 'nav.writeReportV2', roles: ['医生', '管理员'] },
      { path: '/report-write-v3', icon: React.createElement(FileEdit, { size: 18 }), labelKey: 'nav.writeReportV3', roles: ['医生', '管理员'] },
      { path: '/critical-value', icon: React.createElement(AlertOctagon, { size: 18 }), labelKey: 'nav.criticalValue', roles: ['医生', '主任', '管理员'] },
      { path: '/v3/critical-value', icon: React.createElement(AlertOctagon, { size: 18 }), labelKey: 'nav.v3CriticalValue', roles: ['医生', '主任', '管理员'] },
      { path: '/consultation', icon: React.createElement(MessageSquare, { size: 18 }), labelKey: 'nav.consultation', roles: ['医生', '主任', '管理员'] },
      { path: '/report-review', icon: React.createElement(ClipboardCheck, { size: 18 }), labelKey: 'nav.reportReview', roles: ['医生', '主任', '管理员'] },
      { path: '/v3/report-review', icon: React.createElement(ClipboardCheck, { size: 18 }), labelKey: 'nav.v3ReportReview', roles: ['医生', '主任', '管理员'] },
      { path: '/report-revisions', icon: React.createElement(History, { size: 18 }), labelKey: 'nav.reportRevisions', roles: ['医生', '主任', '管理员'] },
      { path: '/collaboration', icon: React.createElement(Users, { size: 18 }), labelKey: 'nav.collaboration', roles: ['医生', '主任', '管理员'] },
      { path: '/keyword-check', icon: React.createElement(Search, { size: 18 }), labelKey: 'nav.keywordCheck', roles: ['医生', '主任', '管理员'] },
      { path: '/report-score-rule', icon: React.createElement(Sliders, { size: 18 }), labelKey: 'nav.scoreRule', roles: ['主任', '管理员'] },
      { path: '/report-defect-library', icon: React.createElement(AlertOctagon, { size: 18 }), labelKey: 'nav.defectLibrary', roles: ['主任', '管理员'] },
      { path: '/ai-report-draft', icon: React.createElement(Wand2, { size: 18 }), labelKey: 'nav.aiReportDraft', roles: ['医生', '主任', '管理员'] },
      { path: '/critical-value-rule', icon: React.createElement(Settings, { size: 18 }), labelKey: 'nav.cvRule', roles: ['主任', '管理员'] },
      { path: '/critical-value-stats', icon: React.createElement(BarChart3, { size: 18 }), labelKey: 'nav.cvStats', roles: ['主任', '管理员'] },
      { path: '/special-assessment', icon: React.createElement(Award, { size: 18 }), labelKey: 'nav.specialAssessment', roles: ['医生', '主任', '管理员'] },
      { path: '/report-export', icon: React.createElement(Download, { size: 18 }), labelKey: 'nav.reportExport', roles: ['医生', '主任', '管理员'] },
      { path: '/report-delivery', icon: React.createElement(Send, { size: 18 }), labelKey: 'nav.reportDelivery', roles: ['医生', '主任', '管理员'] },
      { path: '/patient-report-portal', icon: React.createElement(Smartphone, { size: 18 }), labelKey: 'nav.patientPortal', roles: ['医生', '主任', '管理员'] },
      { path: '/ca-signature', icon: React.createElement(Stamp, { size: 18 }), labelKey: 'nav.caSignature', roles: ['主任', '管理员'] },
      { path: '/blockchain-proof', icon: React.createElement(Link2, { size: 18 }), labelKey: 'nav.blockchainProof', roles: ['主任', '管理员'] },
    ],
  },
  {
    section: 'nav.imagingPrint',
    items: [
      { path: '/dicom-viewer', icon: React.createElement(Activity, { size: 18 }), labelKey: 'nav.dicomBrowser', roles: ['医生', '技师', '管理员'] },
      { path: '/print-management', icon: React.createElement(Printer, { size: 18 }), labelKey: 'nav.filmPrint', roles: ['技师', '管理员'] },
      { path: '/ai-assist', icon: React.createElement(Cpu, { size: 18 }), labelKey: 'nav.aiAssist', roles: ['医生', '技师', '管理员'] },
      { path: '/v3/ai-assist', icon: React.createElement(Cpu, { size: 18 }), labelKey: 'nav.v3AIAssist', roles: ['医生', '技师', '管理员'] },
    ],
  },
  {
    section: 'nav.aiIntelligence',
    items: [
      { path: '/ai-qc', icon: React.createElement(Zap, { size: 18 }), labelKey: 'nav.aiQc', roles: ['医生', '技师', '主任', '管理员'] },
      { path: '/ai-structured-report', icon: React.createElement(FileText, { size: 18 }), labelKey: 'nav.aiStructuredReport', roles: ['医生', '管理员'] },
      { path: '/ai-medical-device', icon: React.createElement(Cpu, { size: 18 }), labelKey: 'nav.aiMedicalDevice', roles: ['医生', '技师', '主任', '管理员'] },
    ],
  },
  {
    section: 'nav.qualityControl',
    items: [
      { path: '/qc', icon: React.createElement(ShieldCheck, { size: 18 }), labelKey: 'nav.imageQc', roles: ['医生', '技师', '主任', '管理员'] },
      { path: '/equipment-efficiency', icon: React.createElement(BarChart2, { size: 18 }), labelKey: 'nav.equipmentEfficiency', roles: ['主任', '管理员'] },
      { path: '/typical-cases', icon: React.createElement(GraduationCap, { size: 18 }), labelKey: 'nav.typicalCases', roles: ['医生', '主任', '管理员'] },
      { path: '/finding-library', icon: React.createElement(Database, { size: 18 }), labelKey: 'nav.typicalFindings', roles: ['医生', '技师', '管理员'] },
      { path: '/term-library', icon: React.createElement(BookOpen, { size: 18 }), labelKey: 'nav.reportGlossary', roles: ['医生', '管理员'] },
      { path: '/template-management', icon: React.createElement(FileStack, { size: 18 }), labelKey: 'nav.templateManage', roles: ['医生', '管理员'] },
      { path: '/template-designer', icon: React.createElement(FileStack, { size: 18 }), labelKey: 'nav.templateDesigner', roles: ['医生', '管理员'] },
      { path: '/template-inheritance', icon: React.createElement(FileStack, { size: 18 }), labelKey: 'nav.templateInheritance', roles: ['医生', '管理员'] },
      { path: '/template-category', icon: React.createElement(FileStack, { size: 18 }), labelKey: 'nav.templateCategory', roles: ['医生', '管理员'] },
      { path: '/term-synonym-graph', icon: React.createElement(Network, { size: 18 }), labelKey: 'nav.termSynonymGraph', roles: ['医生', '管理员'] },
      { path: '/report-phrase-bank', icon: React.createElement(BookOpen, { size: 18 }), labelKey: 'nav.phraseBank', roles: ['医生', '管理员'] },
    ],
  },
  {
    section: 'nav.regionalCoordination',
    items: [
      { path: '/regional-imaging', icon: React.createElement(Network, { size: 18 }), labelKey: 'nav.regionalImaging', roles: ['医生', '主任', '管理员'] },
      { path: '/regional-report', icon: React.createElement(FileText, { size: 18 }), labelKey: 'nav.regionalReport', roles: ['医生', '主任', '管理员'] },
      { path: '/schedule', icon: React.createElement(CalendarClock, { size: 18 }), labelKey: 'nav.departmentSchedule', roles: ['技师', '管理员'] },
      { path: '/department', icon: React.createElement(UsersRound, { size: 18 }), labelKey: 'nav.departmentManage', roles: ['主任', '管理员'] },
    ],
  },
  {
    section: 'nav.patientService',
    items: [
      { path: '/cancer-screen', icon: React.createElement(Shield, { size: 18 }), labelKey: 'nav.cancerScreen', roles: ['医生', '主任', '管理员'] },
      { path: '/patient-portal', icon: React.createElement(UserCircle, { size: 18 }), labelKey: 'nav.patientImageQuery', roles: ['医生', '护士', '管理员'] },
      { path: '/clinical-data', icon: React.createElement(Database, { size: 18 }), labelKey: 'nav.clinicalData', roles: ['医生', '主任', '管理员'] },
    ],
  },
  {
    section: 'nav.dataAnalysis',
    items: [
      { path: '/statistics', icon: React.createElement(TrendingUp, { size: 18 }), labelKey: 'nav.statistics', roles: ['医生', '主任', '管理员'] },
      { path: '/v3/statistics', icon: React.createElement(TrendingUp, { size: 18 }), labelKey: 'nav.v3Statistics', roles: ['医生', '主任', '管理员'] },
      { path: '/green-it', icon: React.createElement(Leaf, { size: 18 }), labelKey: 'nav.greenIt', roles: ['医生', '主任', '管理员'] },
      { path: '/department-dashboard', icon: React.createElement(Gauge, { size: 18 }), labelKey: 'nav.departmentDashboard', roles: ['主任', '管理员'] },
      { path: '/v3/director-dashboard', icon: React.createElement(Gauge, { size: 18 }), labelKey: 'nav.v3DirectorDashboard', roles: ['主任', '管理员'] },
      { path: '/operations-center', icon: React.createElement(Monitor, { size: 18 }), labelKey: 'nav.operationsCenter', roles: ['主任', '管理员'] },
      { path: '/cost-analysis', icon: React.createElement(DollarSign, { size: 18 }), labelKey: 'nav.costAnalysis', roles: ['主任', '管理员'] },
      { path: '/stats-report', icon: React.createElement(BarChart3, { size: 18 }), labelKey: 'nav.dataStats', roles: ['主任', '管理员'] },
      { path: '/nuclear-stats', icon: React.createElement(Radio, { size: 18 }), labelKey: 'nav.nuclearStats', roles: ['医生', '主任', '管理员'] },
      { path: '/report-kpi-dashboard', icon: React.createElement(BarChart3, { size: 18 }), labelKey: 'nav.kpiDashboard', roles: ['主任', '管理员'] },
      { path: '/doctor-workload', icon: React.createElement(Users, { size: 18 }), labelKey: 'nav.doctorWorkload', roles: ['主任', '管理员'] },
      { path: '/diagnosis-accuracy', icon: React.createElement(Target, { size: 18 }), labelKey: 'nav.diagnosisAccuracy', roles: ['主任', '管理员'] },
      { path: '/report-timeliness', icon: React.createElement(Clock, { size: 18 }), labelKey: 'nav.reportTimeliness', roles: ['医生', '主任', '管理员'] },
      { path: '/report-search', icon: React.createElement(Search, { size: 18 }), labelKey: 'nav.reportSearch', roles: ['医生', '主任', '管理员'] },
      { path: '/v3/stats-dashboard-v2', icon: React.createElement(BarChart3, { size: 18 }), labelKey: 'nav.statsDashboardV2', roles: ['主任', '管理员'] },
    ],
  },
  {
    section: 'nav.securityCompliance',
    items: [
      { path: '/v3/compliance', icon: React.createElement(Shield, { size: 18 }), labelKey: 'nav.complianceDashboard', roles: ['主任', '管理员'] },
    ],
  },
  {
    section: 'nav.dataReport',
    items: [
      { path: '/national-report', icon: React.createElement(ShieldAlert, { size: 18 }), labelKey: 'nav.nationalReport', roles: ['主任', '管理员'] },
      { path: '/data-report-center', icon: React.createElement(Database, { size: 18 }), labelKey: 'nav.dataReportCenter', roles: ['主任', '管理员'] },
      { path: '/insurance-audit', icon: React.createElement(ShieldCheck, { size: 18 }), labelKey: 'nav.insuranceAudit', roles: ['主任', '管理员'] },
    ],
  },
  {
    section: 'nav.systemManage',
    items: [
      { path: '/authority', icon: React.createElement(Shield, { size: 18 }), labelKey: 'nav.authority', roles: ['管理员'] },
      { path: '/dictionary', icon: React.createElement(BookOpen, { size: 18 }), labelKey: 'nav.dataDictionary', roles: ['管理员'] },
      { path: '/operation-log', icon: React.createElement(ScrollText, { size: 18 }), labelKey: 'nav.operationLog', roles: ['医生', '管理员', '主任'] },
      { path: '/audit', icon: React.createElement(FileText, { size: 18 }), labelKey: 'nav.auditLog', roles: ['管理员', '主任'] },
      { path: '/notification-center', icon: React.createElement(Bell, { size: 18 }), labelKey: 'nav.notification', roles: ['医生', '技师', '护士', '管理员', '主任'] },
      { path: '/system/dicom-print', icon: React.createElement(Printer, { size: 18 }), labelKey: 'nav.dicomPrint', roles: ['技师', '管理员'] },
    ],
  },
  {
    section: 'nav.equipmentMaterials',
    items: [
      { path: '/equipment-lifecycle', icon: React.createElement(Cpu, { size: 18 }), labelKey: 'nav.equipmentLifecycle', roles: ['技师', '主任', '管理员'] },
      { path: '/v3/devices', icon: React.createElement(Cpu, { size: 18 }), labelKey: 'nav.v3Devices', roles: ['技师', '管理员'] },
      { path: '/device-fault', icon: React.createElement(Wrench, { size: 18 }), labelKey: 'nav.faultRegister', roles: ['技师', '管理员'] },
      { path: '/materials', icon: React.createElement(Package, { size: 18 }), labelKey: 'nav.materialsManage', roles: ['护士', '管理员'] },
      { path: '/supplies', icon: React.createElement(Package, { size: 18 }), labelKey: 'nav.radiologyMaterials', roles: ['技师', '管理员'] },
      { path: '/dose-track', icon: React.createElement(Activity, { size: 18 }), labelKey: 'nav.doseTrack', roles: ['医生', '技师', '主任', '管理员'] },
    ],
  },
]
