import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ShareCard } from '../ShareCard/ShareCard';
import { Leaderboard } from '../Leaderboard/Leaderboard';
import { TRAIT_LABELS } from '../../types';

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const startTime = performance.now();
    let raf = 0;
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(animate);
      else setValue(target);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export function ResultView() {
  const { worldview, story, profile, reset, setStage } = useAppStore();
  const displayEpisodes = useCountUp(story?.episodesSurvived ?? 0);

  if (!story || !profile) return null;

  return (
    <div className="min-h-screen px-4 py-8 relative overflow-hidden">
      {/* 背景装饰 */}
      <div
        className="bg-orb"
        style={{
          width: 240,
          height: 240,
          top: -40,
          right: -40,
          background: 'var(--color-primary-light)',
        }}
      />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* 标题区 */}
        <div className="text-center mb-8 animate-fade-in">
          <span className="text-6xl block mb-3 animate-bounce-in">{worldview?.coverEmoji}</span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-text mb-4">
            你在{worldview?.name}活了
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span
              className="text-7xl md:text-8xl font-black count-animate"
              style={{
                background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {displayEpisodes}
            </span>
            <span className="text-3xl font-bold text-text">集</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ background: 'var(--color-primary-light)33', color: 'var(--color-primary)' }}
            >
              {TRAIT_LABELS[profile.primaryTrait]}
            </span>
            <span className="text-text-muted">·</span>
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ background: 'var(--color-accent)33', color: 'var(--color-accent)' }}
            >
              {TRAIT_LABELS[profile.secondaryTrait]}
            </span>
          </div>
        </div>

        {/* 角色设定 */}
        <div
          className="card p-5 mb-5 animate-slide-up"
          style={{
            background: `linear-gradient(135deg, var(--color-primary-light)22, var(--color-card-bg))`,
            borderLeft: '4px solid var(--color-primary)',
          }}
        >
          <p className="text-sm font-bold mb-1" style={{ color: 'var(--color-primary)' }}>👤 你的身份</p>
          <p className="text-text leading-relaxed">{story.role}</p>
        </div>

        {/* 剧情 */}
        <div className="card p-6 mb-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg font-serif font-bold text-text mb-4 flex items-center gap-2">
            📖 你的剧情
          </h2>
          <div className="space-y-4">
            {story.story.map((paragraph, i) => (
              <p key={i} className="text-text-secondary leading-relaxed" style={{ animationDelay: `${0.15 + i * 0.1}s` }}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* 结局 */}
        <div
          className="card p-5 mb-5 animate-slide-up"
          style={{
            borderLeft: '4px solid var(--color-accent)',
            background: `linear-gradient(135deg, var(--color-accent)15, var(--color-card-bg))`,
            animationDelay: '0.2s',
          }}
        >
          <p className="text-sm font-bold mb-1" style={{ color: 'var(--color-accent)' }}>🎬 最终结局</p>
          <p className="text-text font-medium leading-relaxed">{story.ending}</p>
        </div>

        {/* 性格分析 */}
        <div className="card p-5 mb-6 animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <h2 className="text-lg font-serif font-bold text-text mb-3 flex items-center gap-2">🔍 性格分析</h2>
          <p className="text-text-secondary leading-relaxed">{story.personalityAnalysis}</p>
        </div>

        {/* 分享卡 */}
        <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <ShareCard />
        </div>

        {/* 排行榜 */}
        {worldview && <Leaderboard worldviewId={worldview.id} />}

        {/* 付费解锁提示 */}
        <div
          className="card p-6 mb-6 text-center animate-slide-up"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary)15, var(--color-accent)15)',
            border: '2px dashed var(--color-primary-light)',
            animationDelay: '0.35s',
          }}
        >
          <div className="text-3xl mb-2">🎁</div>
          <p className="font-bold mb-2 text-lg" style={{ color: 'var(--color-primary)' }}>支持一下创作者</p>
          <p className="text-sm text-text-secondary mb-4">
            一杯奶茶钱，解锁所有世界观、专属剧情和深度性格分析
          </p>
          <button className="btn-primary animate-pulse-glow">立即支持 ¥1.98</button>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <button onClick={() => setStage('share')} className="btn-secondary flex-1">
            📤 分享结果
          </button>
          <button onClick={reset} className="btn-primary flex-1">
            🔄 再测一次
          </button>
        </div>
      </div>
    </div>
  );
}
