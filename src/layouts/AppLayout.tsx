/**
 * G005 放射RIS系统 v3.0.1 - AppLayout 布局(侧栏 + 头部 + 主区)
 * 从 v3.0.0 单体 App.tsx 拆出
 */
import React, { useState, useEffect, useMemo, createContext, useContext } from 'react'
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom'
import { Menu, X, Radio, Activity, Bell } from 'lucide-react'
import { SIDEBAR_ITEMS, type Role } from './sidebarConfig'
import { t, onLocaleChange, getCurrentLocale, getDirection, type Locale } from '../i18n/appI18n'
import { initialUsers } from '../data/initialData'
import { routes } from './routeTable'

const NavigateCtx = createContext<(path: string) => void>(() => {})
export const useNav = (): ((path: string) => void) => useContext(NavigateCtx)

const currentUser = { ...initialUsers[0], role: '管理员' as Role }

function Loading() {
  return React.createElement(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0f172a',
        color: '#94a3b8',
        fontSize: 14,
        gap: 12,
      },
    },
    React.createElement('div', {
      style: {
        width: 32,
        height: 32,
        border: '3px solid #334155',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      },
    }),
    React.createElement('style', null, '@keyframes spin { to { transform: rotate(360deg); } }'),
    t('app.loading')
  )
}

function useSidebarItems(role: Role) {
  return useMemo(
    () =>
      SIDEBAR_ITEMS.map((section) => ({
        ...section,
        items: section.items.filter((item) => item.roles.includes(role)),
      })).filter((section) => section.items.length > 0),
    [role]
  )
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [locale, setLocale] = useState<Locale>(getCurrentLocale())
  const navigate = useNavigate()
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  useEffect(() => onLocaleChange((l) => setLocale(l)), [])

  const filteredItems = useSidebarItems(currentUser.role)
  const direction = getDirection(locale)

  return React.createElement(
    'div',
    { style: { display: 'flex', height: '100vh', background: '#f8fafc', direction } },
    React.createElement(
      'aside',
      {
        style: {
          width: sidebarOpen ? 260 : 60,
          background: '#1a3a5c',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #334155',
          transition: 'width 0.2s',
          overflow: 'hidden',
        },
      },
      React.createElement(
        'div',
        { style: { padding: '16px 14px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 10 } },
        React.createElement(
          'div',
          {
            style: {
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            },
          },
          React.createElement(Radio, { size: 18, color: '#fff' })
        ),
        sidebarOpen
          ? React.createElement(
              'div',
              null,
              React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: '#f0f2f5' } }, t('app.title')),
              React.createElement('div', { style: { fontSize: 11, color: '#8b919e' } }, t('app.version'))
            )
          : null
      ),
      React.createElement(
        'nav',
        { style: { flex: 1, overflowY: 'auto', padding: '8px 0' } },
        filteredItems.map((section, idx) =>
          React.createElement(
            'div',
            { key: idx, style: { marginBottom: 16 } },
            sidebarOpen
              ? React.createElement(
                  'div',
                  {
                    style: {
                      padding: '8px 16px 4px',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#e2e8f0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    },
                  },
                  t(section.section)
                )
              : null,
            section.items.map((item) =>
              React.createElement(
                NavigateCtx.Provider,
                { key: item.path, value: navigate },
                React.createElement(
                  'div',
                  {
                    onClick: () => navigate(item.path),
                    style: {
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
                    },
                    onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
                      if (!isActive(item.path)) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                    },
                    onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
                      if (!isActive(item.path)) e.currentTarget.style.background = 'transparent'
                    },
                  },
                  React.createElement('span', { style: { flexShrink: 0 } }, item.icon),
                  sidebarOpen ? React.createElement('span', null, t(item.labelKey)) : null
                )
              )
            )
          )
        )
      ),
      React.createElement(
        'div',
        { style: { padding: '12px 8px', borderTop: '1px solid #334155' } },
        React.createElement(
          'button',
          {
            onClick: () => setSidebarOpen(!sidebarOpen),
            style: {
              width: '100%',
              padding: '8px',
              borderRadius: 8,
              border: '1px solid #334155',
              background: '#0f172a',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontSize: 12,
            },
          },
          sidebarOpen
            ? React.createElement(React.Fragment, null, React.createElement(X, { size: 14 }), t('app.collapse'))
            : React.createElement(React.Fragment, null, React.createElement(Menu, { size: 14 }), t('app.expand'))
        )
      ),
      React.createElement(
        'div',
        { style: { padding: '12px 8px', borderTop: '1px solid #334155' } },
        React.createElement(
          'div',
          {
            style: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderRadius: 6, cursor: 'pointer' },
            onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            },
            onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.background = 'transparent'
            },
          },
          React.createElement(
            'div',
            {
              style: {
                width: 28,
                height: 28,
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              },
            },
            React.createElement('span', { style: { fontSize: 12, fontWeight: 700, color: '#fff' } }, currentUser.name.slice(0, 1))
          ),
          sidebarOpen
            ? React.createElement(
                'div',
                { style: { overflow: 'hidden' } },
                React.createElement('div', { style: { fontSize: 12, fontWeight: 600, color: '#f1f5f9' } }, currentUser.name),
                React.createElement('div', { style: { fontSize: 11, color: '#64748b' } }, currentUser.title || currentUser.role)
              )
            : null
        )
      )
    ),
    React.createElement(
      'div',
      { style: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' } },
      React.createElement(
        'header',
        {
          style: {
            height: 52,
            background: '#1e293b',
            borderBottom: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            flexShrink: 0,
          },
        },
        React.createElement(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          React.createElement(
            'button',
            {
              onClick: () => setSidebarOpen(!sidebarOpen),
              style: {
                background: 'none',
                border: 'none',
                color: '#c8ccd4',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                borderRadius: 4,
              },
            },
            sidebarOpen ? React.createElement(X, { size: 18 }) : React.createElement(Menu, { size: 18 })
          ),
          React.createElement('span', { style: { fontSize: 14, color: '#f1f5f9', fontWeight: 600 } }, t('app.hospital'))
        ),
        React.createElement(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: 16 } },
          React.createElement(
            'div',
            { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' } },
            React.createElement(Activity, { size: 14, style: { color: '#22c55e' } }),
            React.createElement('span', null, t('app.systemStatus'))
          ),
          React.createElement(
            'button',
            {
              style: {
                background: 'none',
                border: 'none',
                color: '#c8ccd4',
                cursor: 'pointer',
                display: 'flex',
                position: 'relative',
              },
            },
            React.createElement(Bell, { size: 18 }),
            React.createElement('span', {
              style: {
                position: 'absolute',
                top: -2,
                right: -2,
                width: 8,
                height: 8,
                background: '#ef4444',
                borderRadius: '50%',
              },
            })
          ),
          React.createElement(
            'span',
            { style: { fontSize: 13, color: '#c8ccd4' } },
            new Date().toLocaleDateString(locale === 'en-US' ? 'en-US' : 'zh-CN')
          )
        )
      ),
      React.createElement(
        'div',
        { style: { flex: 1, overflow: 'auto', background: '#f8fafc' } },
        React.createElement(
          React.Suspense,
          { fallback: React.createElement(Loading) },
          React.createElement(Routes, null, ...routes.map((r) => React.createElement(Route, { key: r.path, ...r })))
        )
      )
    )
  )
}

export default AppLayout
