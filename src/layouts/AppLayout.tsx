/**
 * G005 鏀惧皠RIS绯荤粺 v3.0.2.9 - AppLayout JSX 閲嶆瀯
 * v3.0.6.8-23c (A2): 纭紪鐮佹繁鑹叉牱寮?鈫?CSS 鍙橀噺 (鍝嶅簲涓婚鍒囨崲)
 *                     渚ф爮 div onClick 鈫?a[role=link] + 閿洏 Enter/Space
 * 鈿狅笍 A2 鑼冨洿: 浠呬富棰?a11y 鐩稿叧 (鑳屾櫙鑹?鍓嶆櫙鑹?CSS 鍙橀噺鍖栥€侀敭鐩樺彲璁块棶)
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

const NavigateCtx = createContext<(path: string) => void>(() => {})
export const useNav = (): ((path: string) => void) => useContext(NavigateCtx)

function Loading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg-primary, #0f172a)',
      color: 'var(--text-muted, #94a3b8)', fontSize: 14, gap: 12,
    }}>
      <div style={{
        width: 32, height: 32, border: '3px solid var(--border-color, #334155)',
        borderTopColor: 'var(--color-primary-500, #3b82f6)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
      {t('app.loading')}
    </div>
  )
}

function useSidebarItems(role: Role) {
  return useMemo(
    () => SIDEBAR_ITEMS.map((section) => ({
      ...section, items: section.items.filter((item) => item.roles.includes(role)),
    })).filter((section) => section.items.length > 0),
    [role],
  )
}

const s: Record<string, React.CSSProperties> = {
  root: { display: 'flex', height: '100vh', background: 'var(--bg-primary, #f8fafc)' },
  sidebar: {
    background: 'var(--bg-sidebar, #1a3a5c)', display: 'flex', flexDirection: 'column',
    borderRight: '1px solid var(--border-color, #334155)', transition: 'width 0.2s', overflow: 'hidden',
  },
  logoWrap: {
    padding: '16px 14px', borderBottom: '1px solid var(--border-color, #334155)',
    display: 'flex', alignItems: 'center', gap: 10,
  },
  logoIcon: {
    width: 32, height: 32, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  nav: { flex: 1, overflowY: 'auto', padding: '8px 0' },
  sectionTitle: (open: boolean): React.CSSProperties => ({
    padding: open ? '8px 16px 4px' : 0, fontSize: 14, fontWeight: 700,
    color: 'var(--text-sidebar, #e2e8f0)', textTransform: 'uppercase', letterSpacing: '0.08em',
  }),
  navItem: (active: boolean, open: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: open ? '9px 14px' : '9px 20px', margin: '2px 8px', borderRadius: 6,
    cursor: 'pointer', color: 'var(--text-sidebar, #ffffff)',
    background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
    borderLeft: active ? '4px solid #22c55e' : '4px solid transparent',
    fontSize: 20, fontWeight: active ? 700 : 500, transition: 'all 0.15s',
    whiteSpace: 'nowrap', textDecoration: 'none',
  }),
  collapseBtn: {
    width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--border-color, #334155)',
    background: 'var(--bg-deep, #0f172a)', color: 'var(--text-muted, #64748b)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12,
  },
  userCard: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderRadius: 6, cursor: 'pointer' },
  avatar: {
    width: 28, height: 28, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: {
    height: 52, background: 'var(--bg-header, #1e293b)',
    borderBottom: '1px solid var(--border-color, #334155)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0,
  },
  headerBtn: {
    background: 'none', border: 'none', color: 'var(--text-secondary, #c8ccd4)',
    cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 4,
  },
  content: { flex: 1, overflow: 'auto', background: 'var(--bg-primary, #f8fafc)' },
  profileBottom: { padding: '12px 8px', borderTop: '1px solid var(--border-color, #334155)' },
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

  // 閿洏澶勭悊: Enter / Space 瑙﹀彂瀵艰埅 (a11y)
  const handleNavKey = (e: React.KeyboardEvent, path: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      navigate(path)
    }
  }

  return (
    <div style={{ ...s.root, direction }}>
      <NavigateCtx.Provider value={navigate}>
        <aside className="app-sidebar no-print" style={{ ...s.sidebar, width: sidebarOpen ? 260 : 60 }} aria-label={t('app.sidebar')}>
          <div style={s.logoWrap}>
            <div style={s.logoIcon}><Radio size={18} color="#fff" /></div>
            {sidebarOpen && (
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-header, #f0f2f5)' }}>{t('app.title')}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted, #8b919e)' }}>{t('app.version')}</div>
              </div>
            )}
          </div>
          <nav style={s.nav} aria-label={t('app.nav')}>
            {filteredItems.map((section, idx) => (
              <div key={idx} style={{ marginBottom: 16 }}>
                {sidebarOpen && <div style={s.sectionTitle(true)}>{t(section.section)}</div>}
                {section.items.map((item) => {
                  const active = isActive(item.path)
                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      role="link"
                      tabIndex={0}
                      data-testid={`nav-${item.path}`}
                      aria-current={active ? 'page' : undefined}
                      aria-label={t(item.labelKey)}
                      onClick={(e) => { e.preventDefault(); navigate(item.path) }}
                      onKeyDown={(e) => handleNavKey(e, item.path)}
                      style={{ ...s.navItem(active, sidebarOpen) }}
                      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
                    >
                      <span style={{ flexShrink: 0 }}>{item.icon}</span>
                      {sidebarOpen && <span>{t(item.labelKey)}</span>}
                    </a>
                  )
                })}
              </div>
            ))}
          </nav>
          <div style={s.profileBottom}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={s.collapseBtn}
              aria-label={sidebarOpen ? t('app.collapse') : t('app.expand')}>
              {sidebarOpen ? <><X size={14} />{t('app.collapse')}</> : <><Menu size={14} />{t('app.expand')}</>}
            </button>
          </div>
          <div style={s.profileBottom}>
            <div style={s.userCard} aria-label={currentUser.name}>
              <div style={s.avatar}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{currentUser.name.slice(0, 1)}</span>
              </div>
              {sidebarOpen && (
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-header, #f1f5f9)' }}>{currentUser.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted, #64748b)' }}>{currentUser.title || currentUser.role}</div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </NavigateCtx.Provider>
      <div style={s.main}>
        <header className="app-header no-print" style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={s.headerBtn}
              aria-label={sidebarOpen ? t('app.collapse') : t('app.expand')}>
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <span style={{ fontSize: 14, color: 'var(--text-header, #f1f5f9)', fontWeight: 600 }}>{t('app.hospital')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted, #64748b)' }}>
              <Activity size={14} style={{ color: '#22c55e' }} />
              <span>{t('app.systemStatus')}</span>
            </div>
            <button style={s.headerBtn} aria-label={t('nav.notification')}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: 'var(--color-error, #ef4444)', borderRadius: '50%' }} />
            </button>
            <span style={{ fontSize: 13, color: 'var(--text-secondary, #c8ccd4)' }}>
              {new Date().toLocaleDateString(locale === 'en-US' ? 'en-US' : 'zh-CN')}
            </span>
          </div>
        </header>
        {!isOnline && <NetworkOfflineBanner />}
        <div id="main-content" className="print-area" tabIndex={-1} style={s.content}>
          <h1 className="sr-only" style={{ position: 'absolute', left: -9999, top: -9999 }}>鏀惧皠绉慠IS绯荤粺</h1>
          <React.Suspense fallback={<Loading />}>
            <Routes>
              {routes.map((r) => (<Route key={r.path} {...r} />))}
            </Routes>
          </React.Suspense>
        </div>
      </div>
    </div>
  )
}

export default AppLayout