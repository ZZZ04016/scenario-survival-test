import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

const LOADING_HINTS = [
  '正在为你编织命运...',
  'AI 正在推演你的结局...',
  '前方高能，剧情生成中...',
  '你的选择正在改写命运...',
  '即将揭晓你能活几集...',
];

export function GeneratingView() {
  const { worldview } = useAppStore();
  const [randomHint] = useState(
    () => LOADING_HINTS[Math.floor(Math.random() * LOADING_HINTS.length)],
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 animate-fade-in">
      <div className="text-center">
        <div className="text-7xl mb-6 animate-pulse-slow">
          {worldview?.coverEmoji ?? '🎬'}
        </div>
        <div className="flex justify-center gap-2 mb-6">
          <span
            className="w-3 h-3 rounded-full animate-bounce"
            style={{ backgroundColor: 'var(--color-primary-light)', animationDelay: '0ms' }}
          />
          <span
            className="w-3 h-3 rounded-full animate-bounce"
            style={{ backgroundColor: 'var(--color-primary)', animationDelay: '150ms' }}
          />
          <span
            className="w-3 h-3 rounded-full animate-bounce"
            style={{ backgroundColor: 'var(--color-primary-hover)', animationDelay: '300ms' }}
          />
        </div>
        <p className="text-xl font-serif text-primary">{randomHint}</p>
        <p className="text-sm text-text-muted mt-3">大约需要 10-20 秒</p>
      </div>
    </div>
  );
}
