import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { WorldviewSelector } from './components/WorldviewSelector/WorldviewSelector';
import { GenderSelect } from './components/GenderSelect/GenderSelect';
import { OriginSetup } from './components/OriginSetup/OriginSetup';
import { StoryView } from './components/StoryView/StoryView';
import { GeneratingView } from './components/GeneratingView/GeneratingView';
import { ResultView } from './components/ResultView/ResultView';
import { useNetworkStatus } from './hooks/useNetworkStatus';

const THEME_CLASS_MAP: Record<string, string> = {
  palace: 'theme-palace',
  apocalypse: 'theme-apocalypse',
  cultivation: 'theme-cultivation',
};

function App() {
  const { stage, worldview, generateEnding } = useAppStore();
  const online = useNetworkStatus();

  // 根据世界观切换主题（首页用默认主题）
  useEffect(() => {
    const root = document.documentElement;
    Object.values(THEME_CLASS_MAP).forEach((cls) => root.classList.remove(cls));
    root.classList.remove('theme-default');

    if (worldview) {
      const themeClass = THEME_CLASS_MAP[worldview.id];
      if (themeClass) root.classList.add(themeClass);
    } else {
      root.classList.add('theme-default');
    }
  }, [worldview]);

  // 当进入 generating 阶段时，自动触发生成结局
  useEffect(() => {
    if (stage === 'generating') {
      generateEnding();
    }
  }, [stage, generateEnding]);

  return (
    <div className="min-h-screen">
      {/* 离线状态指示器 */}
      {!online && (
        <div
          className="fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center text-sm font-medium"
          style={{ backgroundColor: '#e67e22', color: '#fff' }}
        >
          📴 离线模式 — 剧情将使用本地叙事模板生成
        </div>
      )}
      {stage === 'worldview-select' && <WorldviewSelector />}
      {stage === 'gender-select' && <GenderSelect />}
      {stage === 'origin-setup' && <OriginSetup />}
      {stage === 'story' && <StoryView />}
      {stage === 'generating' && <GeneratingView />}
      {(stage === 'result' || stage === 'share') && <ResultView />}
    </div>
  );
}

export default App;
