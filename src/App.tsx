import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { WorldviewSelector } from './components/WorldviewSelector/WorldviewSelector';
import { QuizView } from './components/QuizView/QuizView';
import { GeneratingView } from './components/GeneratingView/GeneratingView';
import { ResultView } from './components/ResultView/ResultView';

const THEME_CLASS_MAP: Record<string, string> = {
  palace: 'theme-palace',
  apocalypse: 'theme-apocalypse',
  cultivation: 'theme-cultivation',
};

function App() {
  const { stage, worldview, generateStory } = useAppStore();

  // 根据世界观切换主题（首页用默认主题）
  useEffect(() => {
    const root = document.documentElement;
    // 移除所有主题类
    Object.values(THEME_CLASS_MAP).forEach((cls) => root.classList.remove(cls));
    root.classList.remove('theme-default');

    if (worldview) {
      const themeClass = THEME_CLASS_MAP[worldview.id];
      if (themeClass) {
        root.classList.add(themeClass);
      }
    } else {
      root.classList.add('theme-default');
    }
  }, [worldview]);

  // 当进入 generating 阶段时，自动触发生成
  useEffect(() => {
    if (stage === 'generating') {
      generateStory();
    }
  }, [stage, generateStory]);

  return (
    <div className="min-h-screen">
      {stage === 'worldview-select' && <WorldviewSelector />}
      {stage === 'quiz' && <QuizView />}
      {stage === 'generating' && <GeneratingView />}
      {(stage === 'result' || stage === 'share') && <ResultView />}
    </div>
  );
}

export default App;
