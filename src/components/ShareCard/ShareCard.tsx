import { useAppStore } from '../../store/useAppStore';
import { TRAIT_LABELS } from '../../types';

/**
 * 分享卡组件
 * 生成一张适合截图分享的卡片，包含世界观、存活集数、性格特质
 */
export function ShareCard() {
  const { worldview, story, profile } = useAppStore();

  if (!story || !profile || !worldview) return null;

  const cardColor = story.shareColor || worldview.accentColor;

  return (
    <div className="card overflow-hidden" style={{ borderColor: cardColor }}>
      <div
        className="px-6 py-5 text-white"
        style={{ backgroundColor: cardColor }}
      >
        <div className="flex items-center justify-between">
          <span className="text-3xl">{worldview.coverEmoji}</span>
          <span className="text-xs opacity-80">AI 场景生存测试</span>
        </div>
        <p className="text-sm opacity-90 mt-2">{worldview.tagline}</p>
      </div>

      <div className="p-6 text-center">
        <p className="text-sm text-text-muted mb-1">我在{worldview.name}活了</p>
        <p
          className="text-6xl font-serif font-bold mb-1"
          style={{ color: cardColor }}
        >
          {story.episodesSurvived}
        </p>
        <p className="text-sm text-text-muted">集</p>

        <div className="mt-5 pt-5 border-t" style={{ borderColor: 'var(--color-card-border)' }}>
          <p className="text-xs text-text-muted mb-2">性格特质</p>
          <div className="flex justify-center gap-2 flex-wrap">
            <span
              className="px-3 py-1 rounded-full text-xs text-white"
              style={{ backgroundColor: cardColor }}
            >
              {TRAIT_LABELS[profile.primaryTrait]}
            </span>
            <span
              className="px-3 py-1 rounded-full text-xs"
              style={{ backgroundColor: 'var(--color-card-border)', color: 'var(--color-text-secondary)' }}
            >
              {TRAIT_LABELS[profile.secondaryTrait]}
            </span>
          </div>
        </div>

        <p className="mt-5 text-xs text-text-muted">
          扫描二维码，测测你能活几集
        </p>
        <div
          className="mt-2 w-20 h-20 mx-auto rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-card-border)' }}
        >
          <span className="text-3xl">📱</span>
        </div>
      </div>
    </div>
  );
}
