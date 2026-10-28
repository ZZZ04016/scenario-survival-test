// Netlify Serverless Function - AI API 代理（ESM 语法）
// 解决浏览器跨域(CORS)问题，同时隐藏 API Key
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

    const url = `${API_BASE.replace(/\/$/, '')}/chat/completions`;

    // 设置 25 秒超时（Netlify 免费版上限约 10 秒，付费版 26 秒）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.8,
        max_tokens: 2000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: 'AI_API_ERROR',
          message: data?.error?.message || `API returned ${response.status}`,
          status: response.status,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
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
