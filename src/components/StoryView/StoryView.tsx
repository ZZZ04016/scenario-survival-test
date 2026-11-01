import { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { StorySegment } from '../../types';

const TOTAL_SCENES = 8;

/**
 * 沉浸式剧情推演视图
 *
 * 每个场景都有专属的分支剧情，每个选择都绑定 4 段式后果：
 * 即时事件 → 连锁反应 → 人物互动 → 过渡下一幕
 */
export function StoryView() {
  const {
    worldview,
    storySegments,
    currentScene,
    answeredCount,
    isGeneratingConsequence,
    chooseAction,
    generateEnding,
    error,
  } = useAppStore();

  const scrollRef = useRef<HTMLDivElement>(null);

  // 新片段追加时自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [storySegments, isGeneratingConsequence]);

  if (!worldview) return null;

  const isStoryComplete = !currentScene && answeredCount >= TOTAL_SCENES;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* 顶部极简篇章指示 */}
      <div className="fixed top-0 left-0 right-0 z-40 px-4 py-2.5 backdrop-blur-md"
        style={{ backgroundColor: 'rgba(var(--color-bg-rgb, 255,255,255), 0.8)', borderBottom: '1px solid var(--color-card-border)' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="text-xs text-text-secondary font-medium">{worldview.coverEmoji} {worldview.name}</span>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: TOTAL_SCENES }).map((_, i) => (
                <div key={i} className="h-1 rounded-full transition-all duration-500"
                  style={{
                    width: i < answeredCount ? '12px' : '6px',
                    backgroundColor: i < answeredCount ? 'var(--color-primary)' : 'var(--color-card-border)',
                  }} />
              ))}
            </div>
            <span className="text-xs text-text-secondary">第 {Math.min(answeredCount + (currentScene ? 1 : 0), TOTAL_SCENES)}/{TOTAL_SCENES} 幕</span>
          </div>
        </div>
      </div>

      {/* 剧情滚动区 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6" style={{ paddingTop: '3.5rem', paddingBottom: '1rem' }}>
        <div className="max-w-2xl mx-auto space-y-5">
          {storySegments.map((seg) => (
            <SegmentBubble key={seg.id} segment={seg} />
          ))}

          {/* 正在演绎后果 */}
          {isGeneratingConsequence && (
            <div className="flex justify-start animate-segment-in">
              <div className="card px-4 py-3 text-sm text-text-secondary"
                style={{ background: 'var(--color-primary)08', borderColor: 'var(--color-primary)30' }}>
                <span className="inline-block animate-pulse mr-1">✦</span> 命运正在演绎……
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 底部抉择区 */}
      <div className="shrink-0 border-t px-4 py-4 max-h-[48vh] overflow-y-auto"
        style={{ borderColor: 'var(--color-card-border)', backgroundColor: 'var(--color-card-bg)', boxShadow: '0 -4px 20px rgba(0,0,0,0.04)' }}>
        <div className="max-w-2xl mx-auto">
          {currentScene && !isGeneratingConsequence && (
            <>
              {/* 场景环境 */}
              <div className="mb-2 text-xs text-text-muted italic flex items-center gap-1">
                <span>📍</span> {currentScene.setting}
              </div>

              {/* 角色对话 */}
              {currentScene.dialogue && currentScene.dialogue.length > 0 && (
                <div className="mb-3 space-y-2">
                  {currentScene.dialogue.map((line, i) => (
                    <div key={i} className="text-sm animate-segment-in" style={{ animationDelay: `${i * 0.1}s` }}>
                      <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{line.speaker}：</span>
                      <span className="text-text-secondary">{line.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 当前情境 */}
              <div className="mb-4 p-4 rounded-xl text-sm leading-relaxed animate-segment-in"
                style={{ backgroundColor: 'var(--color-primary)08', border: '1px solid var(--color-primary)25' }}>
                {currentScene.situation}
              </div>

              {/* 行动选项 */}
              <div className="space-y-2.5">
                {currentScene.choices.map((choice, idx) => (
                  <button
                    key={choice.id}
                    onClick={() => chooseAction(choice)}
                    className="option-btn w-full text-left animate-choice-in"
                    style={{ animationDelay: `${idx * 0.08}s` }}
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: 'var(--color-primary)15', color: 'var(--color-primary)' }}>
                      {idx + 1}
                    </span>
                    <span className="text-sm text-text flex-1 leading-relaxed">{choice.text}</span>
                    <span className="text-lg opacity-30 flex-shrink-0">→</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {isGeneratingConsequence && (
            <div className="text-center text-sm text-text-secondary py-6">
              <div className="inline-block animate-pulse text-lg mb-1">⚙️</div>
              命运的齿轮正在转动……
            </div>
          )}

          {/* 剧情完成，生成结局 */}
          {isStoryComplete && !isGeneratingConsequence && (
            <button onClick={generateEnding} className="btn-primary w-full animate-bounce-in">
              见证我的结局 ✨
            </button>
          )}

          {error && (
            <p className="mt-3 text-sm text-center" style={{ color: '#e94560' }}>{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SegmentBubble({ segment }: { segment: StorySegment }) {
  const isOpening = segment.type === 'opening';
  const paragraphs = segment.text.split('\n\n').filter((p) => p.trim());

  return (
    <div className={`flex ${isOpening ? 'justify-center' : 'justify-start'} animate-segment-in`}>
      <div className={`${isOpening ? 'text-center' : ''} max-w-full w-full`}>
        {isOpening ? (
          <div className="card px-5 py-4 text-base leading-relaxed text-text animate-narrative-glow"
            style={{ borderColor: 'var(--color-primary)', borderWidth: '1.5px' }}>
            {segment.text}
          </div>
        ) : (
          <div className="pl-4 border-l-2 space-y-3"
            style={{ borderColor: 'var(--color-primary)50' }}>
            {paragraphs.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-text-secondary"
                style={{ animation: `lineFadeIn 0.4s ease-out ${i * 0.15}s both` }}>
                {p}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
