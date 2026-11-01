import { useState, type FormEvent } from 'react';
import { verifyPassword, hasValidToken } from '../../utils/auth';

interface PasswordGateProps {
  onUnlocked: () => void;
}

export function PasswordGate({ onUnlocked }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 页面加载时检查是否已有有效 token
  useState(() => {
    if (hasValidToken()) {
      onUnlocked();
    }
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('请输入访问密码');
      return;
    }

    setLoading(true);
    setError('');

    const result = await verifyPassword(password.trim());

    if (result.success) {
      onUnlocked();
    } else {
      setError(result.error || '密码错误');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      <div className="w-full max-w-md">
        {/* 产品介绍卡片 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎭</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            你能活几集？
          </h1>
          <p className="text-gray-300 text-sm mb-1">
            AI 场景生存测试
          </p>
          <p className="text-gray-400 text-xs">
            深宫 · 末世 · 修仙 — 三大世界等你挑战
          </p>
        </div>

        {/* 特色介绍 */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10">
          <h2 className="text-white font-semibold mb-3 text-center">✨ 你将获得</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-pink-400">🎬</span>
              <span>AI 实时生成专属剧情，每次体验都不同</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-400">🎨</span>
              <span>根据你的选择生成专属角色形象</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-400">🔮</span>
              <span>性格分析 + 存活集数 + 结局分享卡</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-400">📱</span>
              <span>手机电脑都能玩，无需下载</span>
            </li>
          </ul>
        </div>

        {/* 密码输入框 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h2 className="text-white font-semibold mb-1 text-center">🔐 输入访问密码</h2>
          <p className="text-gray-400 text-xs text-center mb-4">
            购买后将获得密码，输入即可开始体验
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入访问密码"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30 transition-all text-center text-lg tracking-widest"
              autoFocus
              disabled={loading}
            />

            {error && (
              <p className="text-red-400 text-sm text-center mt-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #e94560 0%, #c23152 100%)',
              }}
            >
              {loading ? '验证中...' : '开始体验 →'}
            </button>
          </form>
        </div>

        {/* 底部说明 */}
        <p className="text-gray-500 text-xs text-center mt-6">
          密码有效期 30 天，购买后请妥善保管
        </p>
      </div>
    </div>
  );
}
