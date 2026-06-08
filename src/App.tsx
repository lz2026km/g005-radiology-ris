/**
 * G005 放射RIS系统 v3.0.1 - App 根组件
 * v3.0.0 单体 768 行 + @ts-nocheck 拆分为:
 *   - src/routes/sidebarConfig.tsx
 *   - src/routes/routeTable.tsx
 *   - src/layouts/AppLayout.tsx
 *   - src/i18n/appI18n.ts
 * 本文件仅做 Provider 组合 + BrowserRouter 挂载
 */
import React, { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import './styles/design-system.css'
import { initTheme } from './utils/theme'
import { ToastProvider } from './components/ToastProvider'
import { NProgressBar } from './components/NProgressBar'
import { UndoToastProvider } from './components/UndoToast'
import { AppLayout } from './layouts/AppLayout'

export default function App() {
  useEffect(() => {
    initTheme()
  }, [])

  return React.createElement(
    BrowserRouter,
    null,
    React.createElement(
      NProgressBar,
      null,
      React.createElement(
        ToastProvider,
        null,
        React.createElement(
          UndoToastProvider,
          null,
          React.createElement(AppLayout, null)
        )
      )
    )
  )
}
