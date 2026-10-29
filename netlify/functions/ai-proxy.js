// Netlify Serverless Function - AI API 代理（ESM 语法）
// 支持 SSE 流式输出，实现"边生成边展示"的实时体验
// 环境变量在 Netlify 控制台配置：
//   VITE_AI_API_BASE, VITE_AI_API_KEY, VITE_AI_MODEL

const API_BASE = process.env.VITE_AI_API_BASE || '';
const API_KEY = process.env.VITE_AI_API_KEY || '';
const MODEL = process.env.VITE_AI_MODEL || '';

export const handler = async (event) => {
  // 仅允许 POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // 检查环境变量是否配置
  if (!API_BASE || !API_KEY || !MODEL) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'AI_API_NOT_CONFIGURED',
        message: '服务器未配置 AI API，请联系管理员',
      }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const messages = body.messages || [];
    const stream = body.stream !== false; // 默认开启流式

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
        temperature: 0.9, // 提高温度，增加内容多样性（唯一性保障）
        max_tokens: 4000,
        stream,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        statusCode: response.status,
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
    // 使用 ReadableStream 实现流式转发
    const reader = response.body?.getReader();
    if (!reader) {
      // 不支持流式时，降级为完整返回
      const data = await response.json();
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      };
    }

    const encoder = new TextEncoder();
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
      },
      body: streamResponse,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'AI_PROXY_ERROR',
        message: error.message || 'Unknown error',
      }),
    };
  }
};
