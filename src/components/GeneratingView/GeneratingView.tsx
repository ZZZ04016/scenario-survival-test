import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

const LOADING_HINTS = [
  '正在为你编织命运...',
  'AI 正在推演你的结局...',
  '前方高能，剧情生成中...',
  '你的选择正在改写命运...',
  '即将揭晓你能活几集...',
  '命运的齿轮开始转动...',
  '各路神仙正在为你排戏...',
];

export function GeneratingView() {
  const { worldview } = useAppStore();
  const [hintIndex, setHintIndex] = useState(() => Math.floor(Math.random() * LOADING_HINTS.length));

  useEffect(() => {
    const timer = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % LOADING_HINTS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 animate-fade-in relative overflow-hidden">
      {/* 背景装饰 */}
      <div
        className="bg-orb animate-float"
        style={{ width: 300, height: 300, top: '30%', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-primary-light)' }}
      />

      <div className="text-center relative z-10">
        <div className="text-8xl mb-8 animate-bounce-in">
          {worldview?.coverEmoji ?? '🎬'}
        </div>

        {/* 旋转光环 */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
            style={{ borderTopColor: 'var(--color-primary)', borderRightColor: 'var(--color-primary-light)' }}
          />
          <div
            className="absolute inset-3 rounded-full border-4 border-transparent animate-spin"
            style={{ borderBottomColor: 'var(--color-accent)', animationDirection: 'reverse', animationDuration: '1.5s' }}
          />
        </div>

        <p
          key={hintIndex}
          className="text-xl font-serif font-medium text-primary animate-fade-in"
        >
          {LOADING_HINTS[hintIndex]}
        </p>
        <p className="text-sm text-text-muted mt-3">AI 正在为你生成专属剧情...</p>
      </div>
    </div>
  );
}
