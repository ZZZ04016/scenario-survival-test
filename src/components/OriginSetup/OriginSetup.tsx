import { useState, useEffect, useMemo } from 'react';
import type { OriginBackground, PersonalityTrait, TalentCard } from '../../types';
import { TRAIT_LABELS } from '../../types';
import { getOriginData, rollBackground, rollTalents, RARITY_STYLES } from '../../data/origins';
import { useAppStore } from '../../store/useAppStore';

const ALL_TRAITS: PersonalityTrait[] = ['cautious', 'decisive', 'scheming', 'kind', 'ambitious', 'loyal'];

// 性格倾向的神秘注解（增加神秘感，不直接说明效果）
const TRAIT_MYSTERY: Record<PersonalityTrait, string> = {
  cautious: '如履薄冰，步步为营',
  decisive: '当机立断，破釜沉舟',
  scheming: '运筹帷幄，深藏不露',
  kind: '心怀慈悲，以柔克刚',
  ambitious: '鸿鹄之志，志在问鼎',
  loyal: '一诺千金，肝胆相照',
};

// 命运签文
const FORTUNE_PHRASES = [
  '天机初现',
  '星象指引',
  '命数已显',
  '卦象所示',
  '运势所归',
  '玄机暗伏',
  '命由天定',
  '气数使然',
];

// 根据预估集数生成神秘命运描述（不暴露具体数字）
function getFortuneDescription(mid: number, max: number): { level: string; hint: string } {
  const ratio = mid / max;
  if (ratio <= 0.15) return { level: '大凶之兆', hint: '命途多舛，步步惊心，稍有不慎便万劫不复' };
  if (ratio <= 0.3) return { level: '凶多吉少', hint: '前路崎岖，危机四伏，需谨小慎微方能苟全' };
  if (ratio <= 0.5) return { level: '吉凶参半', hint: '运势浮沉不定，祸福相依，全凭一念之间' };
  if (ratio <= 0.7) return { level: '运势渐通', hint: '紫气初现，虽有波折，终能化险为夷' };
  if (ratio <= 0.85) return { level: '福泽深厚', hint: '气运亨通，贵人相助，可成就一番事业' };
  return { level: '天命所归', hint: '命格尊贵，福泽绵长，非常人所能及也' };
}

/** 随机抽取 3 个不重复天赋 */
function pickRandomTalents(pool: TalentCard[], count = 3): TalentCard[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function OriginSetup() {
  const { worldview, setOriginSetup } = useAppStore();
  const originData = worldview ? getOriginData(worldview.id) : null;

  // 出身背景
  const [bgMode, setBgMode] = useState<'random' | 'manual'>('random');
  const [background, setBackground] = useState<OriginBackground | null>(() => originData ? rollBackground(originData.backgrounds) : null);
  const [isRolling, setIsRolling] = useState(false);

  // 天赋：随机抽取模式
  const [talentPool, setTalentPool] = useState<TalentCard[]>(() => originData ? rollTalents(originData.talents) : []);
  const [selectedTalents, setSelectedTalents] = useState<TalentCard[]>([]);
  const [expandedTalentId, setExpandedTalentId] = useState<string | null>(null);

  // 性格倾向
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

  // 命运推演（神秘化，不暴露具体集数）
  const { fortuneLevel, fortuneHint, fortunePhrase } = useMemo(() => {
    if (!worldview || !background) return { fortuneLevel: '', fortuneHint: '', fortunePhrase: '' };
    const talentBonus = selectedTalents.reduce((s, t) => s + t.episodeBonus, 0);
    const base = Math.max(3, worldview.episodeMax * 0.2) + background.episodeBonus + talentBonus + 2;
    const mid = Math.max(3, Math.min(worldview.episodeMax, Math.round(base)));
    const { level, hint } = getFortuneDescription(mid, worldview.episodeMax);
    const phrase = FORTUNE_PHRASES[Math.floor(Math.random() * FORTUNE_PHRASES.length)];
    return { fortuneLevel: level, fortuneHint: hint, fortunePhrase: phrase };
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
    setTalentPool(rollTalents(originData.talents));
    setSelectedTalents([]);
    setExpandedTalentId(null);
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
    setExpandedTalentId(null);
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
            命运推演 · 出身设定
          </div>
          <h1 className="text-3xl font-serif font-bold text-text mb-2">命由己造，运由天定</h1>
          <p className="text-sm text-text-secondary">
            选择你的起点，未知的命运正在等待
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
              >手动</button>
            </div>
          </div>

          {bgMode === 'random' ? (
            <>
              <div className={`rounded-xl p-4 border-2 transition-all mb-3 ${isRolling ? 'animate-pulse' : ''}`}
                style={{ borderColor: `${worldview.accentColor}40`, background: `${worldview.accentColor}08` }}>
                <h3 className="text-xl font-bold mb-2" style={{ color: worldview.accentColor }}>{background.name}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{background.description}</p>
              </div>
              <button onClick={rerollBackground} disabled={isRolling}
                className="w-full py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.01] disabled:opacity-50"
                style={accentBtn}>
                {isRolling ? '🎲 命运转动中…' : '🔄 改换出身'}
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

        {/* 天赋抽取 - 简洁版 */}
        <div className="card p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold" style={{ color: worldview.accentColor }}>✨ 天赋</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                十中取三，命也
              </p>
            </div>
          </div>

          {/* 已选天赋 - 紧凑标签 */}
          <div className="flex gap-2 mb-3">
            {[0, 1, 2].map((i) => {
              const t = selectedTalents[i];
              if (!t) {
                return (
                  <div key={i} className="flex-1 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400 py-1.5">
                    空位
                  </div>
                );
              }
              const style = RARITY_STYLES[t.rarity];
              return (
                <div key={t.id} className="flex-1 rounded-md px-2 py-1.5 text-center"
                  style={{ background: style.bg, border: `1px solid ${style.color}50` }}>
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
              🔀 换一组
            </button>
            <button onClick={randomPickTalents}
              className="flex-1 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-[1.01]"
              style={{ background: worldview.accentColor }}>
              🎲 天命所选
            </button>
          </div>

          {/* 天赋池 - 简洁卡片，点击展开描述 */}
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {talentPool.map((t) => {
              const style = RARITY_STYLES[t.rarity];
              const isSelected = selectedTalents.some((s) => s.id === t.id);
              const disabled = !isSelected && selectedTalents.length >= 3;
              const isExpanded = expandedTalentId === t.id;
              return (
                <button key={t.id}
                  onClick={() => { if (!disabled) { toggleTalent(t); setExpandedTalentId(isExpanded ? null : t.id); } }}
                  disabled={disabled}
                  className={`text-left rounded-lg p-2 border transition-all ${isSelected ? 'ring-2' : 'hover:scale-[1.01]'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  style={{
                    background: isSelected ? style.bg : '#fff',
                    borderColor: isSelected ? style.color : '#e5e7eb',
                  }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold" style={{ color: style.color }}>{t.name}</span>
                    <span className="text-[9px] px-1 py-0.5 rounded" style={{ background: style.bg, color: style.color }}>
                      {style.label}
                    </span>
                  </div>
                  {/* 描述默认隐藏，选中时才显示（增加神秘感） */}
                  {isExpanded && (
                    <p className="text-[11px] text-text-secondary leading-snug mt-1 pt-1 border-t border-gray-100">
                      {t.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 性格倾向 - 简洁神秘版 */}
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold" style={{ color: worldview.accentColor }}>🎭 心性</h2>
            <div className="flex gap-1.5">
              <button onClick={() => setTraitMode('manual')}
                className="text-xs px-2.5 py-1 rounded-md font-medium transition-all"
                style={traitMode === 'manual' ? accentBtnActive : accentBtn}>自选</button>
              <button onClick={() => { setTraitMode('random'); randomPickTrait(); }}
                className="text-xs px-2.5 py-1 rounded-md font-medium transition-all"
                style={traitMode === 'random' ? accentBtnActive : accentBtn}>天命</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ALL_TRAITS.map((trait) => {
              const isSelected = initialTrait === trait;
              return (
                <button key={trait} onClick={() => setInitialTrait(trait)}
                  className={`py-2.5 px-2 rounded-lg text-center border-2 transition-all ${isSelected ? 'scale-105 shadow-md' : 'hover:scale-[1.02]'}`}
                  style={{
                    background: isSelected ? worldview.accentColor : '#fff',
                    color: isSelected ? '#fff' : worldview.accentColor,
                    borderColor: worldview.accentColor,
                  }}>
                  <div className="text-sm font-bold">{TRAIT_LABELS[trait]}</div>
                  <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-text-muted'}`}>
                    {TRAIT_MYSTERY[trait]}
                  </div>
                </button>
              );
            })}
          </div>
          {traitMode === 'random' && initialTrait && (
            <p className="text-xs text-text-muted mt-2 text-center italic">
              「{TRAIT_LABELS[initialTrait]}」—— 此乃天命所归
            </p>
          )}
        </div>

        {/* 命运推演 + 开始按钮 */}
        <div className="sticky bottom-4">
          <div className="card p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-xs flex items-center gap-1.5 mb-1" style={{ color: worldview.accentColor }}>
                <span className="animate-pulse">🔮</span>
                <span className="font-medium">{fortunePhrase} · {fortuneLevel}</span>
              </div>
              <div className="text-sm text-text-secondary leading-snug line-clamp-2">
                {fortuneHint}
              </div>
            </div>
            <button onClick={handleStart} disabled={!canStart}
              className={`px-6 py-3 rounded-xl font-bold text-white transition-all shrink-0 ${canStart ? 'hover:scale-105 active:scale-95 shadow-lg' : 'opacity-40 cursor-not-allowed'}`}
              style={{ background: worldview.accentColor }}>
              {canStart ? '⚔️ 推演命运' : `还差${selectedTalents.length < 3 ? ` ${3 - selectedTalents.length}天赋` : ''}${!initialTrait ? ' 心性' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
