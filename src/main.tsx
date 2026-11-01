import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initInteractionTracking } from './utils/security'

// 初始化用户交互追踪（反爬：确保真人操作）
initInteractionTracking()

// 注册 PWA Service Worker（启用离线缓存）
import { registerSW } from 'virtual:pwa-register'
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
