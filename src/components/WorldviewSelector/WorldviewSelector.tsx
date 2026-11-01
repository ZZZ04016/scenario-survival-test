import { WORLDVIEWS } from '../../data/worldviews';
import { useAppStore } from '../../store/useAppStore';
import { isWorldviewUnlocked, getUnlockInfo, getProgress } from '../../lib/progress';
import { useState } from 'react';

export function WorldviewSelector() {
  const selectWorldview = useAppStore((s) => s.selectWorldview);
  const [progress] = useState(() => getProgress());

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* 背景装饰球 */}
      <div
        className="bg-orb animate-float"
        style={{
          width: 320,
          height: 320,
          top: -80,
          left: -80,
          background: 'var(--color-primary-light)',
        }}
      />
      <div
        className="bg-orb animate-float"
        style={{
          width: 280,
          height: 280,
          bottom: -60,
          right: -60,
          background: 'var(--color-accent)',
          animationDelay: '2s',
        }}
      />

      <div className="relative z-10 w-full max-w-2xl animate-fade-in">
        {/* 标题区 */}
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-5 animate-slide-down"
            style={{
              background: 'var(--color-primary-light)33',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-primary-light)66',
            }}
          >
            ✨ AI 生成你的专属剧情
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-text mb-4 leading-tight">
            你能活几集？
          </h1>
          <p className="text-text-secondary text-lg max-w-md mx-auto">
            穿越不同世界，AI 实时生成你的专属剧情线
          </p>
          {/* 进度提示 */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
            style={{ background: 'var(--color-primary)10', color: 'var(--color-primary)' }}>
            <span>🏆</span>
            <span>已通关 <b>{progress.totalEndings}</b> 个结局 · 累计选择 <b>{progress.totalChoices}</b> 次</span>
          </div>
        </div>

        {/* 世界观卡片 */}
        <div className="grid gap-4">
          {WORLDVIEWS.map((worldview, i) => {
            const unlocked = isWorldviewUnlocked(worldview.id);
            const unlockInfo = getUnlockInfo(worldview.id);

            return (
              <button
                key={worldview.id}
                onClick={() => unlocked && selectWorldview(worldview)}
                disabled={!unlocked}
                className={`card p-6 text-left transition-all duration-300 group animate-slide-up ${unlocked ? 'hover:shadow-xl hover:-translate-y-1.5 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                style={{
                  background: unlocked
                    ? `linear-gradient(135deg, ${worldview.accentColor}18, ${worldview.accentColor}05)`
                    : 'var(--color-card-bg)',
                  borderColor: unlocked ? `${worldview.accentColor}40` : 'var(--color-card-border)',
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div className="flex items-start gap-4">
                  <span className={`text-5xl transition-transform duration-300 ${unlocked ? 'group-hover:scale-110' : 'grayscale'}`}>
                    {unlocked ? worldview.coverEmoji : '🔒'}
                  </span>
                  <div className="flex-1">
                    <h2
                      className="text-2xl font-serif font-bold mb-1"
                      style={{ color: unlocked ? worldview.accentColor : 'var(--color-text-muted)' }}
                    >
                      {worldview.name}
                    </h2>
                    <p
                      className="text-sm font-medium mb-2"
                      style={{ color: unlocked ? worldview.accentColor : 'var(--color-text-muted)', opacity: 0.8 }}
                    >
                      {unlocked ? worldview.tagline : '完成更多结局即可解锁'}
                    </p>
                    {unlocked ? (
                      <p className="text-sm text-text-secondary leading-relaxed">{worldview.description}</p>
                    ) : (
                      <div className="mt-1">
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-card-border)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, (unlockInfo.current / unlockInfo.required) * 100)}%`,
                              background: worldview.accentColor,
                            }}
                          />
                        </div>
                        <p className="text-xs text-text-muted mt-1">
                          还需完成 {Math.max(0, unlockInfo.required - unlockInfo.current)} 个结局解锁
                        </p>
                      </div>
                    )}
                  </div>
                  {unlocked && (
                    <span
                      className="text-3xl opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
                      style={{ color: worldview.accentColor }}
                    >
                      →
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-8 text-sm text-text-muted text-center max-w-md">
          本测试为娱乐性质，AI 生成内容仅供参考
        </p>
      </div>
    </div>
  );
}
