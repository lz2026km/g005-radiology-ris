import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// 初始化 i18n
import './i18n/index.ts'

import './styles/animations.css'
import './styles/transitions.css'
import './styles/responsive.css'

async function bootstrap(): Promise<void> {
  // 启动 MSW Mock 后端(生产模式也需要,因无真实后端API)
  try {
    const { startMockBackend } = await import('./services/mockBackend/worker')
    await startMockBackend()
  } catch (err) {
    console.warn('[MSW] Mock backend failed to start, using initial data fallback.', err)
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

void bootstrap()
