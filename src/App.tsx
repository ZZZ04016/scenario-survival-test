import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { WorldviewSelector } from './components/WorldviewSelector/WorldviewSelector';
import { ImageUploadView } from './components/ImageUploadView/ImageUploadView';
import { QuizView } from './components/QuizView/QuizView';
import { GeneratingView } from './components/GeneratingView/GeneratingView';
import { ResultView } from './components/ResultView/ResultView';
import { useNetworkStatus } from './hooks/useNetworkStatus';

const THEME_CLASS_MAP: Record<string, string> = {
  palace: 'theme-palace',
  apocalypse: 'theme-apocalypse',
  cultivation: 'theme-cultivation',
};

function App() {
  const { stage, worldview, generateStory } = useAppStore();
  const online = useNetworkStatus();

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
      {/* 离线状态指示器 */}
      {!online && (
        <div
          className="fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center text-sm font-medium"
          style={{ backgroundColor: '#e67e22', color: '#fff' }}
        >
          📴 离线模式 — 所有功能仍可正常使用（剧情与图片将使用本地生成）
        </div>
      )}
      {stage === 'worldview-select' && <WorldviewSelector />}
      {stage === 'image-upload' && <ImageUploadView />}
      {stage === 'quiz' && <QuizView />}
      {stage === 'generating' && <GeneratingView />}
      {(stage === 'result' || stage === 'share') && <ResultView />}
    </div>
  );
}

export default App;
