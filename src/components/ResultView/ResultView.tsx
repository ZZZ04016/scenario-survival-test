import { useAppStore } from '../../store/useAppStore';
import { ShareCard } from '../ShareCard/ShareCard';
import { Leaderboard } from '../Leaderboard/Leaderboard';
import { TRAIT_LABELS } from '../../types';

export function ResultView() {
  const { worldview, story, profile, tier, reset, setStage } = useAppStore();

  if (!story || !profile) return null;

  return (
    <div className="min-h-screen px-4 py-8 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        {/* 标题区 */}
        <div className="text-center mb-8">
          <span className="text-5xl">{worldview?.coverEmoji}</span>
          <h1 className="text-3xl font-serif font-bold text-text mt-3">
            你在{worldview?.name}活了
            <span className="text-5xl text-primary mx-2">{story.episodesSurvived}</span>
            集
          </h1>
          <p className="text-text-secondary mt-2">
            主导特质：{TRAIT_LABELS[profile.primaryTrait]} · {TRAIT_LABELS[profile.secondaryTrait]}
          </p>
        </div>

        {/* 角色设定 */}
        <div className="card p-5 mb-5" style={{ backgroundColor: 'var(--color-primary-light)', opacity: 0.15 }}>
          <div style={{ opacity: 1 }}>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-primary)' }}>你的身份</p>
            <p className="text-text">{story.role}</p>
          </div>
        </div>

        {/* 剧情 */}
        <div className="card p-6 mb-5">
          <h2 className="text-lg font-serif font-bold text-text mb-4">📖 你的剧情</h2>
          <div className="space-y-4">
            {story.story.map((paragraph, i) => (
              <p key={i} className="text-text-secondary leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* 结局 */}
        <div
          className="card p-5 mb-5"
          style={{ borderLeft: '4px solid var(--color-primary)' }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-primary)' }}>🎬 最终结局</p>
          <p className="text-text font-medium">{story.ending}</p>
        </div>

        {/* 性格分析 */}
        <div className="card p-5 mb-6">
          <h2 className="text-lg font-serif font-bold text-text mb-3">🔍 性格分析</h2>
          <p className="text-text-secondary leading-relaxed">{story.personalityAnalysis}</p>
        </div>

        {/* 分享卡 */}
        <div className="mb-6">
          <ShareCard />
        </div>

        {/* 排行榜 */}
        {worldview && <Leaderboard worldviewId={worldview.id} />}

        {/* 升级提示（体验版） */}
        {tier === 'trial' && (
          <div
            className="card p-5 mb-6 text-center"
            style={{ background: 'linear-gradient(135deg, var(--color-primary-light)33, var(--color-accent)22)' }}
          >
            <p className="font-medium mb-2" style={{ color: 'var(--color-primary)' }}>这只是体验版剧情</p>
            <p className="text-sm text-text-secondary mb-3">
              升级完整版可获得 10 道题的完整剧情、多结局分支和深度性格分析
            </p>
            <button className="btn-primary">解锁完整版 ¥9.9</button>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3">
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
