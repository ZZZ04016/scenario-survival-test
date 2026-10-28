import { WORLDVIEWS } from '../../data/worldviews';
import { useAppStore } from '../../store/useAppStore';

export function WorldviewSelector() {
  const selectWorldview = useAppStore((s) => s.selectWorldview);

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
        <div className="text-center mb-10">
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
        </div>

        {/* 世界观卡片 */}
        <div className="grid gap-4">
          {WORLDVIEWS.map((worldview, i) => (
            <button
              key={worldview.id}
              onClick={() => selectWorldview(worldview)}
              className="card p-6 text-left hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group animate-slide-up"
              style={{
                background: `linear-gradient(135deg, ${worldview.accentColor}18, ${worldview.accentColor}05)`,
                borderColor: `${worldview.accentColor}40`,
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div className="flex items-start gap-4">
                <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                  {worldview.coverEmoji}
                </span>
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
                  <p className="text-sm text-text-secondary leading-relaxed">{worldview.description}</p>
                </div>
                <span
                  className="text-3xl opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
                  style={{ color: worldview.accentColor }}
                >
                  →
                </span>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-8 text-sm text-text-muted text-center max-w-md">
          本测试为娱乐性质，AI 生成内容仅供参考
        </p>
      </div>
    </div>
  );
}
