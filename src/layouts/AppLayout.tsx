/**
 * G005 放射RIS系统 v3.0.2.9 - AppLayout JSX 重构
 * 侧栏 + 头部 + 主区（从 React.createElement 改为 JSX）
 */
import React, { useState, useEffect, useMemo, createContext, useContext } from 'react'
import { Navigate, useNavigate, useLocation, Routes, Route } from 'react-router-dom'
import { Menu, X, Radio, Activity, Bell } from 'lucide-react'
import { SIDEBAR_ITEMS, type Role } from '../routes/sidebarConfig'
import { t, onLocaleChange, getCurrentLocale, getDirection, type Locale } from '../i18n/appI18n'
import { routes } from '../routes/routeTable'
import { useNetworkStatus } from '../hooks/useNetworkStatus'
import { useAuth } from '../hooks/useAuth'
import { NetworkOfflineBanner } from '../components/feedback/NetworkOfflineBanner'
import ErrorBoundary from '../components/common/ErrorBoundary'

const NavigateCtx = createContext<(path: string) => void>(() => {})
export const useNav = (): ((path: string) => void) => useContext(NavigateCtx)

function Loading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', color: '#94a3b8', fontSize: 14, gap: 12 }}>
      <div style={{ width: 32, height: 32, border: '3px solid #334155', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
      {t('app.loading')}
    </div>
  )
}

function useSidebarItems(role: Role) {
  return useMemo(
    () => SIDEBAR_ITEMS.map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(role)),
    })).filter((section) => section.items.length > 0),
    [role]
  )
}

const s: Record<string, React.CSSProperties> = {
  root: { display: 'flex', height: '100vh', background: '#f8fafc' },
  sidebar: { background: '#1a3a5c', display: 'flex', flexDirection: 'column', borderRight: '1px solid #334155', transition: 'width 0.2s', overflow: 'hidden' },
  logoWrap: { padding: '16px 14px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { width: 32, height: 32, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  nav: { flex: 1, overflowY: 'auto', padding: '8px 0' },
  sectionTitle: (open: boolean): React.CSSProperties => ({
    padding: open ? '8px 16px 4px' : 0,
    fontSize: 14,
    fontWeight: 700,
    color: '#e2e8f0',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  }),
  navItem: (active: boolean, open: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: open ? '9px 14px' : '9px 20px',
    margin: '2px 8px', borderRadius: 6, cursor: 'pointer', color: '#ffffff',
    background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
    borderLeft: active ? '4px solid #22c55e' : '4px solid transparent',
    fontSize: 20, fontWeight: active ? 700 : 500,
    transition: 'all 0.15s', whiteSpace: 'nowrap',
  }),
  collapseBtn: { width: '100%', padding: 8, borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12 },
  userCard: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderRadius: 6, cursor: 'pointer' },
  avatar: { width: 28, height: 28, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { height: 52, background: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0 },
  headerBtn: { background: 'none', border: 'none', color: '#c8ccd4', cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 4 },
  content: { flex: 1, overflow: 'auto', background: '#f8fafc' },
  profileBottom: { padding: '12px 8px', borderTop: '1px solid #334155' },
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [locale, setLocale] = useState<Locale>(getCurrentLocale())
  const navigate = useNavigate()
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path
  const { isOnline } = useNetworkStatus()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => onLocaleChange((l) => setLocale(l)), [])

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const currentUser = user
  const filteredItems = useSidebarItems(currentUser.role as Role)
  const direction = getDirection(locale)

  return (
    <div style={{ ...s.root, direction }}>
      {/* 左侧栏(navigate ctx 在 aside 顶层注入一次,避免每项重建 Provider) */}
      <NavigateCtx.Provider value={navigate}>
      <aside style={{ ...s.sidebar, width: sidebarOpen ? 260 : 60 }}>
        {/* Logo */}
        <div style={s.logoWrap}>
          <div style={s.logoIcon}><Radio size={18} color="#fff" /></div>
          {sidebarOpen && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f2f5' }}>{t('app.title')}</div>
              <div style={{ fontSize: 11, color: '#8b919e' }}>{t('app.version')}</div>
            </div>
          )}
        </div>

        {/* 导航 */}
        <nav style={s.nav}>
          {filteredItems.map((section, idx) => (
            <div key={idx} style={{ marginBottom: 16 }}>
              {sidebarOpen && <div style={s.sectionTitle(true)}>{t(section.section)}</div>}
              {section.items.map((item) => {
                const active = isActive(item.path)
                return (
                    <div
                      key={item.path}
                      data-testid={`nav-${item.path}`}
                      onClick={() => navigate(item.path)}
                      style={{
                        ...s.navItem(active, sidebarOpen),
                      }}
                      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
                    >
                      <span style={{ flexShrink: 0 }}>{item.icon}</span>
                      {sidebarOpen && <span>{t(item.labelKey)}</span>}
                    </div>
                )
              })}
            </div>
          ))}
        </nav>

        {/* 折叠按钮 */}
        <div style={s.profileBottom}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={s.collapseBtn}>
            {sidebarOpen ? <><X size={14} />{t('app.collapse')}</> : <><Menu size={14} />{t('app.expand')}</>}
          </button>
        </div>

        {/* 用户信息 */}
        <div style={s.profileBottom}>
          <div style={s.userCard}>
            <div style={s.avatar}>
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
      </NavigateCtx.Provider>

      {/* 主区域 */}
      <div style={s.main}>
        {/* 顶部栏 */}
        <header style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={s.headerBtn}>
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <span style={{ fontSize: 14, color: '#f1f5f9', fontWeight: 600 }}>{t('app.hospital')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
              <Activity size={14} style={{ color: '#22c55e' }} />
              <span>{t('app.systemStatus')}</span>
            </div>
            <button style={s.headerBtn}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }} />
            </button>
            <span style={{ fontSize: 13, color: '#c8ccd4' }}>
              {new Date().toLocaleDateString(locale === 'en-US' ? 'en-US' : 'zh-CN')}
            </span>
          </div>
        </header>

        {/* 网络离线提示 */}
        {!isOnline && <NetworkOfflineBanner />}

        {/* 路由出口 */}
        <div style={s.content}>
          <h1 style={{ position: 'absolute', left: -9999, top: -9999 }}>放射科RIS系统</h1>
          <ErrorBoundary>
            <React.Suspense fallback={<Loading />}>
              <Routes>
                {routes.map((r) => <Route key={r.path} {...r} />)}
              </Routes>
            </React.Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}

export default AppLayout
