/**
 * G005 鏀惧皠RIS绯荤粺 v3.0.1 - App 鏍圭粍浠?
 * v3.0.11: 閲嶆瀯 - LoginPage/ForbiddenPage 鍦?AppLayout 澶栨覆鏌?
 */
import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles/design-system.css'
import { initTheme } from './components/Provider'
import { ToastProvider } from './components/ToastProvider'
import { NProgressBar } from './components/NProgressBar'
import { UndoToastProvider } from './components/UndoToast'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AppLayout } from './layouts/AppLayout'
import LoginPage from './pages/LoginPage'
import ForbiddenPage from './pages/ForbiddenPage'
import { routes } from './routes/routeTable'
import { useAuth } from './hooks/useAuth'

export default function App() {
  useEffect(() => {
    initTheme()
  }, [])

  const basename = import.meta.env.BASE_URL?.replace(/\/+$/, '') || '';

  return React.createElement(
    BrowserRouter,
    { basename },
    React.createElement(
      ErrorBoundary,
      { showErrorDetails: true },
      React.createElement(NProgressBar, null,
        React.createElement(ToastProvider, null,
          React.createElement(UndoToastProvider, null,
            React.createElement(AuthGate, null)
          )
        )
      )
    )
  )
}

/**
 * AuthGate - 妫€鏌ヨ璇佺姸鎬?
 * - 鏈櫥褰曠敤鎴? 浠呮樉绀?LoginPage 鍜?ForbiddenPage
 * - 宸茬櫥褰曠敤鎴? 鏄剧ず瀹屾暣鐨?AppLayout (鍚?sidebar + Routes)
 */
function AuthGate() {
  const { isAuthenticated } = useAuth()

  // 鏈櫥褰? 鐩存帴娓叉煋 LoginPage (涓嶅湪 AppLayout 鍐?閬垮厤寰幆)
  if (!isAuthenticated) {
    return React.createElement(Routes, null,
      React.createElement(Route, { key: 'login', path: '/login', element: React.createElement(LoginPage) }),
      React.createElement(Route, { key: 'forbidden', path: '/forbidden', element: React.createElement(ForbiddenPage) }),
      React.createElement(Route, { key: 'catch-all', path: '*', element: React.createElement(Navigate, { to: '/login', replace: true }) })
    )
  }

  // 宸茬櫥褰? 瀹屾暣 AppLayout
  return React.createElement(AppLayout, null)
}