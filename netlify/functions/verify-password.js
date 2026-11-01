// Netlify Serverless Function - 密码验证
// 用户输入密码后，验证是否在允许的密码列表中
// 验证通过则返回一个签名 token，前端存储后可免重复输入
//
// 环境变量配置（Netlify 控制台）：
//   ACCESS_PASSWORDS: 允许的密码列表，用逗号分隔，例如 "pass1,pass2,pass3"
//   TOKEN_SECRET: 用于签名 token 的密钥（任意随机字符串）

const ACCESS_PASSWORDS = (process.env.ACCESS_PASSWORDS || '').split(',').map(p => p.trim()).filter(Boolean);
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'scenario-survival-test-secret-key-2024';
const TOKEN_EXPIRY_DAYS = 30; // token 有效期 30 天

// 简单的 HMAC-SHA256 签名（使用 Web Crypto API）
async function signToken(payload) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(TOKEN_SECRET);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const data = encoder.encode(JSON.stringify(payload));
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  const payloadBase64 = btoa(JSON.stringify(payload));
  return `${payloadBase64}.${signatureBase64}`;
}

export const handler = async (event) => {
  // 仅允许 POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // 如果没有配置密码，则直接放行（用于开发/免费模式）
  if (ACCESS_PASSWORDS.length === 0) {
    const token = await signToken({
      type: 'free',
      iat: Date.now(),
      exp: Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    });
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, token, mode: 'free' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const password = body.password || '';

    if (!password) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: '请输入访问密码' }),
      };
    }

    // 验证密码
    if (!ACCESS_PASSWORDS.includes(password)) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: '密码错误，请重试' }),
      };
    }

    // 密码正确，生成签名 token
    const token = await signToken({
      type: 'paid',
      iat: Date.now(),
      exp: Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, token, mode: 'paid' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: '验证服务异常，请稍后重试' }),
    };
  }
};
