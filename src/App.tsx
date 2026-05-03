import React from 'react'
// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 v0.9.0
// 参照GE Centricity/东软RIS/联影系统界面设计
// 端口: 5191
// 汉东省人民医院放射科
// ============================================================
import { useState, lazy, Suspense, createContext, useContext } from 'react'
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
  MessageSquare, TrendingUp, DollarSign, Gauge, FileStack, Wrench, Settings
} from 'lucide-react'

const HomePage = lazy(() => import('./pages/HomePage'))
const PatientPage = lazy(() => import('./pages/PatientPage'))
const ExamPage = lazy(() => import('./pages/ExamPage'))
const ReportPage = lazy(() => import('./pages/ReportPage'))
const ReportWritePage = lazy(() => import('./pages/ReportWritePage'))
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
const AppointmentManagementPage = lazy(() => import('./pages/AppointmentManagementPage'))
const DeviceFaultPage = lazy(() => import('./pages/DeviceFaultPage'))
const AIQCPage = lazy(() => import('./pages/AIQCPage'))
const AIStructuredReportPage = lazy(() => import('./pages/AIStructuredReportPage'))
const RegionalImagingPage = lazy(() => import('./pages/RegionalImagingPage'))
const EquipmentEfficiencyPage = lazy(() => import('./pages/EquipmentEfficiencyPage'))
const SuppliesPage = lazy(() => import('./pages/SuppliesPage'))
const PatientPortalPage = lazy(() => import('./pages/PatientPortalPage'))

import { initialUsers, initialModalityDevices, initialExamRooms } from './data/initialData'

// v0.9.0 新增图标
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
  { section: 'AI智能（v0.9.0）', items: [
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
  { section: '区域协同（v0.9.0）', items: [
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
    { path: '/department-dashboard', icon: <Gauge size={18} />, label: '科室看板', roles: ['主任','管理员'] },
    { path: '/operations-center', icon: <Monitor size={18} />, label: '运营指挥中心', roles: ['主任','管理员'] },
    { path: '/cost-analysis', icon: <DollarSign size={18} />, label: '成本效益分析', roles: ['主任','管理员'] },
    { path: '/stats-report', icon: <BarChart3 size={18} />, label: '数据统计', roles: ['主任','管理员'] },
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

// ============================================================
// F1-F12 快捷键功能映射
// ============================================================
const KEYBOARD_SHORTCUTS = [
  { key: 'F1', label: '帮助', icon: '❓', action: 'showHelp' },
  { key: 'F2', label: '语音', icon: '🎤', action: 'voiceInput' },
  { key: 'F3', label: '刷新', icon: '🔄', action: 'refresh' },
  { key: 'F4', label: '模板', icon: '📋', action: 'template' },
  { key: 'F5', label: '填充', icon: '✏️', action: 'autoFill' },
  { key: 'F6', label: '保存', icon: '💾', action: 'save' },
  { key: 'F7', label: '提交', icon: '📤', action: 'submit' },
  { key: 'F8', label: '时限', icon: '⏱️', action: 'timeLimit' },
  { key: 'F9', label: '完整度', icon: '📊', action: 'completeness' },
  { key: 'F10', label: '历史', icon: '📜', action: 'history' },
  { key: 'F11', label: '打印', icon: '🖨️', action: 'print' },
  { key: 'F12', label: '设置', icon: '⚙️', action: 'settings' },
]

// ============================================================
// AppContent: 路由和布局逻辑放在 BrowserRouter 内部
// ============================================================
function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activePath, setActivePath] = useState('/')
  const [showToolbar, setShowToolbar] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const handleNav = (path: string) => {
    setActivePath(path)
    navigate(path)
  }

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path))

  // F1-F12 快捷键处理
  const handleShortcut = (action: string) => {
    switch (action) {
      case 'showHelp': alert('帮助文档：\nF1-帮助 | F2-语音输入 | F3-刷新\nF4-模板选择 | F5-自动填充 | F6-保存\nF7-提交报告 | F8-时限设置 | F9-完整度检查\nF10-历史记录 | F11-打印 | F12-系统设置'); break
      case 'voiceInput': alert('语音输入模式已开启'); break
      case 'refresh': window.location.reload(); break
      case 'template': navigate('/template-management'); break
      case 'autoFill': alert('自动填充功能'); break
      case 'save': alert('报告已保存'); break
      case 'submit': alert('报告已提交'); break
      case 'timeLimit': alert('时限设置面板'); break
      case 'completeness': alert('完整度检查：98%'); break
      case 'history': navigate('/operation-log'); break
      case 'print': window.print(); break
      case 'settings': navigate('/authority'); break
    }
  }

  // 键盘事件监听
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') { e.preventDefault(); handleShortcut('showHelp'); }
      if (e.key === 'F2') { e.preventDefault(); handleShortcut('voiceInput'); }
      if (e.key === 'F3') { e.preventDefault(); handleShortcut('refresh'); }
      if (e.key === 'F4') { e.preventDefault(); handleShortcut('template'); }
      if (e.key === 'F5') { e.preventDefault(); handleShortcut('autoFill'); }
      if (e.key === 'F6') { e.preventDefault(); handleShortcut('save'); }
      if (e.key === 'F7') { e.preventDefault(); handleShortcut('submit'); }
      if (e.key === 'F8') { e.preventDefault(); handleShortcut('timeLimit'); }
      if (e.key === 'F9') { e.preventDefault(); handleShortcut('completeness'); }
      if (e.key === 'F10') { e.preventDefault(); handleShortcut('history'); }
      if (e.key === 'F11') { e.preventDefault(); handleShortcut('print'); }
      if (e.key === 'F12') { e.preventDefault(); handleShortcut('settings'); }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f172a' }}>
      {/* 侧边栏 */}
      <aside style={{
        width: sidebarOpen ? 230 : 60,
        minWidth: sidebarOpen ? 230 : 60,
        background: '#1a3a5c',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s',
        overflow: 'hidden',
        borderRight: '1px solid #334155',
      }}>
        {/* Logo */}
        <div style={{ padding: '16px 14px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Radio size={18} color="#fff" />
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3 }}>005放射信息系统</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>v0.9.0 · 智慧影像</div>
            </div>
          )}
        </div>

        {/* 导航菜单 */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {SIDEBAR_ITEMS.map(section => (
            <div key={section.section} style={{ marginBottom: 6 }}>
              {sidebarOpen && (
                <div style={{ padding: '8px 16px 4px', fontSize: 14, fontWeight: 700, color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {section.section}
                </div>
              )}
              {section.items
                .filter(item => (item.roles as string[]).includes(currentUser.role))
                .map(item => {
                  const active = isActive(item.path)
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNav(item.path)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 14px',
                        margin: '1px 6px',
                        borderRadius: 6,
                        border: 'none',
                        borderLeft: active ? '4px solid #4ade80' : '4px solid transparent',
                        cursor: 'pointer',
                        background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                        color: '#ffffff',
                        fontSize: 20,
                        fontWeight: active ? 700 : 500,
                        textAlign: 'left',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; }}
                      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                    >
                      <span style={{ flexShrink: 0 }}>{item.icon}</span>
                      {sidebarOpen && <span>{item.label}</span>}
                    </button>
                  )
                })
              }
            </div>
          ))}
        </nav>

        {/* 底部折叠按钮 */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            margin: 8, padding: '8px', borderRadius: 8, border: '1px solid #334155',
            background: '#0f172a', color: '#64748b', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12,
          }}>
          {sidebarOpen ? <><X size={14} /> 收起</> : <><Menu size={14} /> 展开</>}
        </button>
      </aside>

      {/* 主内容区 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* 顶部栏 */}
        <header style={{
          height: 52, background: '#1e293b', borderBottom: '1px solid #334155',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, color: '#f1f5f9', fontWeight: 600 }}>汉东省人民医院 · 放射科信息系统</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
              <Wifi size={14} style={{ color: '#22c55e' }} />
              <span>系统正常</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
              <Bell size={14} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: '#0f172a', borderRadius: 6 }}>
              <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{currentUser.name.slice(0, 1)}</span>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9', lineHeight: 1.3 }}>{currentUser.name}</div>
                <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.3 }}>{currentUser.title || currentUser.role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* F1-F12 快捷键工具栏 - 深蓝背景白字≥16px */}
        {showToolbar && (
          <div style={{
            background: '#1e3a5f',
            borderBottom: '2px solid #0f172a',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px 12px',
            gap: 4,
            flexShrink: 0,
          }}>
            {KEYBOARD_SHORTCUTS.map(shortcut => (
              <div key={shortcut.key} style={{ position: 'relative' }}>
                <button
                  onClick={() => handleShortcut(shortcut.action)}
                  onMouseEnter={(e) => {
                    setActiveTooltip(shortcut.key);
                    (e.currentTarget as HTMLButtonElement).style.background = '#2d4a6f';
                  }}
                  onMouseLeave={(e) => {
                    setActiveTooltip(null);
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '6px 10px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#60a5fa' }}>{shortcut.key}</span>
                  <span style={{ fontSize: 17 }}>{shortcut.icon}</span>
                  <span>{shortcut.label}</span>
                </button>
                {/* 工具提示 */}
                {activeTooltip === shortcut.key && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: 4,
                    padding: '6px 10px',
                    background: '#0f172a',
                    color: '#ffffff',
                    fontSize: 12,
                    borderRadius: 4,
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}>
                    {shortcut.key} - {shortcut.label}
                  </div>
                )}
              </div>
            ))}
            {/* 关闭工具栏按钮 */}
            <button
              onClick={() => setShowToolbar(false)}
              style={{
                marginLeft: 8,
                padding: '6px 10px',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* 未显示工具栏时的恢复按钮 */}
        {!showToolbar && (
          <div style={{
            background: '#1e3a5f',
            padding: '4px 12px',
            display: 'flex',
            alignItems: 'center',
          }}>
            <button
              onClick={() => setShowToolbar(true)}
              style={{
                padding: '4px 12px',
                background: '#2d4a6f',
                border: 'none',
                borderRadius: 4,
                color: '#ffffff',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              显示快捷工具栏 (F12)
            </button>
          </div>
        )}

        {/* 页面内容 */}
        <div style={{ flex: 1, overflow: 'auto', background: '#f8fafc' }}>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/worklist" element={<WorklistPage />} />
              <Route path="/appointments" element={<AppointmentPage />} />
              <Route path="/patients" element={<PatientPage />} />
              <Route path="/exams" element={<ExamPage />} />
              <Route path="/reports" element={<ReportPage />} />
              <Route path="/report-write" element={<ReportWritePage />} />
              <Route path="/report-write/:examId" element={<ReportWritePage />} />
              <Route path="/critical-value" element={<CriticalValuePage />} />
              <Route path="/consultation" element={<ConsultationPage />} />
              <Route path="/qc" element={<QCPage />} />
              <Route path="/term-library" element={<TermLibraryPage />} />
              <Route path="/devices" element={<DevicePage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/dose-track" element={<DoseTrackPage />} />
              <Route path="/queue-call" element={<QueueCallPage />} />
              <Route path="/dicom-viewer" element={<DicomViewerPage />} />
              <Route path="/finding-library" element={<FindingLibraryPage />} />
              <Route path="/typical-cases" element={<TypicalCasesPage />} />
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
