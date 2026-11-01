import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ShareCard } from '../ShareCard/ShareCard';
import { Leaderboard } from '../Leaderboard/Leaderboard';
import { TRAIT_LABELS } from '../../types';
import { mapEpisodesToSeason } from '../../utils/personality';
import { getLegendaryRuns, type LegendaryRun } from '../../lib/storage';
import { getAIService } from '../../services/aiService';

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
  const {
    worldview,
    story,
    profile,
    originSetup,
    selectedTraitHistory,
    reset,
    setStage,
  } = useAppStore();
  const displayEpisodes = useCountUp(story?.episodesSurvived ?? 0);

  // 角色形象图（基于出身三维度 + 剧情选择轨迹生成）
  const [characterImage, setCharacterImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  useEffect(() => {
    if (!worldview || !originSetup) return;
    let cancelled = false;
    setIsImageLoading(true);
    getAIService()
      .generateOriginImage({
        worldview,
        origin: originSetup,
        traitHistory: selectedTraitHistory as never,
      })
      .then((url) => {
        if (!cancelled) {
          setCharacterImage(url);
          setIsImageLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsImageLoading(false);
      });
    return () => { cancelled = true; };
  }, [worldview, originSetup, selectedTraitHistory]);

  if (!story || !profile) return null;

  // 集数 → 季映射
  const seasonInfo = worldview
    ? mapEpisodesToSeason(story.episodesSurvived, worldview.seasons)
    : null;

  // 传奇局归档（方案 E）
  const [legendaryRuns, setLegendaryRuns] = useState<LegendaryRun[]>([]);
  useEffect(() => {
    setLegendaryRuns(getLegendaryRuns());
  }, [story]);

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

          {/* 季信息 */}
          {seasonInfo && (
            <div className="mt-5 max-w-md mx-auto">
              <div className="flex items-center justify-between text-xs text-text-secondary mb-1.5">
                <span className="font-medium" style={{ color: 'var(--color-primary)' }}>
                  第 {seasonInfo.index + 1} 季 · {seasonInfo.season.name}
                </span>
                <span>{story.episodesSurvived} / {worldview?.episodeMax} 集</span>
              </div>
              {/* 全剧进度条 */}
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-card-border)' }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${(story.episodesSurvived / (worldview?.episodeMax ?? 80)) * 100}%`,
                    background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 专属角色画像（出身+天赋+性格+剧情轨迹生成的形象图） */}
        <div
          className="card p-5 mb-5 animate-slide-up"
          style={{
            background: `linear-gradient(135deg, var(--color-primary-light)22, var(--color-card-bg))`,
            borderLeft: '4px solid var(--color-primary)',
          }}
        >
          <p className="text-sm font-bold mb-3" style={{ color: 'var(--color-primary)' }}>🎭 你的专属角色画像</p>

          {/* 角色形象图 */}
          <div className="relative w-full max-w-[200px] mx-auto mb-4 rounded-xl overflow-hidden flex items-center justify-center"
            style={{
              aspectRatio: '2 / 3',
              background: 'linear-gradient(135deg, var(--color-primary)15, var(--color-accent)25)',
            }}>
            {isImageLoading && (
              <div className="flex flex-col items-center gap-2 text-text-secondary">
                <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: 'var(--color-primary) transparent transparent transparent' }} />
                <p className="text-xs">正在生成角色形象…</p>
              </div>
            )}
            {!isImageLoading && characterImage && (
              <img src={characterImage} alt="角色形象" className="w-full h-full object-cover" />
            )}
            {!isImageLoading && !characterImage && (
              <div className="flex flex-col items-center gap-2 text-text-secondary px-4 text-center">
                <span className="text-3xl">🖼️</span>
                <p className="text-xs">形象生成中…</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                color: 'var(--color-btn-text)',
              }}
            >
              {story.characterPortrait.name.charAt(0)}
            </div>
            <div>
              <p className="text-lg font-bold text-text">{story.characterPortrait.name}</p>
              <p className="text-sm text-text-secondary">{story.role}</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-sm text-text-secondary leading-relaxed">
              <span className="font-medium text-text">外貌：</span>{story.characterPortrait.appearance}
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              <span className="font-medium text-text">背景：</span>{story.characterPortrait.background}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {story.characterPortrait.personalityTags.map((tag, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  background: 'var(--color-primary-light)33',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-primary-light)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 剧情 */}
        <div className="card p-6 mb-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg font-serif font-bold text-text mb-4 flex items-center gap-2">
            📖 你的剧情
          </h2>
          <div className="space-y-4">
            {story.story.map((paragraph, i) => (
              <p key={i} className="text-text-secondary leading-relaxed animate-slide-up" style={{ animationDelay: `${0.15 + i * 0.1}s` }}>
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

        {/* 传奇之路归档（集数达到世界观上限 90% 的对局） */}
        {legendaryRuns.length > 0 && (
          <div
            className="card p-5 mb-6 animate-slide-up"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent)12, var(--color-card-bg))',
              borderLeft: '4px solid var(--color-accent)',
              animationDelay: '0.3s',
            }}
          >
            <h2 className="text-lg font-serif font-bold text-text mb-4 flex items-center gap-2">
              🏆 我的传奇之路
              <span className="text-xs font-normal text-text-secondary">（共 {legendaryRuns.length} 局）</span>
            </h2>
            <div className="space-y-3">
              {legendaryRuns.slice(0, 5).map((run, i) => {
                const dateStr = new Date(run.createdAt).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                });
                const endingPreview = run.ending.length > 36
                  ? run.ending.slice(0, 36) + '…'
                  : run.ending;
                return (
                  <div
                    key={`${run.worldviewId}-${run.createdAt}-${i}`}
                    className="rounded-lg p-3"
                    style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-card-border)' }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-text">{run.worldviewName}</span>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: 'var(--color-accent)22', color: 'var(--color-accent)' }}
                        >
                          {run.episodesSurvived} / {run.episodeMax} 集
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{ background: 'var(--color-primary-light)33', color: 'var(--color-primary)' }}
                        >
                          {TRAIT_LABELS[run.primaryTrait as keyof typeof TRAIT_LABELS]}
                        </span>
                      </div>
                      <span className="text-xs text-text-muted">{dateStr}</span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{endingPreview}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
            🔄 再玩一次
          </button>
        </div>
      </div>
    </div>
  );
}
