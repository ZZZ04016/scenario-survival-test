// Netlify Edge Function - 边缘层安全防护
// 功能：速率限制 + 爬虫拦截 + 请求头校验
// 部署到 Netlify 边缘节点，在请求到达源站之前拦截恶意流量

import type { Context } from "https://edge.netlify.com";

// ---- 配置 ----
const RATE_LIMIT_PER_MINUTE = 60; // 每个 IP 每分钟最多请求数
const AI_RATE_LIMIT_PER_MINUTE = 15; // AI 接口每分钟最多调用数
const WINDOW_MS = 60 * 1000; // 1 分钟窗口
const MAX_BODY_SIZE = 32 * 1024; // 请求体最大 32KB

// 已知恶意/爬虫 User-Agent 关键词
const BOT_UA_PATTERNS = [
  "bot", "crawl", "spider", "scrap", "curl", "wget",
  "python-requests", "httpclient", "okhttp", "axios",
  "headless", "phantom", "selenium", "puppeteer",
  "playwright", "cypress", "nightmare",
  "dotbot", "bingbot", "yandexbot", "duckduckbot",
  "baiduspider", "sogou", "exabot", "ia_archiver",
  "mj12bot", "ahrefsbot", "semrushbot",
  "blexbot", "spbot", "facebookexternalhit",
];

// 允许的搜索引擎爬虫
const ALLOWED_BOTS = ["googlebot", "google-inspectiontool", "google-webmaster"];

// ---- 内存速率限制存储 ----
interface RateLimitEntry {
  count: number;
  windowStart: number;
}
const rateLimitStore = new Map<string, RateLimitEntry>();
const aiRateLimitStore = new Map<string, RateLimitEntry>();

function checkRateLimit(
  store: Map<string, RateLimitEntry>,
  key: string,
  limit: number,
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    store.set(key, { count: 1, windowStart: now });
    // 顺便清理过期条目（懒清理，避免内存泄漏）
    if (store.size > 1000) {
      for (const [k, v] of store) {
        if (now - v.windowStart > WINDOW_MS * 2) store.delete(k);
      }
    }
    return false;
  }

  entry.count++;
  return entry.count > limit;
}

function getClientIP(request: Request, context: Context): string {
  return (
    context.ip ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isBotUserAgent(ua: string): boolean {
  const lower = ua.toLowerCase();
  // 放行允许的搜索引擎
  if (ALLOWED_BOTS.some((bot) => lower.includes(bot))) return false;
  return BOT_UA_PATTERNS.some((pattern) => lower.includes(pattern));
}

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const path = url.pathname;
  const ua = request.headers.get("user-agent") || "";

  // 跳过静态资源（只做 UA 检查，不限流）
  const isStaticAsset = /\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|map|webmanifest|webp)$/i.test(path);
  const isAIFunction = path.startsWith("/.netlify/functions/ai-proxy");

  // ---- 1. 爬虫拦截（对 AI 接口和 HTML 页面）----
  if (!isStaticAsset && isBotUserAgent(ua)) {
    return new Response(
      JSON.stringify({ error: "ACCESS_DENIED", message: "Bot access is not allowed" }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  const clientIP = getClientIP(request, context);

  // ---- 2. AI 接口严格限流 ----
  if (isAIFunction) {
    if (checkRateLimit(aiRateLimitStore, clientIP, AI_RATE_LIMIT_PER_MINUTE)) {
      return new Response(
        JSON.stringify({
          error: "RATE_LIMITED",
          message: "请求过于频繁，请稍后再试",
          retryAfter: 60,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        },
      );
    }

    // 请求体大小限制
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return new Response(
        JSON.stringify({ error: "PAYLOAD_TOO_LARGE", message: "请求体过大" }),
        { status: 413, headers: { "Content-Type": "application/json" } },
      );
    }

    // Origin 验证
    const origin = request.headers.get("origin") || "";
    if (origin) {
      const allowed = [
        "https://glittery-madeleine-4cca7e.netlify.app",
        "http://localhost",
        "http://127.0.0.1",
      ];
      if (!allowed.some((o) => origin.startsWith(o))) {
        return new Response(
          JSON.stringify({ error: "INVALID_ORIGIN", message: "非法来源" }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        );
      }
    }
  }

  // ---- 3. 全站请求限流 ----
  if (!isStaticAsset) {
    if (checkRateLimit(rateLimitStore, clientIP, RATE_LIMIT_PER_MINUTE)) {
      return new Response(
        JSON.stringify({
          error: "RATE_LIMITED",
          message: "请求过于频繁，请稍后再试",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        },
      );
    }
  }

  // ---- 4. 继续处理，添加安全响应头 ----
  const response = await context.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
};
