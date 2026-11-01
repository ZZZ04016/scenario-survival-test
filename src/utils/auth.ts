/**
 * 前端认证工具
 * 负责 token 的存储、读取和过期检查
 * 真正的签名验证在服务端（ai-proxy 函数）进行
 */

const TOKEN_KEY = 'sst_access_token';

/** 保存 token 到 localStorage */
export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/** 获取 token */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** 清除 token（退出登录） */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * 检查 token 是否存在且未过期
 * 注意：这只是前端的快速检查，真正的验证在服务端
 */
export function hasValidToken(): boolean {
  const token = getToken();
  if (!token) return false;

  try {
    // token 格式: payloadBase64.signature
    const [payloadBase64] = token.split('.');
    if (!payloadBase64) return false;

    const payload = JSON.parse(atob(payloadBase64));
    const now = Date.now();

    // 检查过期时间
    if (payload.exp && now > payload.exp) {
      clearToken();
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * 向服务端验证密码
 * @param password 用户输入的密码
 * @returns 验证结果，包含 token
 */
export async function verifyPassword(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const response = await fetch('/.netlify/functions/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      saveToken(data.token);
      return { success: true, token: data.token };
    }

    return { success: false, error: data.error || '验证失败' };
  } catch (error) {
    return { success: false, error: '网络异常，请检查连接后重试' };
  }
}
