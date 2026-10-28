import { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getQuestions } from '../../data/questions';
import type { WorldviewId } from '../../types';

export function QuizView() {
  const {
    worldview,
    tier,
    currentQuestionIndex,
    selectedOptions,
    selectOption,
    goToNextQuestion,
    goToPrevQuestion,
    error,
  } = useAppStore();

  const questions = useMemo(() => {
    if (!worldview) return [];
    const all = getQuestions(worldview.id as WorldviewId);
    return tier === 'trial' ? all.slice(0, 5) : all;
  }, [worldview, tier]);

  const currentQuestion = questions[currentQuestionIndex];
  const currentSelection = selectedOptions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (!worldview || !currentQuestion) return null;

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 animate-fade-in">
      {/* 顶部进度 */}
      <div className="max-w-2xl w-full mx-auto">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={goToPrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="text-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← 返回
          </button>
          <span className="text-sm text-primary font-medium">
            {currentQuestionIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-card-border)' }}>
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{ width: `${progress}%`, backgroundColor: 'var(--color-primary)' }}
          />
        </div>
      </div>

      {/* 题目 */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="card p-6 md:p-8 animate-slide-up">
            <div className="text-3xl mb-4">{worldview.coverEmoji}</div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-text mb-6 leading-relaxed">
              {currentQuestion.text}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={option.id}
                  onClick={() => selectOption(option)}
                  className={`option-btn ${
                    currentSelection?.id === option.id ? 'option-btn-selected' : ''
                  }`}
                >
                  <span
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                    style={{
                      backgroundColor: currentSelection?.id === option.id ? 'var(--color-primary)' : 'var(--color-bg)',
                      color: currentSelection?.id === option.id ? 'var(--color-btn-text)' : 'var(--color-text-secondary)',
                      border: '1px solid var(--color-card-border)',
                    }}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="font-medium text-text">{option.text}</span>
                </button>
              ))}
            </div>

            {error && (
              <p className="mt-4 text-sm text-center" style={{ color: '#e94560' }}>{error}</p>
            )}
          </div>

          {/* 下一步按钮 */}
          <button
            onClick={goToNextQuestion}
            disabled={!currentSelection}
            className="btn-primary w-full mt-5"
          >
            {isLastQuestion ? '生成我的剧情 ✨' : '下一题 →'}
          </button>
        </div>
      </div>
    </div>
  );
}
