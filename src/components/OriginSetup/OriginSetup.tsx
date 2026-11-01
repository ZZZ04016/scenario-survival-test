import { useState, useEffect, useMemo } from 'react';
import type { OriginBackground, PersonalityTrait, TalentCard } from '../../types';
import { TRAIT_LABELS } from '../../types';
import { getOriginData, rollBackground, rollTalents, RARITY_STYLES } from '../../data/origins';
import { useAppStore } from '../../store/useAppStore';

const ALL_TRAITS: PersonalityTrait[] = ['cautious', 'decisive', 'scheming', 'kind', 'ambitious', 'loyal'];

/** 随机抽取 3 个不重复天赋 */
function pickRandomTalents(pool: TalentCard[], count = 3): TalentCard[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function OriginSetup() {
  const { worldview, setOriginSetup } = useAppStore();
  const originData = worldview ? getOriginData(worldview.id) : null;

  // 出身背景：支持随机和手动两种模式
  const [bgMode, setBgMode] = useState<'random' | 'manual'>('random');
  const [background, setBackground] = useState<OriginBackground | null>(() => originData ? rollBackground(originData.backgrounds) : null);
  const [isRolling, setIsRolling] = useState(false);

  // 天赋：支持随机抽取和手动选择两种模式
  const [talentMode, setTalentMode] = useState<'random' | 'manual'>('random');
  const [talentPool, setTalentPool] = useState<TalentCard[]>(() => originData ? rollTalents(originData.talents) : []);
  const [selectedTalents, setSelectedTalents] = useState<TalentCard[]>([]);

  // 性格倾向：支持手动选择和随机选择
  const [traitMode, setTraitMode] = useState<'manual' | 'random'>('manual');
  const [initialTrait, setInitialTrait] = useState<PersonalityTrait | null>(null);

  // 世界观切换时重置
  useEffect(() => {
    if (originData) {
      setBackground(rollBackground(originData.backgrounds));
      setTalentPool(rollTalents(originData.talents));
      setSelectedTalents([]);
      setInitialTrait(null);
    }
  }, [worldview?.id]);

  // 计算预估初始集数
  const estimatedEpisodes = useMemo(() => {
    if (!worldview || !background) return 0;
    const talentBonus = selectedTalents.reduce((s, t) => s + t.episodeBonus, 0);
    const base = Math.max(1, worldview.episodeMax * 0.1) + background.episodeBonus + talentBonus;
    return Math.max(1, Math.min(worldview.episodeMax, Math.round(base)));
  }, [worldview, background, selectedTalents]);

  if (!worldview || !originData || !background) return null;

  const canStart = selectedTalents.length === 3 && initialTrait !== null;

  // ========== 出身背景操作 ==========
  const rerollBackground = () => {
    setIsRolling(true);
    setTimeout(() => {
      setBackground(rollBackground(originData.backgrounds));
      setIsRolling(false);
    }, 300);
  };

  const selectBackground = (bg: OriginBackground) => {
    setBackground(bg);
  };

  // ========== 天赋操作 ==========
  const rerollTalents = () => {
    if (talentMode === 'manual') {
      // 手动模式：展示全部天赋
      setTalentPool(originData.talents);
    } else {
      setTalentPool(rollTalents(originData.talents));
    }
    setSelectedTalents([]);
  };

  const toggleTalent = (talent: TalentCard) => {
    setSelectedTalents((prev) => {
      const exists = prev.find((t) => t.id === talent.id);
      if (exists) {
        return prev.filter((t) => t.id !== talent.id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, talent];
    });
  };

  const randomPickTalents = () => {
    const picked = pickRandomTalents(originData.talents, 3);
    setSelectedTalents(picked);
  };

  // ========== 性格倾向操作 ==========
  const randomPickTrait = () => {
    const idx = Math.floor(Math.random() * ALL_TRAITS.length);
    setInitialTrait(ALL_TRAITS[idx]);
  };

  const handleStart = () => {
    if (!canStart || !background) return;
    setOriginSetup({
      background,
      talents: selectedTalents,
      initialTrait: initialTrait as PersonalityTrait,
    });
  };

  const accentBtn = { background: `${worldview.accentColor}15`, color: worldview.accentColor };
  const accentBtnActive = { background: worldview.accentColor, color: '#fff' };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 animate-fade-in"
      style={{ background: `linear-gradient(180deg, ${worldview.accentColor}08, transparent)` }}>
      <div className="w-full max-w-2xl">
        {/* 标题 */}
        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
            style={{ background: `${worldview.accentColor}18`, color: worldview.accentColor }}>
            出身设定 · 随机 / 手动 双模式
          </div>
          <h1 className="text-3xl font-serif font-bold text-text mb-2">你的命运起点</h1>
          <p className="text-sm text-text-secondary">
            每个维度都可以自己选择，也可以让命运随机决定
          </p>
        </div>

        {/* 出身背景 */}
        <div className="card p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold" style={{ color: worldview.accentColor }}>
              🎲 出身背景
            </h2>
            <div className="flex gap-1.5">
              <button
                onClick={() => setBgMode('random')}
                className="text-xs px-2.5 py-1 rounded-md font-medium transition-all"
                style={bgMode === 'random' ? accentBtnActive : accentBtn}
              >随机</button>
              <button
                onClick={() => setBgMode('manual')}
                className="text-xs px-2.5 py-1 rounded-md font-medium transition-all"
                style={bgMode === 'manual' ? accentBtnActive : accentBtn}
              >手动选择</button>
            </div>
          </div>

          {bgMode === 'random' ? (
            <>
              <div className={`rounded-xl p-4 border-2 transition-all mb-3 ${isRolling ? 'animate-pulse' : ''}`}
                style={{ borderColor: `${worldview.accentColor}40`, background: `${worldview.accentColor}08` }}>
                <h3 className="text-xl font-bold mb-2" style={{ color: worldview.accentColor }}>{background.name}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{background.description}</p>
                <div className="mt-2 text-[11px] text-text-muted italic">命运的伏笔，唯有走过方知深浅…</div>
              </div>
              <button onClick={rerollBackground} disabled={isRolling}
                className="w-full py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.01] disabled:opacity-50"
                style={accentBtn}>
                {isRolling ? '🎲 重掷中…' : '🔄 换一个出身'}
              </button>
            </>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {originData.backgrounds.map((bg) => {
                const isSelected = background.id === bg.id;
                return (
                  <button key={bg.id} onClick={() => selectBackground(bg)}
                    className={`w-full text-left rounded-lg p-3 border-2 transition-all ${isSelected ? 'scale-[1.01]' : 'hover:scale-[1.01]'}`}
                    style={{
                      background: isSelected ? `${worldview.accentColor}08` : '#fff',
                      borderColor: isSelected ? worldview.accentColor : '#e5e7eb',
                    }}>
                    <span className="font-bold block mb-1" style={{ color: isSelected ? worldview.accentColor : '#333' }}>{bg.name}</span>
                    <p className="text-xs text-text-secondary leading-relaxed">{bg.description}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 天赋抽取 */}
        <div className="card p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold" style={{ color: worldview.accentColor }}>✨ 天赋抽取</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {talentMode === 'random' ? '从随机 10 张中选择 3 张' : '从全部天赋中选择 3 张'}
              </p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => { setTalentMode('random'); setTalentPool(rollTalents(originData.talents)); setSelectedTalents([]); }}
                className="text-xs px-2.5 py-1 rounded-md font-medium transition-all"
                style={talentMode === 'random' ? accentBtnActive : accentBtn}>随机池</button>
              <button onClick={() => { setTalentMode('manual'); setTalentPool(originData.talents); setSelectedTalents([]); }}
                className="text-xs px-2.5 py-1 rounded-md font-medium transition-all"
                style={talentMode === 'manual' ? accentBtnActive : accentBtn}>全部</button>
            </div>
          </div>

          {/* 已选天赋 */}
          <div className="flex gap-2 mb-3 min-h-[2.5rem]">
            {[0, 1, 2].map((i) => {
              const t = selectedTalents[i];
              if (!t) {
                return (
                  <div key={i} className="flex-1 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400 py-2">
                    空槽位 {i + 1}
                  </div>
                );
              }
              const style = RARITY_STYLES[t.rarity];
              return (
                <div key={t.id} className="flex-1 rounded-lg px-2 py-1.5 text-center"
                  style={{ background: style.bg, border: `1px solid ${style.color}40` }}>
                  <div className="text-xs font-bold" style={{ color: style.color }}>{t.name}</div>
                </div>
              );
            })}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 mb-3">
            <button onClick={rerollTalents}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.01]"
              style={accentBtn}>
              🔀 {talentMode === 'manual' ? '重置' : '换一组'}
            </button>
            <button onClick={randomPickTalents}
              className="flex-1 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-[1.01]"
              style={{ background: worldview.accentColor }}>
              🎲 随机选 3 个
            </button>
          </div>

          {/* 天赋池 */}
          <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
            {talentPool.map((t) => {
              const style = RARITY_STYLES[t.rarity];
              const isSelected = selectedTalents.some((s) => s.id === t.id);
              const disabled = !isSelected && selectedTalents.length >= 3;
              return (
                <button key={t.id} onClick={() => toggleTalent(t)} disabled={disabled}
                  className={`text-left rounded-lg p-2.5 border transition-all ${isSelected ? 'ring-2 ring-offset-1' : 'hover:scale-[1.02]'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  style={{
                    background: isSelected ? style.bg : '#fff',
                    borderColor: isSelected ? style.color : '#e5e7eb',
                    boxShadow: isSelected ? `0 0 0 2px ${style.color}, 0 0 0 4px #fff` : 'none',
                  }}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-bold" style={{ color: style.color }}>{t.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: style.bg, color: style.color }}>
                      {style.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-snug">{t.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 性格倾向 */}
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold" style={{ color: worldview.accentColor }}>🎭 初始性格倾向</h2>
            <div className="flex gap-1.5">
              <button onClick={() => setTraitMode('manual')}
                className="text-xs px-2.5 py-1 rounded-md font-medium transition-all"
                style={traitMode === 'manual' ? accentBtnActive : accentBtn}>手动</button>
              <button onClick={() => { setTraitMode('random'); randomPickTrait(); }}
                className="text-xs px-2.5 py-1 rounded-md font-medium transition-all"
                style={traitMode === 'random' ? accentBtnActive : accentBtn}>随机</button>
            </div>
          </div>
          <p className="text-xs text-text-secondary mb-3">
            选择你的处事风格倾向（不锁死后续走向，仅影响开局定位）
          </p>
          <div className="grid grid-cols-3 gap-2">
            {ALL_TRAITS.map((trait) => {
              const isSelected = initialTrait === trait;
              return (
                <button key={trait} onClick={() => setInitialTrait(trait)}
                  className={`py-2.5 px-3 rounded-lg text-sm font-medium border-2 transition-all ${isSelected ? 'scale-105 shadow-md' : 'hover:scale-[1.02]'}`}
                  style={{
                    background: isSelected ? worldview.accentColor : '#fff',
                    color: isSelected ? '#fff' : worldview.accentColor,
                    borderColor: worldview.accentColor,
                  }}>
                  {TRAIT_LABELS[trait]}
                </button>
              );
            })}
          </div>
          {traitMode === 'random' && initialTrait && (
            <p className="text-xs text-text-muted mt-2 text-center">
              🎲 命运为你选择了「{TRAIT_LABELS[initialTrait]}」
            </p>
          )}
        </div>

        {/* 预估集数 + 开始按钮 */}
        <div className="sticky bottom-4">
          <div className="card p-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-text-secondary">预估初始集数</div>
              <div className="text-2xl font-bold" style={{ color: worldview.accentColor }}>
                {estimatedEpisodes}
                <span className="text-sm font-normal text-text-secondary"> / {worldview.episodeMax}</span>
              </div>
            </div>
            <button onClick={handleStart} disabled={!canStart}
              className={`px-6 py-3 rounded-xl font-bold text-white transition-all ${canStart ? 'hover:scale-105 active:scale-95 shadow-lg' : 'opacity-40 cursor-not-allowed'}`}
              style={{ background: worldview.accentColor }}>
              {canStart ? '⚔️ 开始命运推演' : `还需选择 ${3 - selectedTalents.length} 个天赋${!initialTrait ? ' + 性格倾向' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
