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
      {/* 顶部极简篇章指示（固定，不占文档流） */}
      <div className="fixed top-0 left-0 right-0 z-40 px-4 py-2 backdrop-blur-md"
        style={{ backgroundColor: 'rgba(var(--color-bg-rgb, 255,255,255), 0.85)', borderBottom: '1px solid var(--color-card-border)' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="text-xs text-text-secondary">{worldview.coverEmoji} {worldview.name}</span>
          <span className="text-xs text-text-secondary">第 {Math.min(answeredCount + (currentScene ? 1 : 0), TOTAL_SCENES)} 幕 / {TOTAL_SCENES}</span>
        </div>
      </div>

      {/* 剧情滚动区：flex-1 占据剩余高度，内部独立滚动，不影响底部抉择区 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6" style={{ paddingTop: '3rem', paddingBottom: '1rem' }}>
        <div className="max-w-2xl mx-auto space-y-4">
          {storySegments.map((seg) => (
            <SegmentBubble key={seg.id} segment={seg} />
          ))}

          {/* 正在演绎后果 */}
          {isGeneratingConsequence && (
            <div className="flex justify-start">
              <div className="card px-4 py-3 text-sm text-text-secondary animate-pulse">
                <span className="inline-block">✦</span> 命运正在演绎……
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 底部抉择区：固定在视口底部，不随剧情内容滚动 */}
      <div className="shrink-0 border-t px-4 py-4 max-h-[45vh] overflow-y-auto"
        style={{ borderColor: 'var(--color-card-border)', backgroundColor: 'var(--color-bg)' }}>
        <div className="max-w-2xl mx-auto">
          {currentScene && !isGeneratingConsequence && (
            <>
              {/* 场景环境 */}
              <div className="mb-2 text-xs text-text-secondary italic">
                📍 {currentScene.setting}
              </div>

              {/* 角色对话（如有） */}
              {currentScene.dialogue && currentScene.dialogue.length > 0 && (
                <div className="mb-3 space-y-1.5">
                  {currentScene.dialogue.map((line, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{line.speaker}：</span>
                      <span className="text-text-secondary">{line.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 当前情境 */}
              <div className="mb-3 p-4 rounded-xl text-sm leading-relaxed"
                style={{ backgroundColor: 'var(--color-primary)08', border: '1px solid var(--color-primary)25' }}>
                {currentScene.situation}
              </div>

              {/* 行动选项 */}
              <div className="space-y-2">
                {currentScene.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => chooseAction(choice)}
                    className="option-btn w-full text-left"
                  >
                    <span className="text-sm text-text flex-1">{choice.text}</span>
                    <span className="text-lg opacity-40">→</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {isGeneratingConsequence && (
            <div className="text-center text-sm text-text-secondary py-4">
              命运的齿轮正在转动……
            </div>
          )}

          {/* 剧情完成，生成结局 */}
          {isStoryComplete && !isGeneratingConsequence && (
            <button onClick={generateEnding} className="btn-primary w-full">
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

  // 将换行的后果叙事按段落渲染
  const paragraphs = segment.text.split('\n\n').filter((p) => p.trim());

  return (
    <div className={`flex ${isOpening ? 'justify-center' : 'justify-start'}`}>
      <div className={`${isOpening ? 'text-center' : ''} max-w-full`}>
        {isOpening ? (
          <div className="card px-5 py-4 text-base leading-relaxed text-text"
            style={{ borderColor: 'var(--color-primary)' }}>
            {segment.text}
          </div>
        ) : (
          <div className="pl-3 border-l-2 space-y-3"
            style={{ borderColor: 'var(--color-primary)50' }}>
            {paragraphs.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-text-secondary">{p}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
