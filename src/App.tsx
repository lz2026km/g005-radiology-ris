// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 v0.4.0
// 整合东软/联影/GE/锐科/岱嘉五大竞品优秀功能
// 端口: 5191
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
  Monitor, TestTube, Radio, Cpu, Wifi, Printer, ListChecks
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

import { initialUsers, initialModalityDevices, initialExamRooms } from './data/initialData'

// 侧边栏配置
const SIDEBAR_ITEMS = [
  { section: '工作台', items: [
    { path: '/', icon: <LayoutDashboard size={18} />, label: '首页概览', roles: ['医生','技师','护士','管理员','主任'] },
    { path: '/worklist', icon: <ListChecks size={18} />, label: '检查工作列表', roles: ['医生','技师','护士','管理员'] },
    { path: '/appointments', icon: <CalendarClock size={18} />, label: '检查预约', roles: ['护士','管理员'] },
    { path: '/patients', icon: <Users size={18} />, label: '患者管理', roles: ['医生','技师','护士','管理员'] },
    { path: '/exams', icon: <Scan size={18} />, label: '检查记录', roles: ['医生','技师','管理员'] },
  ]},
  { section: '报告管理', items: [
    { path: '/reports', icon: <FileText size={18} />, label: '报告列表', roles: ['医生','管理员'] },
    { path: '/report-write', icon: <Activity size={18} />, label: '书写报告', roles: ['医生','管理员'] },
    { path: '/critical-value', icon: <ShieldAlert size={18} />, label: '危急值管理', roles: ['医生','主任'] },
    { path: '/consultation', icon: <Radio size={18} />, label: '会诊管理', roles: ['医生','主任'] },
  ]},
  { section: '质控与规范', items: [
    { path: '/qc', icon: <ShieldCheck size={18} />, label: '影像质控', roles: ['医生','技师','主任'] },
    { path: '/term-library', icon: <BookOpen size={18} />, label: '报告词库', roles: ['医生','管理员'] },
    { path: '/finding-library', icon: <Database size={18} />, label: '典型征象库', roles: ['医生','技师'] },
    { path: '/typical-cases', icon: <GraduationCap size={18} />, label: '典型病例库', roles: ['医生','主任'] },
  ]},
  { section: '教学与会诊', items: [
    { path: '/consultation', icon: <Radio size={18} />, label: '会诊管理', roles: ['医生','主任'] },
  ]},
  { section: '系统管理', items: [
    { path: '/operation-log', icon: <FileText size={18} />, label: '操作日志', roles: ['医生','管理员','主任'] },
    { path: '/notification-center', icon: <Bell size={18} />, label: '通知中心', roles: ['医生','技师','护士','管理员','主任'] },
  ]},
  { section: '设备与统计', items: [
    { path: '/devices', icon: <Monitor size={18} />, label: '设备管理', roles: ['技师','管理员'] },
    { path: '/statistics', icon: <BarChart3 size={18} />, label: '统计分析', roles: ['医生','主任','管理员'] },
    { path: '/dose-track', icon: <Activity size={18} />, label: '剂量追踪', roles: ['医生','技师','主任','管理员'] },
    { path: '/queue-call', icon: <Monitor size={18} />, label: '排队叫号', roles: ['护士','技师','管理员'] },
    { path: '/dicom-viewer', icon: <Activity size={18} />, label: 'DICOM浏览', roles: ['医生','技师'] },
  ]},
]

const currentUser = { ...initialUsers[0], role: '医生' } // 李明辉 - 主任医师

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
// AppContent: 路由和布局逻辑放在 BrowserRouter 内部
// ============================================================
function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activePath, setActivePath] = useState('/')
  const navigate = useNavigate()
  const location = useLocation()

  const handleNav = (path: string) => {
    setActivePath(path)
    navigate(path)
  }

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path))

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f172a' }}>
      {/* 侧边栏 */}
      <aside style={{
        width: sidebarOpen ? 230 : 60,
        minWidth: sidebarOpen ? 230 : 60,
        background: '#1e293b',
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
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3 }}>放射科RIS</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>v0.1.0 · 智慧影像</div>
            </div>
          )}
        </div>

        {/* 用户信息 */}
        {sidebarOpen && (
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #334155', background: '#0f172a' }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>当前用户</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{currentUser.name}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{currentUser.title || currentUser.role} · {currentUser.specialty || currentUser.department}</div>
          </div>
        )}

        {/* 导航菜单 */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {SIDEBAR_ITEMS.map(section => (
            <div key={section.section} style={{ marginBottom: 6 }}>
              {sidebarOpen && (
                <div style={{ padding: '6px 16px 4px', fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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
                        cursor: 'pointer',
                        background: active ? 'linear-gradient(135deg, #1d4ed8, #1e40af)' : 'transparent',
                        color: active ? '#f1f5f9' : '#94a3b8',
                        fontSize: 13,
                        fontWeight: active ? 600 : 400,
                        textAlign: 'left',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = '#334155'; (e.currentTarget as HTMLButtonElement).style.color = '#e2e8f0' }}
                      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8' }}
                    >
                      <span style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }}>{item.icon}</span>
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
            <span style={{ fontSize: 14, color: '#f1f5f9', fontWeight: 600 }}>上海市第一人民医院 · 放射科信息系统</span>
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
