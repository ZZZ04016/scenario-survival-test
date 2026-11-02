import { useAppStore } from '../../store/useAppStore';
import type { Gender } from '../../types';

export function GenderSelect() {
  const { worldview, selectGender } = useAppStore();

  if (!worldview) return null;

  const accent = worldview.accentColor;

  const handleSelect = (gender: Gender) => {
    selectGender(gender);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 animate-fade-in"
      style={{ background: `linear-gradient(180deg, ${accent}12, transparent)` }}
    >
      <div className="w-full max-w-md text-center">
        {/* 世界观标签 */}
        <div
          className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-slide-down"
          style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}40` }}
        >
          {worldview.coverEmoji} {worldview.name}
        </div>

        {/* 标题 */}
        <h1 className="text-3xl font-serif font-bold text-text mb-2 animate-slide-up">
          选择你的性别
        </h1>
        <p className="text-sm text-text-secondary mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          不同身份，不同命运
        </p>

        {/* 性别选择卡片 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => handleSelect('male')}
            className="group card p-8 text-center transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-slide-up"
            style={{ borderColor: `${accent}30`, animationDelay: '0.15s' }}
          >
            <div className="text-5xl mb-3 transition-transform duration-300 group-hover:scale-110">♂️</div>
            <div
              className="text-xl font-bold mb-1"
              style={{ color: accent }}
            >
              男
            </div>
            <div className="text-xs text-text-muted">男性身份</div>
          </button>

          <button
            onClick={() => handleSelect('female')}
            className="group card p-8 text-center transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-slide-up"
            style={{ borderColor: `${accent}30`, animationDelay: '0.25s' }}
          >
            <div className="text-5xl mb-3 transition-transform duration-300 group-hover:scale-110">♀️</div>
            <div
              className="text-xl font-bold mb-1"
              style={{ color: accent }}
            >
              女
            </div>
            <div className="text-xs text-text-muted">女性身份</div>
          </button>
        </div>

        {/* 提示 */}
        <p className="text-xs text-text-muted animate-fade-in" style={{ animationDelay: '0.4s' }}>
          此选择将影响剧情中的身份设定与称呼
        </p>
      </div>
    </div>
  );
}
