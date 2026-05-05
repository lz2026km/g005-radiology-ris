import React from 'react'
// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 v0.15.2
// 参照GE Centricity/东软RIS/联影系统界面设计
// 端口: 5179
// 汉东省人民医院放射科
// ============================================================
import { useState, Suspense, createContext, useContext } from 'react'
import { Routes, Route, Navigate, BrowserRouter, useNavigate, useLocation } from 'react-router-dom'

const NavigateCtx = createContext<(path: string) => void>(() => {})
export const useNav = () => useContext(NavigateCtx)

import {
  LayoutDashboard, Users, CalendarClock, Activity, FileText,
  ShieldCheck, BarChart3, ClipboardCheck, BookOpen, Shield,
  Menu, X, Stethoscope, LogOut, Bell, Package, ShieldAlert,
  AlertTriangle, Camera, UserCheck, AlertCircle, GraduationCap,
  UsersRound, Database, Scan, Heart, Thermometer, Droplets,
  Monitor, TestTube, Radio, Cpu, Wifi, Printer, ListChecks,
  ClipboardList, ListOrdered, ScrollText, FileEdit, AlertOctagon,
  MessageSquare, TrendingUp, DollarSign, Gauge, FileStack, Wrench, Settings,
  Leaf
} from 'lucide-react'

// 【v0.15.2】全部53个页面静态导入（修复懒加载白屏问题）
import HomePage from './pages/HomePage'
import PatientPage from './pages/PatientPage'
import ExamPage from './pages/ExamPage'
import ReportPage from './pages/ReportPage'
import ReportWritePage from './pages/ReportWritePage'
import WorklistPage from './pages/WorklistPage'
import StatisticsPage from './pages/StatisticsPage'
import CriticalValuePage from './pages/CriticalValuePage'
import TermLibraryPage from './pages/TermLibraryPage'
import DevicePage from './pages/DevicePage'
import ConsultationPage from './pages/ConsultationPage'
import QCPage from './pages/QCPage'
import AppointmentPage from './pages/AppointmentPage'
import DoseTrackPage from './pages/DoseTrackPage'
import QueueCallPage from './pages/QueueCallPage'
import DicomViewerPage from './pages/DicomViewerPage'
import TypicalCasesPage from './pages/TypicalCasesPage'
import FindingLibraryPage from './pages/FindingLibraryPage'
import OperationLogPage from './pages/OperationLogPage'
import NotificationCenter from './pages/NotificationCenter'
import SchedulePage from './pages/SchedulePage'
import DepartmentPage from './pages/DepartmentPage'
import MaterialsPage from './pages/MaterialsPage'
import PrintManagementPage from './pages/PrintManagementPage'
import RegionalReportPage from './pages/RegionalReportPage'
import AIAssistPage from './pages/AIAssistPage'
import AuditPage from './pages/AuditPage'
import AuthorityPage from './pages/AuthorityPage'
import CostAnalysisPage from './pages/CostAnalysisPage'
import EquipmentLifecyclePage from './pages/EquipmentLifecyclePage'
import FollowUpPage from './pages/FollowUpPage'
import CancerScreenPage from './pages/CancerScreenPage'
import NationalReportPage from './pages/NationalReportPage'
import InsuranceAuditPage from './pages/InsuranceAuditPage'
import DataReportCenterPage from './pages/DataReportCenterPage'
import DictionaryPage from './pages/DictionaryPage'
import OperationsCenterPage from './pages/OperationsCenterPage'
import DepartmentDashboardPage from './pages/DepartmentDashboardPage'
import StatsReportPage from './pages/StatsReportPage'
import ClinicalDataPage from './pages/ClinicalDataPage'
import TemplateManagementPage from './pages/TemplateManagementPage'
import AppointmentManagementPage from './pages/AppointmentManagementPage'
import DeviceFaultPage from './pages/DeviceFaultPage'
import AIQCPage from './pages/AIQCPage'
import AIStructuredReportPage from './pages/AIStructuredReportPage'
import RegionalImagingPage from './pages/RegionalImagingPage'
import EquipmentEfficiencyPage from './pages/EquipmentEfficiencyPage'
import SuppliesPage from './pages/SuppliesPage'
import PatientPortalPage from './pages/PatientPortalPage'
import DirectorDashboardPage from './pages/DirectorDashboardPage'
import GreenITPage from './pages/GreenITPage'
import ResearchPage from './pages/ResearchPage'
import DicomPrintPage from './pages/System/DicomPrintPage'
import NuclearStatsPage from './pages/NuclearStatsPage'

import { initialUsers, initialModalityDevices, initialExamRooms } from './data/initialData'

// v0.15.2 最新版本
import { Zap, Network, BarChart2, Package as PackageIcon2, UserCircle } from 'lucide-react'

// 侧边栏配置 - v0.7.1 按工作流程重排
const SIDEBAR_ITEMS = [
  { section: '工作台', items: [
    { path: '/', icon: <LayoutDashboard size={18} />, label: '首页概览', roles: ['医生','技师','护士','管理员','主任'] },
    { path: '/worklist', icon: <ListChecks size={18} />, label: '检查工作列表', roles: ['医生','技师','护士','管理员'] },
    { path: '/exams', icon: <ClipboardList size={18} />, label: '检查记录', roles: ['医生','技师','管理员'] },
  ]},
  { section: '患者管理', items: [
    { path: '/patients', icon: <Users size={18} />, label: '患者管理', roles: ['医生','技师','护士','管理员'] },
    { path: '/appointments', icon: <CalendarClock size={18} />, label: '检查预约', roles: ['护士','管理员'] },
    { path: '/appointment-management', icon: <Settings size={18} />, label: '预约管理', roles: ['护士','管理员'] },
    { path: '/queue-call', icon: <ListOrdered size={18} />, label: '排队叫号', roles: ['护士','技师','管理员'] },
    { path: '/follow-up', icon: <UserCheck size={18} />, label: '随访管理', roles: ['医生','主任','管理员'] },
  ]},
  { section: '报告管理', items: [
    { path: '/reports', icon: <FileText size={18} />, label: '报告列表', roles: ['医生','管理员'] },
    { path: '/report-write', icon: <FileEdit size={18} />, label: '书写报告', roles: ['医生','管理员'] },
    { path: '/critical-value', icon: <AlertOctagon size={18} />, label: '危急值管理', roles: ['医生','主任','管理员'] },
    { path: '/consultation', icon: <MessageSquare size={18} />, label: '会诊管理', roles: ['医生','主任','管理员'] },
  ]},
  { section: '影像与打印', items: [
    { path: '/dicom-viewer', icon: <Activity size={18} />, label: 'DICOM浏览', roles: ['医生','技师','管理员'] },
    { path: '/print-management', icon: <Printer size={18} />, label: '胶片打印', roles: ['技师','管理员'] },
    { path: '/ai-assist', icon: <Cpu size={18} />, label: 'AI辅助诊断', roles: ['医生','技师','管理员'] },
  ]},
  { section: 'AI智能', items: [
    { path: '/ai-qc', icon: <Zap size={18} />, label: 'AI影像质控', roles: ['医生','技师','主任','管理员'] },
    { path: '/ai-structured-report', icon: <FileText size={18} />, label: 'AI结构化报告', roles: ['医生','管理员'] },
  ]},
  { section: '质量控制', items: [
    { path: '/qc', icon: <ShieldCheck size={18} />, label: '影像质控', roles: ['医生','技师','主任','管理员'] },
    { path: '/equipment-efficiency', icon: <BarChart2 size={18} />, label: '设备效率分析', roles: ['主任','管理员'] },
    { path: '/typical-cases', icon: <GraduationCap size={18} />, label: '典型病例库', roles: ['医生','主任','管理员'] },
    { path: '/finding-library', icon: <Database size={18} />, label: '典型征象库', roles: ['医生','技师','管理员'] },
    { path: '/term-library', icon: <BookOpen size={18} />, label: '报告词库', roles: ['医生','管理员'] },
    { path: '/template-management', icon: <FileStack size={18} />, label: '模板管理', roles: ['医生','管理员'] },
  ]},
  { section: '区域协同', items: [
    { path: '/regional-imaging', icon: <Network size={18} />, label: '区域影像协同', roles: ['医生','主任','管理员'] },
    { path: '/regional-report', icon: <FileText size={18} />, label: '区域报告', roles: ['医生','主任','管理员'] },
    { path: '/consultation', icon: <MessageSquare size={18} />, label: '会诊管理', roles: ['医生','主任','管理员'] },
    { path: '/schedule', icon: <CalendarClock size={18} />, label: '科室排班', roles: ['技师','管理员'] },
    { path: '/department', icon: <UsersRound size={18} />, label: '科室管理', roles: ['主任','管理员'] },
  ]},
  { section: '患者服务', items: [
    { path: '/cancer-screen', icon: <Shield size={18} />, label: '早癌筛查', roles: ['医生','主任','管理员'] },
    { path: '/patient-portal', icon: <UserCircle size={18} />, label: '患者影像查询', roles: ['医生','护士','管理员'] },
    { path: '/clinical-data', icon: <Database size={18} />, label: '临床数据中台', roles: ['医生','主任','管理员'] },
  ]},
  { section: '数据分析', items: [
    { path: '/statistics', icon: <TrendingUp size={18} />, label: '统计分析', roles: ['医生','主任','管理员'] },
    { path: '/green-it', icon: <Leaf size={18} />, label: '绿色IT统计', roles: ['医生','主任','管理员'] },
    { path: '/department-dashboard', icon: <Gauge size={18} />, label: '科室看板', roles: ['主任','管理员'] },
    { path: '/operations-center', icon: <Monitor size={18} />, label: '运营指挥中心', roles: ['主任','管理员'] },
    { path: '/cost-analysis', icon: <DollarSign size={18} />, label: '成本效益分析', roles: ['主任','管理员'] },
    { path: '/stats-report', icon: <BarChart3 size={18} />, label: '数据统计', roles: ['主任','管理员'] },
    { path: '/nuclear-stats', icon: <Radio size={18} />, label: '核医学统计', roles: ['医生','主任','管理员'] },
  ]},
  { section: '数据上报', items: [
    { path: '/national-report', icon: <ShieldAlert size={18} />, label: '国家数据上报', roles: ['主任','管理员'] },
    { path: '/data-report-center', icon: <Database size={18} />, label: '数据上报中心', roles: ['主任','管理员'] },
    { path: '/insurance-audit', icon: <ShieldCheck size={18} />, label: '医保审核', roles: ['主任','管理员'] },
  ]},
  { section: '系统管理', items: [
    { path: '/authority', icon: <Shield size={18} />, label: '权限管理', roles: ['管理员'] },
    { path: '/dictionary', icon: <BookOpen size={18} />, label: '数据字典', roles: ['管理员'] },
    { path: '/operation-log', icon: <ScrollText size={18} />, label: '操作日志', roles: ['医生','管理员','主任'] },
    { path: '/audit', icon: <FileText size={18} />, label: '审计日志', roles: ['管理员','主任'] },
    { path: '/notification-center', icon: <Bell size={18} />, label: '通知中心', roles: ['医生','技师','护士','管理员','主任'] },
    { path: '/system/dicom-print', icon: <Printer size={18} />, label: 'DICOM打印', roles: ['技师','管理员'] },
  ]},
  { section: '设备物资', items: [
    { path: '/equipment-lifecycle', icon: <Cpu size={18} />, label: '设备全生命周期', roles: ['技师','主任','管理员'] },
    { path: '/device-fault', icon: <Wrench size={18} />, label: '故障登记', roles: ['技师','管理员'] },
    { path: '/materials', icon: <Package size={18} />, label: '耗材管理', roles: ['护士','管理员'] },
    { path: '/supplies', icon: <PackageIcon2 size={18} />, label: '放射物资管理', roles: ['技师','管理员'] },
    { path: '/dose-track', icon: <Activity size={18} />, label: '剂量追踪', roles: ['医生','技师','主任','管理员'] },
  ]},
]

const currentUser = { ...initialUsers[0], role: '管理员' } // 李明辉 - 主任

function Loading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', color: '#94a3b8', fontSize: 14, gap: 12 }}>
      <div style={{ width: 32, height: 32, border: '3px solid #334155', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      放射RIS系统加载中...
    </div>
  )
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  const filteredItems = SIDEBAR_ITEMS.map(section => ({
    ...section,
    items: section.items.filter(item => item.roles.includes(currentUser.role))
  })).filter(section => section.items.length > 0)

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc' }}>
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
          <div style={{ width: 32, height: 32, background: '#3b82f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Radio size={18} color="#fff" />
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>005放射信息系统</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>v0.15.2 · 智慧影像</div>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {filteredItems.map((section, idx) => (
            <div key={idx} style={{ marginBottom: 16 }}>
              {sidebarOpen && (
                <div style={{ fontSize: 11, color: '#475569', padding: '0 14px', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {section.section}
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
                      color: isActive(item.path) ? '#ffffff' : '#cbd5e1',
                      background: isActive(item.path) ? 'rgba(34,197,94,0.15)' : 'transparent',
                      borderLeft: isActive(item.path) ? '3px solid #22c55e' : '3px solid transparent',
                      fontSize: 16,
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { if (!isActive(item.path)) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                    onMouseLeave={e => { if (!isActive(item.path)) e.currentTarget.style.background = 'transparent' }}
                  >
                    <span style={{ flexShrink: 0 }}>{item.icon}</span>
                    {sidebarOpen && <span>{item.label}</span>}
                  </div>
                </NavigateCtx.Provider>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ padding: '12px 8px', borderTop: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderRadius: 6, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Stethoscope size={14} color="#fff" />
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
          height: 52,
          background: '#1e293b',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 16
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              borderRadius: 4
            }}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span style={{ fontSize: 14, color: '#f1f5f9', fontWeight: 600 }}>
            汉东省人民医院 · 放射科信息系统
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', position: 'relative' }}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }} />
            </button>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>{new Date().toLocaleDateString('zh-CN')}</span>
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
              <Route path="/appointment-management" element={<AppointmentManagementPage />} />
              <Route path="/device-fault" element={<DeviceFaultPage />} />
              <Route path="/ai-qc" element={<AIQCPage />} />
              <Route path="/ai-structured-report" element={<AIStructuredReportPage />} />
              <Route path="/regional-imaging" element={<RegionalImagingPage />} />
              <Route path="/equipment-efficiency" element={<EquipmentEfficiencyPage />} />
              <Route path="/supplies" element={<SuppliesPage />} />
              <Route path="/patient-portal" element={<PatientPortalPage />} />
              <Route path="/director-dashboard" element={<DirectorDashboardPage />} />
              <Route path="/green-it" element={<GreenITPage />} />
              <Route path="/research" element={<ResearchPage />} />
              <Route path="/nuclear-stats" element={<NuclearStatsPage />} />
              <Route path="/system/dicom-print" element={<DicomPrintPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
