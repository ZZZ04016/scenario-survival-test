import { describe, it, expect } from 'vitest';
import type { QuizOption, Season } from '../../types';
import {
  calculatePersonalityProfile,
  calculateEpisodesSurvived,
  mapEpisodesToSeason,
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

  it('自定义 episodeMax 时集数应在 [1, episodeMax] 范围内', () => {
    const profile = calculatePersonalityProfile([
      makeOption('scheming'),
      makeOption('scheming'),
      makeOption('cautious'),
      makeOption('cautious'),
    ]);

    // 末日题材上限 24
    const apocEpisodes = calculateEpisodesSurvived(profile, 24);
    expect(apocEpisodes).toBeGreaterThanOrEqual(1);
    expect(apocEpisodes).toBeLessThanOrEqual(24);

    // 修仙题材上限 120
    const culEpisodes = calculateEpisodesSurvived(profile, 120);
    expect(culEpisodes).toBeGreaterThanOrEqual(1);
    expect(culEpisodes).toBeLessThanOrEqual(120);
  });

  it('相同性格在不同上限下应保持相对位置（权谋型接近上限）', () => {
    const profile = calculatePersonalityProfile([
      makeOption('scheming'),
      makeOption('scheming'),
      makeOption('cautious'),
      makeOption('cautious'),
    ]);

    const ep80 = calculateEpisodesSurvived(profile, 80);
    const ep24 = calculateEpisodesSurvived(profile, 24);
    const ep120 = calculateEpisodesSurvived(profile, 120);

    // 权谋型在三个世界观都应接近各自上限
    expect(ep80).toBeGreaterThan(80 * 0.7);
    expect(ep24).toBeGreaterThan(24 * 0.7);
    expect(ep120).toBeGreaterThan(120 * 0.7);
  });
});

describe('mapEpisodesToSeason', () => {
  const seasons: Season[] = [
    { name: '一季·入宫', startEpisode: 1, endEpisode: 20 },
    { name: '二季·争宠', startEpisode: 21, endEpisode: 45 },
    { name: '三季·夺嫡', startEpisode: 46, endEpisode: 70 },
    { name: '四季·登顶', startEpisode: 71, endEpisode: 80 },
  ];

  it('应正确映射到对应季', () => {
    expect(mapEpisodesToSeason(10, seasons).season.name).toBe('一季·入宫');
    expect(mapEpisodesToSeason(30, seasons).season.name).toBe('二季·争宠');
    expect(mapEpisodesToSeason(60, seasons).season.name).toBe('三季·夺嫡');
    expect(mapEpisodesToSeason(75, seasons).season.name).toBe('四季·登顶');
  });

  it('边界集数应落在正确季内', () => {
    expect(mapEpisodesToSeason(20, seasons).season.name).toBe('一季·入宫');
    expect(mapEpisodesToSeason(21, seasons).season.name).toBe('二季·争宠');
    expect(mapEpisodesToSeason(80, seasons).season.name).toBe('四季·登顶');
  });

  it('超出范围时回退到最后一季', () => {
    const result = mapEpisodesToSeason(999, seasons);
    expect(result.season.name).toBe('四季·登顶');
    expect(result.index).toBe(3);
  });

  it('季内进度应在 0-1 之间', () => {
    const { progress } = mapEpisodesToSeason(30, seasons); // 二季 21-45，第10集/25集
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(1);
  });
});
