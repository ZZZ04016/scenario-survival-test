import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initInteractionTracking } from './utils/security'

// 初始化用户交互追踪（反爬：确保真人操作）
initInteractionTracking()

// 注册 PWA Service Worker（启用离线缓存）
import { registerSW } from 'virtual:pwa-register'
const updateSW = registerSW({
  immediate: true,
  // 检测到新版本时立即激活并刷新页面，彻底避免旧缓存
  onNeedRefresh() {
    updateSW(true) // true = skipWaiting，立即激活新 SW
    // 新 SW 激活后强制刷新，确保用户看到最新内容
    setTimeout(() => window.location.reload(), 300)
  },
  onOfflineReady() {
    // 离线可用提示（静默处理即可）
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
