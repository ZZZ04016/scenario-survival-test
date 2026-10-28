import { describe, it, expect } from 'vitest';
import type { QuizOption } from '../../types';
import {
  calculatePersonalityProfile,
  calculateEpisodesSurvived,
} from '../personality';

const makeOption = (trait: QuizOption['trait']): QuizOption => ({
  id: 'x',
  text: 'test',
  trait,
});

describe('calculatePersonalityProfile', () => {
  it('应该正确统计特质频次并返回主次特质', () => {
    const options = [
      makeOption('cautious'),
      makeOption('cautious'),
      makeOption('cautious'),
      makeOption('scheming'),
      makeOption('scheming'),
      makeOption('kind'),
    ];

    const profile = calculatePersonalityProfile(options);

    expect(profile.primaryTrait).toBe('cautious');
    expect(profile.secondaryTrait).toBe('scheming');
    expect(profile.traitScores.cautious).toBe(3);
    expect(profile.traitScores.scheming).toBe(2);
    expect(profile.traitScores.kind).toBe(1);
  });

  it('当所有特质得分相同时，应按预设顺序返回', () => {
    const options = [
      makeOption('cautious'),
      makeOption('decisive'),
    ];

    const profile = calculatePersonalityProfile(options);

    // 得分相同时按对象 key 顺序，cautious 在 decisive 前面
    expect(profile.primaryTrait).toBe('cautious');
    expect(profile.secondaryTrait).toBe('decisive');
  });

  it('空数组应返回默认特质（cautious 和 decisive）', () => {
    const profile = calculatePersonalityProfile([]);

    expect(profile.primaryTrait).toBe('cautious');
    expect(profile.secondaryTrait).toBe('decisive');
    expect(Object.values(profile.traitScores).every((v) => v === 0)).toBe(true);
  });
});

describe('calculateEpisodesSurvived', () => {
  it('心机+谨慎型应获得较高集数', () => {
    const profile = calculatePersonalityProfile([
      makeOption('scheming'),
      makeOption('scheming'),
      makeOption('cautious'),
      makeOption('cautious'),
      makeOption('decisive'),
    ]);

    const episodes = calculateEpisodesSurvived(profile);
    expect(episodes).toBeGreaterThan(40);
    expect(episodes).toBeLessThanOrEqual(80);
  });

  it('善良+忠诚型应获得较低集数', () => {
    const profile = calculatePersonalityProfile([
      makeOption('kind'),
      makeOption('kind'),
      makeOption('kind'),
      makeOption('loyal'),
      makeOption('loyal'),
    ]);

    const episodes = calculateEpisodesSurvived(profile);
    expect(episodes).toBeLessThan(40);
    expect(episodes).toBeGreaterThanOrEqual(1);
  });

  it('集数应在 1-80 范围内', () => {
    const profile = calculatePersonalityProfile([
      makeOption('ambitious'),
      makeOption('ambitious'),
      makeOption('ambitious'),
      makeOption('ambitious'),
      makeOption('ambitious'),
    ]);

    const episodes = calculateEpisodesSurvived(profile);
    expect(episodes).toBeGreaterThanOrEqual(1);
    expect(episodes).toBeLessThanOrEqual(80);
  });
});
