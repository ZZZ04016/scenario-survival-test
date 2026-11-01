import { describe, it, expect } from 'vitest';
import { buildOriginImagePrompt, hashOriginSeed } from '../promptBuilder';
import type { OriginSetup, Worldview } from '../../types';

const mockWorldview: Worldview = {
  id: 'palace',
  name: '深宫风云',
  tagline: '',
  description: '',
  coverEmoji: '🏯',
  accentColor: '#8B4513',
  bgGradient: '',
  episodeMax: 80,
  seasons: [],
};

const originA: OriginSetup = {
  background: { id: 'palace-noble', name: '世家嫡女', description: '', episodeBonus: 4 },
  talents: [
    { id: 'p-t3', name: '绝色容颜', description: '', rarity: 'legendary', episodeBonus: 4 },
    { id: 'p-t4', name: '玲珑七窍', description: '', rarity: 'epic', episodeBonus: 3 },
    { id: 'p-t8', name: '家世显赫', description: '', rarity: 'epic', episodeBonus: 3 },
  ],
  initialTrait: 'ambitious',
};

const originB: OriginSetup = {
  background: { id: 'palace-maid', name: '浣衣局宫女', description: '', episodeBonus: -2 },
  talents: [
    { id: 'p-t9', name: '体弱多病', description: '', rarity: 'common', episodeBonus: -3 },
    { id: 'p-t10', name: '容貌平平', description: '', rarity: 'common', episodeBonus: -1 },
    { id: 'p-t11', name: '口无遮拦', description: '', rarity: 'rare', episodeBonus: -2 },
  ],
  initialTrait: 'kind',
};

describe('角色生成系统确定性验证', () => {
  it('相同三维度组合生成相同 seed', () => {
    const seed1 = hashOriginSeed(originA);
    const seed2 = hashOriginSeed(originA);
    expect(seed1).toBe(seed2);
    expect(seed1).toBeGreaterThan(0);
    expect(seed1).toBeLessThanOrEqual(1000000);
  });

  it('不同三维度组合生成不同 seed', () => {
    const seedA = hashOriginSeed(originA);
    const seedB = hashOriginSeed(originB);
    expect(seedA).not.toBe(seedB);
  });

  it('天赋顺序不影响 seed（排序后计算）', () => {
    const reordered: OriginSetup = {
      ...originA,
      talents: [originA.talents[2], originA.talents[0], originA.talents[1]],
    };
    expect(hashOriginSeed(reordered)).toBe(hashOriginSeed(originA));
  });

  it('相同组合生成相同提示词', () => {
    const prompt1 = buildOriginImagePrompt(mockWorldview, originA);
    const prompt2 = buildOriginImagePrompt(mockWorldview, originA);
    expect(prompt1).toBe(prompt2);
  });

  it('不同组合生成不同提示词', () => {
    const promptA = buildOriginImagePrompt(mockWorldview, originA);
    const promptB = buildOriginImagePrompt(mockWorldview, originB);
    expect(promptA).not.toBe(promptB);
  });

  it('提示词包含出身背景身份信息', () => {
    const prompt = buildOriginImagePrompt(mockWorldview, originA);
    expect(prompt).toContain('high-ranking official');
  });

  it('提示词包含天赋外貌特征', () => {
    const prompt = buildOriginImagePrompt(mockWorldview, originA);
    expect(prompt).toContain('strikingly beautiful face');
    expect(prompt).toContain('clever perceptive gaze');
  });

  it('提示词包含性格倾向表情', () => {
    const prompt = buildOriginImagePrompt(mockWorldview, originA);
    expect(prompt).toContain('ambitious and intense gaze');
  });

  it('提示词包含负面词（文生图最佳实践）', () => {
    const prompt = buildOriginImagePrompt(mockWorldview, originA);
    expect(prompt).toContain('Negative:');
    expect(prompt).toContain('low quality');
    expect(prompt).toContain('deformed');
  });

  it('提示词包含质量词', () => {
    const prompt = buildOriginImagePrompt(mockWorldview, originA);
    expect(prompt).toContain('8k resolution');
    expect(prompt).toContain('high detail');
  });
});
