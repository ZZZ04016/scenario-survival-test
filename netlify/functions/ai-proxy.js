// Netlify Serverless Function - AI API 代理（ESM 语法）
// 支持 SSE 流式输出，实现"边生成边展示"的实时体验
// 环境变量在 Netlify 控制台配置：
//   VITE_AI_API_BASE, VITE_AI_API_KEY, VITE_AI_MODEL
// 安全防护：IP 限流、请求体大小限制、参数校验

const API_BASE = process.env.VITE_AI_API_BASE || '';
const API_KEY = process.env.VITE_AI_API_KEY || '';
const MODEL = process.env.VITE_AI_MODEL || '';

// ---- 安全配置 ----
const RATE_LIMIT_PER_IP_PER_MINUTE = 15; // 每个 IP 每分钟最多 15 次 AI 调用
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUEST_BODY = 32 * 1024; // 请求体最大 32KB
const MAX_MESSAGES = 30; // 最多 30 条消息
const MAX_MAX_TOKENS = 4000; // 最大 token 数
const MAX_CONTENT_LENGTH = 8000; // 单条消息最大长度

// ---- 内存速率限制（函数实例级）----
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: RATE_LIMIT_PER_IP_PER_MINUTE - 1 };
  }

  if (entry.count >= RATE_LIMIT_PER_IP_PER_MINUTE) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_PER_IP_PER_MINUTE - entry.count };
}

function getClientIP(event) {
  return (
    event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    event.headers['x-real-ip'] ||
    event.headers['client-ip'] ||
    'unknown'
  );
}

export const handler = async (event) => {
  const clientIP = getClientIP(event);

  // 仅允许 POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // 检查环境变量是否配置
  if (!API_BASE || !API_KEY || !MODEL) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'AI_API_NOT_CONFIGURED',
        message: '服务器未配置 AI API，请联系管理员',
      }),
    };
  }

  // ---- 速率限制 ----
  const rateLimit = checkRateLimit(clientIP);
  if (!rateLimit.allowed) {
    return {
      statusCode: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60',
        'X-RateLimit-Limit': String(RATE_LIMIT_PER_IP_PER_MINUTE),
        'X-RateLimit-Remaining': '0',
      },
      body: JSON.stringify({
        error: 'RATE_LIMITED',
        message: '请求过于频繁，请稍后再试（每分钟最多 15 次）',
      }),
    };
  }

  // ---- 请求体大小限制 ----
  const bodySize = Buffer.byteLength(event.body || '', 'utf8');
  if (bodySize > MAX_REQUEST_BODY) {
    return {
      statusCode: 413,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'PAYLOAD_TOO_LARGE', message: '请求体过大' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const messages = body.messages || [];
    const stream = body.stream !== false;
    const maxTokens = Math.min(body.max_tokens || 4000, MAX_MAX_TOKENS);

    // ---- 参数校验 ----
    if (!Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'INVALID_REQUEST', message: '消息不能为空' }),
      };
    }

    if (messages.length > MAX_MESSAGES) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'INVALID_REQUEST',
          message: `消息数量超过限制（最多 ${MAX_MESSAGES} 条）`,
        }),
      };
    }

    // 校验每条消息的内容长度
    for (const msg of messages) {
      if (typeof msg.content === 'string' && msg.content.length > MAX_CONTENT_LENGTH) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'INVALID_REQUEST',
            message: `消息内容过长（最多 ${MAX_CONTENT_LENGTH} 字符）`,
          }),
        };
      }
    }

    const url = `${API_BASE.replace(/\/$/, '')}/chat/completions`;

    // 设置 55 秒超时（给慢 API 足够时间）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.9,
        max_tokens: maxTokens,
        stream,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'AI_API_ERROR',
          message: data?.error?.message || `API returned ${response.status}`,
          status: response.status,
        }),
      };
    }

    if (!stream) {
      // 非流式：直接返回完整 JSON
      const data = await response.json();
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      };
    }

    // 流式：将 AI 的 SSE 响应透传给前端
    const reader = response.body?.getReader();
    if (!reader) {
      const data = await response.json();
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      };
    }

    const streamResponse = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-RateLimit-Limit': String(RATE_LIMIT_PER_IP_PER_MINUTE),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
      },
      body: streamResponse,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'AI_PROXY_ERROR',
        message: error.message || 'Unknown error',
      }),
    };
  }
};
