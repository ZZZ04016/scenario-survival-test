import { WORLDVIEWS } from '../../data/worldviews';
import { useAppStore } from '../../store/useAppStore';

export function WorldviewSelector() {
  const selectWorldview = useAppStore((s) => s.selectWorldview);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-serif font-bold text-text mb-3">
          你能活几集？
        </h1>
        <p className="text-text-secondary text-lg">
          AI 生成你的专属剧情，测测你在不同世界的生存能力
        </p>
      </div>

      <div className="grid gap-5 w-full max-w-2xl">
        {WORLDVIEWS.map((worldview) => (
          <button
            key={worldview.id}
            onClick={() => selectWorldview(worldview)}
            className="card p-6 text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            style={{
              background: `linear-gradient(135deg, ${worldview.accentColor}15, ${worldview.accentColor}05)`,
              borderColor: `${worldview.accentColor}40`,
            }}
          >
            <div className="flex items-start gap-4">
              <span className="text-5xl">{worldview.coverEmoji}</span>
              <div className="flex-1">
                <h2
                  className="text-2xl font-serif font-bold mb-1"
                  style={{ color: worldview.accentColor }}
                >
                  {worldview.name}
                </h2>
                <p
                  className="text-sm font-medium mb-2"
                  style={{ color: worldview.accentColor, opacity: 0.8 }}
                >
                  {worldview.tagline}
                </p>
                <p className="text-sm text-text-secondary">{worldview.description}</p>
              </div>
              <span
                className="text-2xl"
                style={{ color: worldview.accentColor, opacity: 0.5 }}
              >
                ›
              </span>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-8 text-sm text-text-muted text-center max-w-md">
        本测试为娱乐性质，AI 生成内容仅供参考
      </p>
    </div>
  );
}
