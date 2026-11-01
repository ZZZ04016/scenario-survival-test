/**
 * 前端安全防护模块
 * 功能：
 * 1. 检测无头浏览器（headless browser）
 * 2. 检测自动化工具特征
 * 3. 要求用户交互后才能调用 AI
 * 4. 请求签名（时间戳 + 随机数）
 */

/** 检测结果 */
export interface BotDetectionResult {
  isBot: boolean;
  reason?: string;
}

/**
 * 检测是否为自动化工具/无头浏览器
 * 基于多个特征综合判断，降低误报率
 */
export function detectBot(): BotDetectionResult {
  if (typeof navigator === 'undefined') {
    return { isBot: true, reason: 'no_navigator' };
  }

  // 1. WebDriver 检测（Selenium/Puppeteer/Playwright）
  const webdriver = (navigator as any).webdriver;
  if (webdriver === true) {
    return { isBot: true, reason: 'webdriver' };
  }

  // 2. Headless Chrome 特征
  const ua = navigator.userAgent || '';
  if (/HeadlessChrome/i.test(ua)) {
    return { isBot: true, reason: 'headless_chrome' };
  }

  // 3. PhantomJS 检测
  if (typeof (window as any).callPhantom !== 'undefined' || typeof (window as any)._phantom !== 'undefined') {
    return { isBot: true, reason: 'phantomjs' };
  }

  // 4. Selenium 检测
  if (typeof (navigator as any).__webdriver_evaluate !== 'undefined' ||
      typeof (navigator as any).__driver_evaluate !== 'undefined' ||
      typeof (navigator as any).__selenium_evaluate !== 'undefined' ||
      typeof (navigator as any).__fxdriver_evaluate !== 'undefined') {
    return { isBot: true, reason: 'selenium' };
  }

  // 5. Chrome 对象检测（headless 模式下 chrome 对象可能缺失或异常）
  const chrome = (window as any).chrome;
  if (/Chrome/i.test(ua) && !chrome) {
    // 正常 Chrome 有 chrome 对象，headless 可能没有
    // 但某些移动端 Chrome 也没有，所以这里只做弱检测
  }

  // 6. 插件数量检测（headless 模式下通常为 0）
  const plugins = navigator.plugins;
  if (plugins && plugins.length === 0 && /Chrome/i.test(ua)) {
    // 正常 Chrome 有默认插件，headless 通常为 0
    // 但隐私模式下也可能为 0，所以只做弱检测
  }

  // 7. languages 检测
  const languages = navigator.languages;
  if (!languages || languages.length === 0) {
    return { isBot: true, reason: 'no_languages' };
  }

  // 8. Permissions API 检测（headless 模式下 Notification 权限异常）
  // 这是异步检测，这里不做

  return { isBot: false };
}

/** 用户交互状态 */
let userHasInteracted = false;

/**
 * 标记用户已交互（在首次点击/触摸/键盘事件时调用）
 */
export function markUserInteraction(): void {
  userHasInteracted = true;
}

/**
 * 检查用户是否已交互
 */
export function hasUserInteracted(): boolean {
  return userHasInteracted;
}

/**
 * 初始化用户交互监听
 * 在应用启动时调用一次
 */
export function initInteractionTracking(): void {
  if (typeof window === 'undefined') return;

  const mark = () => markUserInteraction();

  // 监听多种交互事件
  window.addEventListener('click', mark, { once: true, passive: true });
  window.addEventListener('touchstart', mark, { once: true, passive: true });
  window.addEventListener('keydown', mark, { once: true, passive: true });
  window.addEventListener('scroll', mark, { once: true, passive: true });
}

/**
 * 生成请求签名
 * 简单的时间戳 + 随机数，用于后端验证请求时效性
 */
export function generateRequestSignature(): { timestamp: number; nonce: string } {
  return {
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
  };
}

/**
 * 前端限流：限制本地调用频率
 * 返回 true 表示允许调用，false 表示被限流
 */
const callTimestamps: number[] = [];
const MAX_CALLS_PER_MINUTE = 15;

export function checkLocalRateLimit(): boolean {
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;

  // 移除超过 1 分钟的记录
  while (callTimestamps.length > 0 && callTimestamps[0] < oneMinuteAgo) {
    callTimestamps.shift();
  }

  if (callTimestamps.length >= MAX_CALLS_PER_MINUTE) {
    return false;
  }

  callTimestamps.push(now);
  return true;
}
